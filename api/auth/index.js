import express from 'express'
import { bodyValidator } from '../../utils/validator.js'
import { jwtAuth } from '../../utils/auth.middleware.js'
import { login, registration, getMe } from './handlers.js'
import { loginSchema, registrationSchema } from './schemes.js'

const router = express.Router()

/* GET home page. */
router.get('/', [jwtAuth], getMe)
router.post('/login', [bodyValidator(loginSchema)], login)
router.post('/registration', [bodyValidator(registrationSchema)], registration)

export default router
