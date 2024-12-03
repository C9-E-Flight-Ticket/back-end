// errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    const statusCode = err.statusCode || 500;
    const response = {
      status: 'error',
      statusCode: statusCode,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack 
      })
    };
  
    res.status(statusCode).json(response);
  };
  
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = {
    errorHandler,
    AppError,
    asyncErrorHandler
  };