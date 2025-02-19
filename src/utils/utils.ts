import { UAParser } from "ua-parser-js";

export const parsePlatform = () => {
  const parser = new UAParser();
  const os = parser.getOS();
  console.log(os);

  return os.name!;
};
export const parseDevice = () => {
  const parser = new UAParser();
  const device = parser.getDevice();
  const os = parser.getOS();

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const dpr = window.devicePixelRatio;
  const iosVersion = os.name === "iOS" ? parseFloat(os.version!) : null;

  if (device.vendor === "Apple" && device.type === "mobile") {
    const iPhones = [
      { model: "iPhone 6S", res: "320x568", minIOS: 6, maxIOS: 12 },
      {
        model: "iPhone SE",
        res: "375x667",
        minIOS: 8,
        maxIOS: 17,
      },
      {
        model: "iPhone Plus",
        res: "414x736",
        minIOS: 8,
        maxIOS: 17,
      },
      { model: "iPhone XS", res: "375x812", minIOS: 11, maxIOS: 17 },
      { model: "iPhone XR", res: "414x896", minIOS: 12, maxIOS: 17 },
      { model: "iPhone 12 Pro", res: "390x844", minIOS: 14, maxIOS: 17 },
      {
        model: "iPhone 13 Pro Max",
        res: "428x926",
        minIOS: 14,
        maxIOS: 17,
      },
      { model: "iPhone 14 Pro", res: "393x852", minIOS: 16, maxIOS: 17 },
      { model: "iPhone 14 Pro Max", res: "430x932", minIOS: 16, maxIOS: 17 },
      { model: "iPhone SE 3 (2022)", res: "360x780", minIOS: 15, maxIOS: 17 },
    ];

    const screenKey = `${screenWidth}x${screenHeight}`;
    const match = iPhones.find(
      (iPhone) =>
        iPhone.res === screenKey &&
        (!iosVersion ||
          (iosVersion >= iPhone.minIOS && iosVersion <= iPhone.maxIOS))
    );

    return match ? match.model : "Unknown iPhone";
  }

  if (device.vendor === "Apple" && device.type === "tablet") {
    const iPads = [
      { model: "iPad Mini Air", res: "768x1024", minIOS: 5, maxIOS: 12 },
      { model: "iPad Mini 6", res: "810x1080", minIOS: 15, maxIOS: 17 },
      { model: 'iPad 10.5"', res: "834x1112", minIOS: 12, maxIOS: 17 },
      { model: 'iPad Pro 12.9"', res: "1024x1366", minIOS: 9, maxIOS: 17 },
    ];

    const screenKey = `${screenWidth}x${screenHeight}`;
    const match = iPads.find(
      (iPad) =>
        iPad.res === screenKey &&
        (!iosVersion ||
          (iosVersion >= iPad.minIOS && iosVersion <= iPad.maxIOS))
    );

    return match ? match.model : "Unknown iPad";
  }

  if (
    device.vendor === "Apple" &&
    device.type === undefined &&
    os.name === "Mac OS"
  ) {
    return "iMac";
  }

  if (os.name === "Android") {
    console.log(device.vendor, device.model);
    return device.model
      ? `${device.vendor ? device.vendor : "Android"} ${device.model}`
      : "Android Device";
  }

  if (os.name === "Windows") {
    return `Windows ${os.version || ""}`.trim();
  }

  if (os.name === "Linux") {
    return "Linux Device";
  }

  if (os.name) {
    return os.name;
  }
  return "Unknown Device";
};
