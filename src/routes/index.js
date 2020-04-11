const router = require('express').Router()
const smsController = require('./sms-controller')

router.post('/sms', smsController)

module.exports = router

