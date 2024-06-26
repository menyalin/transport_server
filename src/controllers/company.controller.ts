// @ts-nocheck
import { BadRequestError } from '../helpers/errors'
import { CompanyService, PermissionService } from '../services'

class CompanyController {
  async create(req, res) {
    try {
      const newCompany = await CompanyService.create(req.body, req.userId)
      res.status(201).json({ data: newCompany })
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getMyCompanies(req, res) {
    try {
      if (!req.userId) throw new Error('user id is missing')
      let companies
      const isAdmin = await PermissionService.isAdmin(req.userId)
      if (isAdmin) companies = await CompanyService.getAll()
      else companies = await CompanyService.getUserCompanies(req.userId)

      res.status(200).json(companies)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async isExistInn(req, res) {
    try {
      const tmp = await CompanyService.isExistInn(req.query.inn)
      res.status(200).json(tmp)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateOne(req, res) {
    try {
      await PermissionService.check({
        operation: 'fullAccess',
        userId: req.userId,
        companyId: req.companyId,
      })
      if (req.params.id !== req.companyId)
        throw new BadRequestError(
          'access denied! change your directories profile '
        )
      const data = await CompanyService.updateOne(req.params.id, req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateSettings(req, res) {
    try {
      await PermissionService.check({
        operation: 'fullAccess',
        userId: req.userId,
        companyId: req.companyId,
      })
      const data = await CompanyService.updateSettings({
        settings: req.body,
        companyId: req.params.id,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new CompanyController()
