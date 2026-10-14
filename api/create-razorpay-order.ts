import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
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

  const { amount, currency = 'INR', receipt, notes } = req.body || {};

  const numAmount = Number(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid positive payment amount is required' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_TnmR2QaJbFFCcJ';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'fL0Pw83K4tOXBwGK6WMHls5l';

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    // Create official order with Razorpay REST API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Math.round(numAmount * 100), // amount in lowest denomination (paise)
        currency,
        receipt: (receipt || `rcpt_${Date.now()}`).substring(0, 40),
        notes: notes || {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Razorpay Order API Error]', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('[Razorpay Exception]', err);
    return res.status(500).json({ 
      error: err?.message || 'Failed to communicate with Razorpay API' 
    });
  }
}
