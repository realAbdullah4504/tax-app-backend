const axios = require('axios');
const AppError = require('../errors/AppError');

const createAxiosInstance = (baseURL) => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      // Add any default headers you need, such as authentication tokens
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        // Handle known error responses
        // ...
      } else if (error.request) {
        // Handle request-related errors
        throw new AppError('No response received from server', 500);
      } else {
        // Handle other unexpected errors
        throw new AppError('An unexpected error occurred', 500);
      }
    }
  );

  return axiosInstance;
};

module.exports = createAxiosInstance;
