const express = require('express')
const router = express.Router()

const { bodyValidator } = require('../../utils/validator')
const { jwtAuth } = require('../../utils/auth.middleware')
const { login, registration, getMe } = require('./handlers')
const { loginSchema, registrationSchema } = require('./schemes')

/* GET home page. */
router.get('/', [jwtAuth], getMe)
router.post('/login', [bodyValidator(loginSchema)], login)
router.post('/registration', [bodyValidator(registrationSchema)], registration)

module.exports = router
