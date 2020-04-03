const express = require('express')
const router = require('./routes')
const bodyParser = require('body-parser')

const app = express()
// Nginx reverse proxies 3000 to 80
const port = 3000
// routes entrypoint
app.use(router)
app.use(bodyParser)

app.listen(port, () => console.log(`Server started on ${port}`))