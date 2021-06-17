const express = require('express')
const router = express.Router()

const { bodyValidator } = require('../../utils/validator')
const { jwtAuth } = require('../../utils/auth.middleware')
const { create, getMyCompanies } = require('./handlers')
const { createCompanySchema } = require('./schemes')

router.get('/', [jwtAuth], getMyCompanies)
router.post('/', [jwtAuth, bodyValidator(createCompanySchema)], create)

module.exports = router
