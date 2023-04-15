import { Worker, User as UserModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'
import { BadRequestError } from '../../helpers/errors.js'
import getCompaniesByUserIdPipeline from './pipelines/getCompaniesByUserIdPipeline.js'

class WorkerService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }

  async getById(id) {
    const data = await this.model
      .findById(id)
      .populate('user', ['name', 'email'])
    return data
  }

  async getForAutocomplete({ companyId, params }) {
    const gettedFielfds = { name: 1, fullName: 1 }
    if (!companyId) throw new BadRequestError('no company id')
    if (params?.id)
      return await this.model
        .find({ _id: params.id, company: companyId }, gettedFielfds)
        .lean()

    const query = {
      isActive: true,
      company: companyId,
    }
    if (params.searchStr) {
      query.$or = []
      query.$or.push({ name: { $regex: params.searchStr, $options: 'i' } })
      query.$or.push({ fullName: { $regex: params.searchStr, $options: 'i' } })
    }
    return await this.model.find(query, gettedFielfds).limit(20).lean()
  }

  async getWorkerRolesByCompanyIdAndUserId({ userId, companyId }) {
    const worker = await this.model
      .findOne({
        user: userId,
        company: companyId,
        isActive: true,
        pending: false,
        disabled: false,
        accepted: true,
      })
      .lean()
    return worker?.roles || null
  }

  async getUserByEmail({ email, companyId }) {
    if (!email) return null
    if (!companyId) return null

    const user = await UserModel.findOne(
      {
        email,
        openForSearch: true,
        // todo: emailConfirmed:true - поиск только по подтвержденным email
      },
      { email: 1, name: 1 }
    )
    if (!user) return null

    const existedUser = await this.model
      .findOne({ user: user._id, company: companyId })
      .lean()
    if (existedUser) return null

    return user
  }

  async updateOne({ id, body, user }) {
    const worker = await this.model.findByIdAndUpdate(id, body, { new: true })
    this.emitter(worker.company.toString(), `${this.modelName}:updated`, worker)
    if (this.logService)
      await this.logService.add({
        docId: worker._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: worker.company.toString(),
        body: JSON.stringify(worker.toJSON()),
      })
    if (worker.disabled) {
      const disabledUser = await UserModel.findOne({ _id: worker.user })
      if (
        disabledUser &&
        disabledUser?.directoriesProfile?.toString() ===
          worker.company.toString()
      ) {
        disabledUser.directoriesProfile = null
        await disabledUser.save()
      }
      if (disabledUser)
        this.emitter(
          disabledUser._id.toString(),
          'user:clearDirectoriesProfile',
          worker.company.toString()
        )
    }
    await worker.populate('user', ['name', 'email'])
    return worker
  }

  async addUser({ userId, roles, workerId, actor }) {
    const worker = await this.model.findById(workerId)
    if (!worker || worker.pending || worker.accepted)
      throw new BadRequestError('bad worker params: _id || accepted || pending')
    worker.user = userId
    worker.roles = roles
    worker.accepted = true
    worker.pending = true
    await worker.save()


    await this.logService.add({
      docId: worker._id.toString(),
      coll: this.modelName,
      opType: 'sendInvite',
      user: actor,
      company: worker.company.toString(),
      body: JSON.stringify(worker.toJSON()),
    })
    
    await worker.populate('company', ['name', 'inn', 'fullName'])
    await worker.populate('user', ['name', 'email'])
    
    this.emitter(userId, 'worker:inviteGetted', worker)
    this.emitter(worker.company.toString(), 'worker:updated', worker)

    return worker
  }

  async acceptInvite({ userId, workerId, accepted }) {
    const worker = await this.model
      .findOne({
        _id: workerId,
        user: userId,
        pending: true,
        disabled: false,
      })
      .populate('user', ['email', 'name'])
    if (!worker)
      throw new BadRequestError('Соответствующий сотрудник отсутствует!')
    worker.accepted = accepted
    worker.pending = false
    await worker.save()
    if (worker.accepted) {
      const user = await UserModel.findById(worker.user._id)
      if (user && !user.directoriesProfile) {
        user.directoriesProfile = worker.company
        await user.save()
      }
    }
    this.emitter(userId, 'worker:updated', worker)
  }

  async getUserInvites(userId) {
    const invites = this.model
      .find({
        user: userId,
        isActive: true,
        disabled: false,
        pending: true,
      })
      .populate('company', ['name', 'inn', 'fullName'])
      .lean()
    return invites
  }

  async getUserCompanies(userId) {
    const pipeline = getCompaniesByUserIdPipeline(userId)
    const companies = await this.model.aggregate(pipeline)
    return companies
  }
}

export default new WorkerService({
  model: Worker,
  emitter: emitTo,
  modelName: 'worker',
  logService: ChangeLogService,
})
