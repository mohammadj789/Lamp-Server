const createHttpError = require("http-errors");

const NotFoundError = (req, res, next) =>
  next(createHttpError.NotFound("Not Found Page"));

const ErrorHandler = (err, req, res, next) => {
  const defaultServerError = createHttpError.InternalServerError();

  if (err.name === "MongoServerError" && err.code === 11000) {
    const key = Object.keys(err?.keyPattern)[0];
    err.status = 400;
    err.message = `this ${key} already exists`;
  }
  const status =
    err.status || err.statusCode || defaultServerError.status;
  const message =
    err.message || err.msg || defaultServerError.message;

  return res.status(status).json({ errors: { status, message } });
};

module.exports = { ErrorHandler, NotFoundError };
