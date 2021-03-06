import { CompanyService, UserService } from '../../services/index.js'

export const create = async (req, res) => {
  try {
    const newCompany = await CompanyService.create(req.body, req.userId)
    res.status(201).json({ data: newCompany })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const getMyCompanies = async (req, res) => {
  try {
    const companies = await CompanyService.getUserCompanies(req.userId)
    res.status(200).json({ data: companies })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const isExistInn = async (req, res) => {
  try {
    const tmp = await CompanyService.isExistInn(req.query.inn)
    res.status(200).json(tmp)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const userByEmail = async (req, res) => {
  try {
    const user = await UserService.findByEmail(req.query.email)
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export const addEmployee = async (req, res) => {
  try {
    const newEmployee = await CompanyService.addEmployee(
      req.body,
      req.params.companyId
    )

    res.status(200).json(newEmployee)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
