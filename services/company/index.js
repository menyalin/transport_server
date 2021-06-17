const { Company } = require('../../models/index')

class CompanyService {
  async create(body, userId) {
    const newCompany = new Company(body)
    newCompany.staff.push({ user: userId, roles: ['admin'] })
    await newCompany.save()
    return newCompany
  }

  async getUserCompanies(userId) {
    const res = await Company.find({ 'staff.user': userId }).populate(
      'staff.user',
      'name email'
    )
    return res
  }
}

module.exports = new CompanyService()
