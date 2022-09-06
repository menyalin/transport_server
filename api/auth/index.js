import express from 'express'
import { bodyValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'

import {
  loginSchema,
  registrationSchema,
  configProfileSchema,
  changePasswordSchema,
  restorePasswordSchema,
  setPasswordSchema,
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
router.post(
  '/set_password',
  [bodyValidator(setPasswordSchema)],
  ctrl.setPassword,
)

router.post('/login', [bodyValidator(loginSchema)], ctrl.login)
router.post('/logout', [jwtAuth], ctrl.logout)
router.post('/refresh', ctrl.refresh)
router.post(
  '/restore_password',
  [bodyValidator(restorePasswordSchema)],
  ctrl.restorePassword,
)

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
