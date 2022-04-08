import { Company, User } from '../../models/index.js'
import { TaskService, ChangeLogService } from '../../services/index.js'
import { emitTo } from '../../socket/index.js'
import addUserToRoom from '../../socket/addUserToRoom.js'
import { BadRequestError } from '../../helpers/errors.js'

class CompanyService {
  async create(body, userId) {
    const newCompany = new Company(body)
    newCompany.staff.push({ user: userId, roles: ['admin'], isActive: true })
    await newCompany.save()
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
    const res = await Company.find({
      staff: {
        $elemMatch: { user: userId, isActive: true },
      },
    }).populate('staff.user', 'name email')
    return res
  }

  async isExistInn(inn) {
    const res = await Company.findOne({ inn })
    return !!res
  }

  async addEmployee(newEmployee, companyId, initiator) {
    const company = await Company.findById(companyId)
    if (!company) throw new BadRequestError('Wrong company id')
    const user = await User.findById(newEmployee.user, '-password')
    if (!user) throw new BadRequestError('Wrong user id')
    if (company.staff.find((item) => item.user.toString() === newEmployee.user))
      throw new BadRequestError(
        'The user is already an employee of the company',
      )
    company.staff.push(newEmployee)
    await company.save()
    const employee = company.staff.find(
      (item) => item.user.toString() === newEmployee.user,
    )
    if (!employee)
      throw new BadRequestError(
        'The employee for some reason is not saved in the database',
      )
    //  создание задачи для пользователя
    employee.user = user
    const task = await TaskService.create({
      initiator: initiator,
      type: 'addEmployee',
      executor: user._id,
      room: companyId,
      title: `Предложение присоединиться к компании: ${company.name}`,
      content: `Должность: ${newEmployee.position} \nРоли: ${newEmployee.roles}`,
    })
    employee.tasks.push(task._id)
    await company.save()
    emitTo(task.executor.toString(), 'tasks:added', task)
    return employee
  }

  async performTask(taskId, type, result) {
    const company = await Company.findOne({ 'staff.tasks': taskId }).populate(
      'staff.user',
      'name email',
    )
    if (!company) throw new BadRequestError('CompanyService:task not found')
    const employee = company.staff.find((item) => item.tasks.includes(taskId))
    if (!employee)
      throw new BadRequestError('CompanyService:employee not found')

    if (result === 'accepted') {
      employee.isActive = true
      await company.save()
      // Добавить пользователю в комнату компании
      addUserToRoom(employee.user._id.toString(), company._id.toString())
      // запрос для обновления компаний у клиентов
      emitTo(company._id.toString(), 'company:updateCompany', company)
    } else {
      const employeeId = employee._id.toString()
      const employeeInd = company.staff.findIndex(
        (item) => item._id.toString() === employeeId,
      )
      if (employeeInd !== -1) company.staff.splice(employeeInd, 1)
      await company.save()
      emitTo(company._id.toString(), 'company:deleteEmployeeById', {
        employeeId,
        companyId: company._id.toString(),
      })
    }
    return true
  }

  async getUserRolesByCompanyIdAndUserId({ userId, companyId }) {
    const company = await Company.findById(companyId).lean()
    if (!company) throw new BadRequestError('Почему то нет компании')
    return { ...company?.staff.find((s) => s.user._id.toString() === userId) }
  }

  async updateSettings({ settings, companyId }) {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { settings: { ...settings } },
      { returnDocument: 'after' },
    )
    if (!company)
      throw new BadRequestError('Редактируемая компания не найдена')

    emitTo(company._id.toString(), 'company:updateSettings', {
      companyId,
      settings: company.settings,
    })
    return true
  }
}

export default new CompanyService()
