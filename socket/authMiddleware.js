import { CompanyService } from '../services/index.js'

export default async (socket, next) => {
  const userId = socket.handshake.auth.userId
  if (!userId) {
    return next(new Error('invalid user'))
  }
  const companies = await CompanyService.getUserCompanies(userId)
  if (companies.length > 0) {
    const companyIds = companies.map((item) => item._id.toString())
    companyIds.forEach((id) => {
      socket.join(id)
    })
  }
  socket.userId = userId
  socket.join(userId)

  next()
}
