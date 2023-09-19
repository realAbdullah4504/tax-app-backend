const sendAppResponse = (data = {}) => {
  const { res, statusCode, status, ...rest } = data;
 return res.status(statusCode).json({
    status,
    statusCode,
    ...rest,
  });
};

module.exports = sendAppResponse;
