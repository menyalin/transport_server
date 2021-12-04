import { Company, User } from '../../models/index.js'
import { TaskService, ChangeLogService } from '../../services/index.js'
import { emitTo } from '../../socket/index.js'
import addUserToRoom from '../../socket/addUserToRoom.js'

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
      opType: 'create'
    })
    return newCompany
  }

  async getUserCompanies(userId) {
    const res = await Company.find({
      staff: {
        $elemMatch: { user: userId, isActive: true }
      }
    }).populate('staff.user', 'name email')
    return res
  }

  async isExistInn(inn) {
    const res = await Company.findOne({ inn })
    return !!res
  }

  async addEmployee(newEmployee, companyId, initiator) {
    const company = await Company.findById(companyId)
    if (!company) throw new Error('Wrong company id')
    const user = await User.findById(newEmployee.user, '-password')
    if (!user) throw new Error('Wrong user id')
    if (company.staff.find((item) => item.user.toString() === newEmployee.user))
      throw new Error('The user is already an employee of the company')
    company.staff.push(newEmployee)
    await company.save()
    const employee = company.staff.find(
      (item) => item.user.toString() === newEmployee.user
    )
    if (!employee)
      throw new Error(
        'The employee for some reason is not saved in the database'
      )
    //  создание задачи для пользователя
    employee.user = user
    const task = await TaskService.create({
      initiator: initiator,
      type: 'addEmployee',
      executor: user._id,
      room: companyId,
      title: `Предложение присоединиться к компании: ${company.name}`,
      content: `Должность: ${newEmployee.position} \nРоли: ${newEmployee.roles}`
    })
    employee.tasks.push(task._id)
    await company.save()
    emitTo(task.executor.toString(), 'tasks:added', task)
    return employee
  }

  async performTask(taskId, type, result) {
    const company = await Company.findOne({ 'staff.tasks': taskId }).populate(
      'staff.user',
      'name email'
    )
    if (!company) throw new Error('CompanyService:task not found')
    const employee = company.staff.find((item) => item.tasks.includes(taskId))
    if (!employee) throw new Error('CompanyService:employee not found')

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
        (item) => item._id.toString() === employeeId
      )
      if (employeeInd !== -1) company.staff.splice(employeeInd, 1)
      await company.save()
      emitTo(company._id.toString(), 'company:deleteEmployeeById', {
        employeeId,
        companyId: company._id.toString()
      })
    }
    return true
  }
}

export default new CompanyService()
