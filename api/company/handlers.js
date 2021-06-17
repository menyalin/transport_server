const CompanyService = require('../../services/company')

module.exports.create = async (req, res) => {
  try {
    const newCompany = await CompanyService.create(req.body, req.userId)
    res.status(201).json({ data: newCompany })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

module.exports.getMyCompanies = async (req, res) => {
  try {
    const companies = await CompanyService.getUserCompanies(
      req.userId
    )
    res.status(200).json({ data: companies })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
