import axios from 'axios';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getTwitchAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
  });

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000;
  return accessToken;
}

export async function igdbQuery(endpoint: string, query: string) {
  const token = await getTwitchAccessToken();
  try {
    const response = await axios.post(`https://api.igdb.com/v4/${endpoint}`, query, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Clear token and retry once
      accessToken = null;
      const newToken = await getTwitchAccessToken();
      const response = await axios.post(`https://api.igdb.com/v4/${endpoint}`, query, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${newToken}`,
        },
      });
      return response.data;
    }
    throw error;
  }
}
