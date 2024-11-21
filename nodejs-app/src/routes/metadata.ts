import express from 'express';
import axios from 'axios';

export const router = express.Router();

const metadataUrl = 'http://169.254.169.254/latest/meta-data';

async function getIMDSToken() {
  try {
    const response = await axios.put(
      'http://169.254.169.254/latest/api/token',
      null,
      {
        headers: {
          'X-aws-ec2-metadata-token-ttl-seconds': '21600',
        },
        timeout: 1000,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve IMDSv2 token');
  }
}

async function fetchMetadata(path = '', token: string) {
  try {
    const url = `${metadataUrl}/${path}`;
    const response = await axios.get(url, {
      headers: {
        'X-aws-ec2-metadata-token': token,
      },
      timeout: 1000,
    });

    const data = response.data;

    if (data.endsWith('/')) {
      const items = data.split('\n').filter((item: string) => item);
      const metadata: { [key: string]: string } = {};

      for (const item of items) {
        metadata[item] = await fetchMetadata(`${path}/${item}`, token);
      }

      return metadata;
    }

    return data;
  } catch (error) {
    return 'Error fetching metadata';
  }
}

router.get('/metadata', async (req, res) => {
  try {
    const token = await getIMDSToken();
    const metadata = await fetchMetadata('', token);
    res.json(metadata);
  } catch (error) {
    res.status(500).send('Error retrieving EC2 metadata');
  }
});
