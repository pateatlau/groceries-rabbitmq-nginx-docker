const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');
const LogErrors = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app_error.log' }),
  ],
});

class ErrorLogger {
  constructor() {}
  async logError(err) {
    console.error('==================== Start Error Logger ===============');
    LogErrors.log({
      private: true,
      level: 'error',
      message: `${new Date()}-${JSON.stringify(err)}`,
    });
    console.error('==================== End Error Logger ===============');
    // log error with Logger plugins

    return false;
  }

  isTrustError(error) {
    if (error instanceof AppError) {
      return error.isOperational;
    } else {
      return false;
    }
  }
}

const ErrorHandler = async (err, req, res, next) => {
  const errorLogger = new ErrorLogger();

  process.on('uncaughtException', (reason, promise) => {
    console.error(reason, 'UNHANDLED');
    throw reason; // need to take care
  });

  process.on('uncaughtException', (error) => {
    errorLogger.logError(error);
    if (errorLogger.isTrustError(err)) {
      //process exist // need restart
    }
  });

  if (err) {
    await errorLogger.logError(err);
    if (errorLogger.isTrustError(err)) {
      if (err.errorStack) {
        const errorDescription = err.errorStack;
        return res.status(err.statusCode).json({ message: errorDescription });
      }
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      //process exit // terribly wrong with flow need restart
    }

    return res.status(err.statusCode).json({ message: err.message });
  }
  next();
};

module.exports = ErrorHandler;
