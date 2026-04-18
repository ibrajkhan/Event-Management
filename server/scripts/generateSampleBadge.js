import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createBadgePdf, buildQrCodeDataUrl } from "../src/services/badgeService.js";
import { config } from "../src/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const attendee = {
    name: "Rahul Sharma",
    registrationNumber: "EVT-00001",
    qrToken: "sample-token-001",
    eventAddress: config.event.address
  };

  attendee.qrCodeDataUrl = await buildQrCodeDataUrl(attendee);

  const pdfBytes = await createBadgePdf(attendee);
  const outputDir = path.resolve(__dirname, "../../artifacts");
  const outputPath = path.join(outputDir, "sample-badge.pdf");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(pdfBytes));

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
