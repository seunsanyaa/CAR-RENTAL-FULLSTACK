import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CAR_QUERY_API_BASE = process.env.CAR_QUERY_API_BASE || 'https://www.carqueryapi.com/api/0.3/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cmd, ...params } = req.query;

  if (!cmd) {
    res.status(400).json({ error: 'Missing command parameter (cmd).' });
    return;
  }

  try {
    const queryParams = new URLSearchParams();

    queryParams.append('cmd', cmd as string);

    Object.keys(params).forEach((key) => {
      if (key !== 'cmd' && key !== 'callback') {
        queryParams.append(key, params[key] as string);
      }
    });

    // Adding callback= to get pure JSON response
    queryParams.append('callback', '');

    const response = await axios.get(`${CAR_QUERY_API_BASE}?${queryParams.toString()}`, {
      responseType: 'text', // Ensure response is treated as text
    });

    const data = response.data;

    // Check if the response is pure JSON
    let parsedData;
    if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
      // Pure JSON
      parsedData = JSON.parse(data);
    } else {
      // JSONP response; strip the callback
      const jsonData = data.replace(/^.*?\((.*)\);?$/, '$1');
      parsedData = JSON.parse(jsonData);
    }

    res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Error fetching data from CarQueryAPI:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from CarQueryAPI.' });
  }
}
