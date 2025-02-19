class CryptoAPI {
  encodeUint8Array2b64(uint8array) {
    return Buffer.from(uint8array).toString("base64");
  }

  decodeByteB642Uint8Array(byteB64) {
    return new Uint8Array(Buffer.from(byteB64, "base64"));
  }
}

module.exports = new CryptoAPI();
