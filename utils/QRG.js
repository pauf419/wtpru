const { QRCodeCanvas } = require("@loskir/styled-qr-code-node");

async function generateQRCode(data, qrp) {
  try {
    const qrCode = new QRCodeCanvas({
      width: 280,
      height: 280,
      type: "svg",
      data,
      image: "./utils/telegram-svgrepo-com100.png",
      dotsOptions: {
        color: "#000000",
        type: "extra-rounded",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
      },
      qrOptions: {
        mode: "Byte",
        errorCorrectionLevel: "M",
      },
      margin: 0,
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        hideBackgroundDots: true,
        margin: 0,
        imageSize: 0.4,
      },
    });
    await qrCode.toFile(qrp, "png");
  } catch (err) {
    console.error("Error generating QR Code:", err);
  }
}

module.exports = generateQRCode;
