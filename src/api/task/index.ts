// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import {
  // bodyValidator,
  queryValidator,
} from '../../utils/validator'
import { jwtAuth } from '../../utils/auth.middleware'
import { taskConfirmHandler } from './handlers'
import { taskConfirmSchema } from './schemes'

const router = express.Router()

// api/tasks
router.post(
  '/:id',
  [jwtAuth, queryValidator(taskConfirmSchema)],
  taskConfirmHandler
)

export default router
