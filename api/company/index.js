import express from 'express'

import { bodyValidator, queryValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import ctrl from '../../controllers/company.controller.js'
import {
  createCompanySchema,
  existInnSchema,
  userByEmailSchema,
  newEmployeeSchema,
} from './schemes.js'

const router = express.Router()

// api/companies
router.get('/', [jwtAuth], (...args) => ctrl.getMyCompanies(...args))
router.get('/exist_inn', [jwtAuth, queryValidator(existInnSchema)], (...args) =>
  ctrl.isExistInn(...args),
)
router.get(
  '/user_by_email',
  [jwtAuth, queryValidator(userByEmailSchema)],
  (...args) => ctrl.userByEmail(...args),
)
router.put('/settings/:id', [jwtAuth], ctrl.updateSettings)
router.post('/', [jwtAuth, bodyValidator(createCompanySchema)], (...args) =>
  ctrl.create(...args),
)
router.post(
  '/:companyId/staff',
  [jwtAuth, bodyValidator(newEmployeeSchema)],
  (...args) => ctrl.addEmployee(...args),
)

export default router
