import jwt from 'jsonwebtoken'
import { UserService } from '../services/index.js'

export const jwtAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const payload = await jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      )
      const user = await UserService.findById(payload.userId)
      if (!user) res.sendStatus(401)
      req.userId = user._id.toString()
      req.companyId = user.directoriesProfile.toString()
      next()
    } catch (e) {
      res.sendStatus(401)
    }
  } else {
    res.sendStatus(401)
  }
}
