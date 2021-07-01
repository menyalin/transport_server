import express from 'express'

import { bodyValidator, queryValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import {
  create,
  getMyCompanies,
  isExistInn,
  userByEmail,
  addEmployee
} from './handlers.js'
import {
  createCompanySchema,
  existInnSchema,
  userByEmailSchema,
  newEmployeeSchema
} from './schemes.js'

const router = express.Router()

// api/companies
router.get('/', [jwtAuth], getMyCompanies)
router.get('/exist_inn', [jwtAuth, queryValidator(existInnSchema)], isExistInn)
router.get(
  '/user_by_email',
  [jwtAuth, queryValidator(userByEmailSchema)],
  userByEmail
)
router.post('/', [jwtAuth, bodyValidator(createCompanySchema)], create)
router.post(
  '/:companyId/staff',
  [jwtAuth, bodyValidator(newEmployeeSchema)],
  addEmployee
)

export default router
