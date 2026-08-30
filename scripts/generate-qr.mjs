import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const target = process.argv[2] || "https://uhhomehealth.com";
const outputDir = fileURLToPath(new URL("../public/brand/", import.meta.url));
const outputFile = fileURLToPath(new URL("../public/brand/unity-hope-qr.png", import.meta.url));
await mkdir(outputDir, { recursive: true });
await QRCode.toFile(outputFile, target, {
  width: 520,
  margin: 2,
  errorCorrectionLevel: "H",
  color: { dark: "#30105B", light: "#FFFFFF" },
});
console.log(`Generated QR for ${target}`);
