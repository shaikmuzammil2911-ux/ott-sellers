import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, text, type } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing recipient or subject' });
  }

  try {
    const smtpUser = process.env.SMTP_USER || 'Ottsellers1@gmail.com';
    const smtpPass = process.env.SMTP_PASSWORD || 'wgupwtpbbczbnbhq';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"OTT SELLERS Support" <${smtpUser}>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to dispatch email' 
    });
  }
}
