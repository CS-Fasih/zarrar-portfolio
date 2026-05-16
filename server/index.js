const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8000";
const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER || process.env.SMTP_USER;

app.use(express.json({ limit: "20kb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === CLIENT_URL || origin === "http://localhost:8000" || origin === "http://127.0.0.1:8000") {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin not allowed"));
  }
}));

app.use("/api/contact", rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact attempts. Please try again in a minute." }
}));

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value) {
  return String(value || "").trim();
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
  if (!["Job Opportunity", "Freelance", "Collaboration", "Other"].includes(payload.subject)) {
    return { error: "Please choose a valid subject." };
  }
  if (payload.message.length < 10 || payload.message.length > 3000) {
    return { error: "Message must be between 10 and 3000 characters." };
  }

  return { payload };
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

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "zarrar-portfolio-contact-api" });
});

app.post("/api/contact", async (req, res) => {
  const validation = validatePayload(req.body || {});
  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const transporter = createTransporter();
  if (!transporter || !CONTACT_RECEIVER) {
    res.status(503).json({ error: "Contact email service is not configured." });
    return;
  }

  const { name, email, subject, message } = validation.payload;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    await transporter.sendMail({
      from: `"Zarrar Portfolio" <${process.env.SMTP_USER}>`,
      to: CONTACT_RECEIVER,
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
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `
    });

    res.json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    res.status(500).json({ error: "Unable to send message right now." });
  }
});

app.use((err, req, res, next) => {
  if (err && err.message === "CORS origin not allowed") {
    res.status(403).json({ error: "Origin is not allowed." });
    return;
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Contact API running on port ${PORT}`);
});
