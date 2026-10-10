import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, text } = req.body || {};
  const recipientEmail = (to || 'fixyourmobiles7@gmail.com').trim();

  if (!recipientEmail || !subject) {
    return res.status(400).json({ error: 'Missing recipient email address or email subject' });
  }

  try {
    const rawUser = process.env.SMTP_USER || 'Ottsellers00@gmail.com';
    const rawPass = process.env.SMTP_PASSWORD || 'dxbzsrhqqyeyxewn';

    const cleanUser = rawUser.trim();
    // Remove all spaces from Gmail App Passwords (e.g. "dxbz srhq qyey xewn" -> "dxbzsrhqqyeyxewn")
    const cleanPass = rawPass.replace(/\s+/g, '').trim();

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: cleanUser,
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"OTT SELLERS Support" <${cleanUser}>`,
      to: recipientEmail,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] Email dispatched to ${recipientEmail} (MessageID: ${info.messageId})`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('[SMTP Error] Failed to send email via Nodemailer:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to dispatch email via Gmail SMTP.' 
    });
  }
}

