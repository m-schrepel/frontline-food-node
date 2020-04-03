var router = require('express').Router();

router.get('/', (req, res) => res.send('Yup. This is the server!').status(200))

module.exports = router