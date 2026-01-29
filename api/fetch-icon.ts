import type { VercelRequest, VercelResponse } from '@vercel/node';
import gplay from 'google-play-scraper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId } = req.body;
  if (!packageId) {
    return res.status(400).json({ error: 'packageId required' });
  }

  try {
    const app = await gplay.app({ appId: packageId });

    // Fetch the icon image and convert to base64
    const iconResponse = await fetch(app.icon);
    const buffer = await iconResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return res.status(200).json({
      iconData: base64,
      mimeType: 'image/png',
      appName: app.title,
      appDescription: app.summary,
    });
  } catch (error) {
    console.error('Failed to fetch icon:', error);
    return res.status(500).json({ error: 'Failed to fetch icon from Play Store' });
  }
}
