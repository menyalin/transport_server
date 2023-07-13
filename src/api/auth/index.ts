// @ts-nocheck
import express from 'express'
import { bodyValidator } from '../../utils/validator'
import { jwtAuth } from '../../utils/auth.middleware'

import {
  loginSchema,
  registrationSchema,
  configProfileSchema,
  changePasswordSchema,
  restorePasswordSchema,
  setPasswordSchema,
  confirmEmailSchema,
  retryConfirmationEmailSchema,
} from './schemes'
import ctrl from '../../controllers/auth.controller'

const router = express.Router()

// api/auth
router.get('/', [jwtAuth], ctrl.getMe)
router.get('/:id', [jwtAuth], ctrl.getById)

router.post(
  '/change_password',
  [jwtAuth, bodyValidator(changePasswordSchema)],
  ctrl.changePassword
)

router.post(
  '/confirm_email',
  [bodyValidator(confirmEmailSchema)],
  ctrl.confirmEmail
)

router.post(
  '/retry_confirmation_email',
  [jwtAuth, bodyValidator(retryConfirmationEmailSchema)],
  ctrl.retryConfirmationEmail
)

router.post(
  '/set_password',
  [bodyValidator(setPasswordSchema)],
  ctrl.setPassword
)

router.post('/login', [bodyValidator(loginSchema)], ctrl.login)
router.post('/logout', [jwtAuth], ctrl.logout)
router.post('/refresh', ctrl.refresh)
router.post(
  '/restore_password',
  [bodyValidator(restorePasswordSchema)],
  ctrl.restorePassword
)

router.post(
  '/registration',
  [bodyValidator(registrationSchema)],
  ctrl.registration
)

router.post(
  '/configProfile',
  [jwtAuth, bodyValidator(configProfileSchema)],
  ctrl.configProfile
)

export default router
