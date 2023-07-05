// @ts-nocheck
const errorMiddleware = async (err, req, res, next) => {
  return res.status(err.statusCode || 500).json(err.message)
}

export default errorMiddleware
