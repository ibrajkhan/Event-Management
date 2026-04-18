import nodemailer from "nodemailer";
import { config } from "../config.js";

function canSendMail() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });
}

export async function sendAttendeeQrMail(attendee) {
  if (!attendee.email) {
    return {
      delivered: false,
      status: "skipped",
      reason: "Attendee does not have an email address."
    };
  }

  if (!canSendMail()) {
    return {
      delivered: false,
      status: "failed",
      reason: "SMTP is not configured yet."
    };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to: attendee.email,
      subject: `${config.event.name} - Your QR Badge`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>${config.event.name}</h2>
          <p>Hello ${attendee.name},</p>
          <p>Your registration number is <strong>${attendee.registrationNumber}</strong>.</p>
          <p><a href="${attendee.badgeUrl}">Open your M-badge</a></p>
        </div>
      `
    });

    return {
      delivered: true,
      status: "sent",
      messageId: info.messageId
    };
  } catch (error) {
    return {
      delivered: false,
      status: "failed",
      reason: error.message || "Email sending failed."
    };
  }
}
