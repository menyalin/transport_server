// @ts-nocheck
import { Task } from '../../models'
import { CompanyService } from '..'
import { emitTo } from '../../socket'

class TaskService {
  async create(body) {
    const newTask = await Task.create(body)
    return newTask
  }

  async getActiveTasksForUser(userId) {
    const tasks = await Task.find({ executor: userId, isActive: true })
    return tasks
  }

  async getTaskById(id) {
    const task = await Task.findById(id)
    return task
  }

  async performTask(taskId, result) {
    const task = await Task.findById(taskId)
    let service = null

    switch (task.type) {
      case 'addEmployee':
        service = CompanyService
        break
      default:
        throw new Error('wrong task type')
    }

    await service.performTask(taskId, task.type, result)
    task.isActive = false

    await task.save()
    emitTo(task.executor.toString(), 'tasks:complete', taskId)
    return true
  }
}

export default new TaskService()
