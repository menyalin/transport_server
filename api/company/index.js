import express from 'express'

import { bodyValidator, queryValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import ctrl from '../../controllers/company.controller.js'
import { createCompanySchema, existInnSchema } from './schemes.js'

const router = express.Router()

// api/companies
router.get('/', [jwtAuth], (...args) => ctrl.getMyCompanies(...args))
router.get('/exist_inn', [jwtAuth, queryValidator(existInnSchema)], (...args) =>
  ctrl.isExistInn(...args),
)

router.put('/settings/:id', [jwtAuth], ctrl.updateSettings)
router.post('/', [jwtAuth, bodyValidator(createCompanySchema)], (...args) =>
  ctrl.create(...args),
)

export default router
