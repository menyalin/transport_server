// import { CompanyService } from '../services/index.js'

export default async (socket, next) => {
  const userId = socket.handshake.auth.userId
  if (!userId) {
    return next(new Error('invalid user'))
  }
  socket.userId = userId
  next()
}
