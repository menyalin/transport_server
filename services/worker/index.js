import { Worker, User as UserModel } from '../../models/index.js'
import { emitTo } from '../../socket/index.js'
import IService from '../iService.js'
import ChangeLogService from '../changeLog/index.js'
import { BadRequestError } from '../../helpers/errors.js'

class WorkerService extends IService {
  constructor({ model, emitter, modelName, logService }) {
    super({ model, emitter, modelName, logService })
  }

  async getUserByEmail({ email, companyId }) {
    if (!email) return null
    if (!companyId) return null

    const user = await UserModel.findOne(
      {
        email,
        isActive: true,
        openForSearch: true,
        // todo: emailConfirmed:true - поиск только по подтвержденным email
      },
      { email: 1, name: 1 },
    ).lean()
    if (!user) return null

    const existedUser = await this.model
      .findOne({ user: user._id, company: companyId })
      .lean()
    if (existedUser) return null

    return user
  }

  async updateOne({ id, body, user }) {
    const data = await this.model.findByIdAndUpdate(id, body, { new: true })
    this.emitter(data.company.toString(), `${this.modelName}:updated`, data)
    if (this.logService)
      await this.logService.add({
        docId: data._id.toString(),
        coll: this.modelName,
        opType: 'update',
        user,
        company: data.company.toString(),
        body: JSON.stringify(data.toJSON()),
      })
    if (data.disabled) {
      const disabledUser = await UserModel.findOne({
        _id: data.user,
        directoriesProfile: data.company,
      })
      if (disabledUser) {
        disabledUser.directoriesProfile = null
        this.emitter(
          disabledUser._id.toString(),
          'user:clearDirectoriesProfile',
          null,
        )
      }
    }
    return data
  }

  async addUser({ userId, roles, workerId, actor }) {
    const worker = await this.model.findById(workerId)
    if (!worker || worker.pending || worker.accepted)
      throw new BadRequestError(
        'bad worker params: _id || accepted || pending',
      )
    worker.user = userId
    worker.roles = roles
    worker.accepted = true
    worker.pending = true
    await worker.save()

    this.emitter(worker.company.toString(), 'worker:updated', worker)

    await this.logService.add({
      docId: worker._id.toString(),
      coll: this.modelName,
      opType: 'sendInvite',
      user: actor,
      company: worker.company.toString(),
      body: JSON.stringify(worker.toJSON()),
    })
    await worker.populate('company', ['name', 'inn', 'fullName'])
    this.emitter(userId, 'worker:inviteGetted', worker)
    return worker
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
}

export default new WorkerService({
  model: Worker,
  emitter: emitTo,
  modelName: 'worker',
  logService: ChangeLogService,
})
