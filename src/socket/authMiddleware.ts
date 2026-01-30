// @ts-nocheck
// import { CompanyService } from '../services'

export default async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId
    if (!userId) {
      return next(new Error('invalid user'))
    }
    socket.userId = userId
    next()
  } catch (e) {
    next(e)
  }
}
