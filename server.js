require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
// Le port sera fourni par l'environnement de Render, avec 5000 comme alternative locale
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Reconfiguration pour utiliser Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

app.post('/api/contact', async (req, res) => {
  console.log("Données du formulaire reçues :", req.body);
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailToAdmin = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Message from ${name} via Website`,
    text: `You have received a message from:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  const mailToUser = {
    from: `"Plexus Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `We've Received Your Message - Plexus`,
    text: `Hi ${name},\n\nThank you for contacting us. We have successfully received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Plexus Team`,
    html: `<p>Hi ${name},</p><p>Thank you for contacting us. We have successfully received your message and will get back to you as soon as possible.</p><p>Best regards,<br><strong>The Plexus Team</strong></p>`
  };

  try {
    await transporter.sendMail(mailToAdmin);
    console.log("Email sent to admin.");

    await transporter.sendMail(mailToUser);
    console.log("Confirmation email sent to user.");

    res.status(200).json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("Error sending one of the emails:", error);
    res.status(500).json({ message: "Error sending email." });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
