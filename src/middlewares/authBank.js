const axios = require('axios');
const AppError = require('../errors/AppError');

const { CLIENT_ASSERTION, CLIENT_ID, REFRESH_TOKEN } = require('../../config/vars');
const getToken = async () => {
  try {
    const apiUrl = 'https://sandbox-b2b.revolut.com/api/1.0/auth/token';
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const requestData = {
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: CLIENT_ASSERTION,
    };

    const { data } = await axios.post(apiUrl, new URLSearchParams(requestData).toString(), config);

    return data?.access_token || '';
  } catch (error) {
    console.error(error);
  }
};
const authenticateBank = async (req, res, next) => {
  try {
    const accessToken = await getToken();
    console.log('access token', accessToken);
    if (!accessToken) throw new AppError('Access token missing', 401);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      // 'Content-Type': 'application/json',
      // 'Accept': 'application/json',
    };
    console.log('headers', headers);
    req.headers = headers;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getToken,
  authenticateBank,
};
