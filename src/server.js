const express = require('express')
const router = require('./routes')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Nginx reverse proxies 3000 to 80
const port = 3000
// routes entrypoint
app.use(router)

app.listen(port, () => console.log(`Server started on ${port}`))