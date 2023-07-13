// @ts-nocheck
// import { CompanyService } from '../services'

export default async (socket, next) => {
  const userId = socket.handshake.auth.userId
  if (!userId) {
    return next(new Error('invalid user'))
  }
  socket.userId = userId
  next()
}
