const sendAppResponse = (data = {}) => {
  const { res, statusCode, status, ...rest } = data;
  res.status(statusCode).json({
    status,
    statusCode,
    ...rest,
  });
};

module.exports = sendAppResponse;
