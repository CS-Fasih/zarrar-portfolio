const nodemailer = require("nodemailer");

const allowedSubjects = new Set([
  "Job Opportunity",
  "Freelance",
  "Collaboration",
  "Other"
]);
const attempts = new Map();

function clean(value) {
  return String(value || "").trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validatePayload(body) {
  const payload = {
    name: clean(body.name),
    email: clean(body.email),
    subject: clean(body.subject),
    message: clean(body.message)
  };

  if (payload.name.length < 2 || payload.name.length > 80) {
    return { error: "Name must be between 2 and 80 characters." };
  }
  if (!isEmail(payload.email) || payload.email.length > 120) {
    return { error: "A valid email address is required." };
  }
  if (!allowedSubjects.has(payload.subject)) {
    return { error: "Please choose a valid subject." };
  }
  if (payload.message.length < 10 || payload.message.length > 3000) {
    return { error: "Message must be between 10 and 3000 characters." };
  }

  return { payload };
}

function rateLimit(req) {
  const forwardedFor = req.headers["x-forwarded-for"] || "";
  const ip = forwardedFor.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const current = attempts.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  attempts.set(ip, current);
  return current.count <= 5;
}

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!rateLimit(req)) {
    res.status(429).json({ error: "Too many contact attempts. Please try again in a minute." });
    return;
  }

  const validation = validatePayload(req.body || {});
  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const transporter = createTransporter();
  const receiver = process.env.CONTACT_RECEIVER || process.env.SMTP_USER;
  if (!transporter || !receiver) {
    res.status(503).json({ error: "Contact email service is not configured." });
    return;
  }

  const { name, email, subject, message } = validation.payload;
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    await transporter.sendMail({
      from: `"Zarrar Portfolio" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a0033">
          <h2 style="color:#7700cc">New portfolio message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `
    });

    res.status(200).json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Unable to send message right now." });
  }
};
