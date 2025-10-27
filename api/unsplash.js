import dotenv from 'dotenv';

// 로컬에서만 .env.local 로드
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
    const query = req.query.query || '';
    const perPage = req.query.per_page || 30;
    // const page = req.query.page || 1;
    const apiKey = process.env.UNSPLASH_KEY;
  
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=${perPage}&client_id=${apiKey}`);
    // const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=${perPage}&page=${page}&client_id=${apiKey}`);
  
    if (!response.ok) {
        return res.status(response.status).json({ error: 'Unsplash API error' });
    }
  
    const data = await response.json();
    res.status(200).json(data);
}
