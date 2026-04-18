import fs from "fs/promises";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { config } from "../config.js";

export async function buildQrCodeDataUrl(attendee) {
  const payload = `${config.publicBaseUrl}/api/scan/resolve/${attendee.qrToken}`;
  return QRCode.toDataURL(payload, { margin: 1, width: 300 });
}

function centerX(pageWidth, elementWidth) {
  return (pageWidth - elementWidth) / 2;
}

function fitFontSize(text, maxWidth, font, initialSize, minSize = 14) {
  let size = initialSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
}

async function createTemplateBadgePdf(attendee) {
  const templateBytes = await fs.readFile(config.badgeTemplatePath);
  const pdf = await PDFDocument.load(templateBytes);
  const [page] = pdf.getPages();
  const { width, height } = page.getSize();
  const nameFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdf.embedPng(attendee.qrCodeDataUrl);

  const contentWidth = Math.min(width * 0.68, 330);
  const regY = height * 0.56;
  const nameY = height * 0.50;
  const qrSize = Math.min(width * 0.28, 150);
  const qrY = height * 0.25;
  const nameSize = fitFontSize(attendee.name, contentWidth, nameFont, 34, 22);
  const regLabel = `Registration No: ${attendee.registrationNumber}`;
  const regSize = fitFontSize(regLabel, contentWidth, bodyFont, 18, 13);

  page.drawText(regLabel, {
    x: centerX(width, bodyFont.widthOfTextAtSize(regLabel, regSize)),
    y: regY,
    size: regSize,
    font: bodyFont,
    color: rgb(0.18, 0.2, 0.24)
  });

  page.drawText(attendee.name, {
    x: centerX(width, nameFont.widthOfTextAtSize(attendee.name, nameSize)),
    y: nameY,
    size: nameSize,
    font: nameFont,
    color: rgb(0.08, 0.1, 0.16)
  });

  page.drawImage(qrImage, {
    x: centerX(width, qrSize),
    y: qrY,
    width: qrSize,
    height: qrSize
  });

  return pdf.save();
}

export async function createBadgePdf(attendee) {
  if (config.badgeTemplatePath) {
    return createTemplateBadgePdf(attendee);
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([300, 450]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdf.embedPng(attendee.qrCodeDataUrl);

  page.drawRectangle({ x: 16, y: 16, width: 268, height: 418, borderWidth: 2, color: rgb(1, 1, 1) });
  page.drawText(config.event.name, { x: 28, y: 390, size: 18, font, color: rgb(0.08, 0.19, 0.42) });
  page.drawText(attendee.name, { x: 28, y: 344, size: 20, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(`Reg No: ${attendee.registrationNumber}`, { x: 28, y: 316, size: 12, font: regularFont });
  page.drawText(attendee.eventAddress || config.event.address, {
    x: 28,
    y: 286,
    size: 11,
    font: regularFont,
    color: rgb(0.25, 0.25, 0.25),
    maxWidth: 180
  });
  page.drawImage(qrImage, { x: 72, y: 72, width: 156, height: 156 });

  return pdf.save();
}
