const createAppError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    error.isOperational = true; // This property helps distinguish operational errors from programming errors
    Error.captureStackTrace(error, createAppError);
    return error;
  };
  
  module.exports = createAppError;