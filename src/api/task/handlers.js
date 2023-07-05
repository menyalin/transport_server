/* eslint-disable no-unused-vars */
import { TaskService } from '../../services/index.js'

export const taskConfirmHandler = async (req, res) => {
  try {
    const taskId = req.params.id
    const { result } = req.query
    await TaskService.performTask(taskId, result)
    res.status(200).json('ok')
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
