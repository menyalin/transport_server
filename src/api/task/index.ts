// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import {
  // bodyValidator,
  queryValidator
} from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import { taskConfirmHandler } from './handlers.js'
import { taskConfirmSchema } from './schemes.js'

const router = express.Router()

// api/tasks
router.post(
  '/:id',
  [jwtAuth, queryValidator(taskConfirmSchema)],
  taskConfirmHandler
)

export default router
