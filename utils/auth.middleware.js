const jwt = require('jsonwebtoken')

module.exports.jwtAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const payload = await jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      )
      req.userId = payload.userId
      next()
    } catch (e) {
      res.sendStatus(401)
    }
  } else {
    res.sendStatus(401)
  }
}
