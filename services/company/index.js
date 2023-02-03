import { Company } from '../../models/index.js'
import {
  ChangeLogService,
  WorkerService,
  UserService,
} from '../../services/index.js'
import { emitTo } from '../../socket/index.js'
import { BadRequestError } from '../../helpers/errors.js'

class CompanyService {
  async create(body, userId) {
    const user = await UserService.findById(userId)
    if (!user) throw new BadRequestError('Пользователь не определен')
    const newCompany = new Company(body)
    await newCompany.save()
    await WorkerService.create({
      body: {
        name: user.name,
        fullName: user.name,
        isActive: true,
        company: newCompany._id,
        roles: ['admin'],
        note: 'created with company',
        accepted: true,
        pending: false,
        disabled: false,
        user: user._id,
        position: 'admin',
      },
      user: userId,
    })

    await ChangeLogService.add({
      docId: newCompany._id.toString(),
      company: newCompany._id.toString(),
      user: userId,
      coll: 'companies',
      body: JSON.stringify(newCompany.toJSON()),
      opType: 'create',
    })
    return newCompany
  }

  async getUserCompanies(userId) {
    const res = await WorkerService.getUserCompanies(userId)
    return res
  }

  async isExistInn(inn) {
    const res = await Company.findOne({ inn })
    return !!res
  }

  async updateOne(companyId, body) {
    const updatedCompany = await Company.findByIdAndUpdate(companyId, body, {
      returnDocument: 'after',
    })
    if (!updatedCompany)
      throw new BadRequestError('Редактируемая компания не найдена')
    emitTo(
      updatedCompany._id.toString(),
      'company:updated',
      updatedCompany.toJSON()
    )
    return true
  }

  async updateSettings({ settings, companyId }) {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { settings: { ...settings } },
      { returnDocument: 'after' }
    )
    if (!company) throw new BadRequestError('Редактируемая компания не найдена')

    emitTo(company._id.toString(), 'company:updateSettings', {
      companyId,
      settings: company.settings,
    })
    return true
  }
}

export default new CompanyService()
