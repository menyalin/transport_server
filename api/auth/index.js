import express from 'express'
import { bodyValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import {
  login,
  registration,
  getMe,
  configProfile,
  getById,
  changePassword,
} from './handlers.js'
import {
  loginSchema,
  registrationSchema,
  configProfileSchema,
  changePasswordSchema,
} from './schemes.js'

const router = express.Router()

// api/auth
router.get('/', [jwtAuth], getMe)
router.get('/:id', [jwtAuth], getById)

router.post(
  '/change_password',
  [jwtAuth, bodyValidator(changePasswordSchema)],
  changePassword,
)
router.post('/login', [bodyValidator(loginSchema)], login)
router.post('/registration', [bodyValidator(registrationSchema)], registration)
router.post(
  '/configProfile',
  [jwtAuth, bodyValidator(configProfileSchema)],
  configProfile,
)

export default router
