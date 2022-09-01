import express from 'express'
import { bodyValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'

import {
  loginSchema,
  registrationSchema,
  configProfileSchema,
  changePasswordSchema,
} from './schemes.js'
import ctrl from '../../controllers/auth.controller.js'

const router = express.Router()

// api/auth
router.get('/', [jwtAuth], ctrl.getMe)
router.get('/:id', [jwtAuth], ctrl.getById)

router.post(
  '/change_password',
  [jwtAuth, bodyValidator(changePasswordSchema)],
  ctrl.changePassword,
)

router.post('/login', [bodyValidator(loginSchema)], ctrl.login)
router.post('/logout', [jwtAuth], ctrl.logout)
router.post('/refresh', ctrl.refresh)

router.post(
  '/registration',
  [bodyValidator(registrationSchema)],
  ctrl.registration,
)
router.post(
  '/configProfile',
  [jwtAuth, bodyValidator(configProfileSchema)],
  ctrl.configProfile,
)

export default router
