const router = require('express').Router()
const fetch = require('node-fetch')

router.get('/', (req, res) => res.send('Yup. This is the server!').status(200))
router.post('/sms', async (req, res) => {
    await fetch(process.env.SLACK_HOOK, {
        method: 'post',
        body: JSON.stringify({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `:iphone: Incoming SMS :iphone:`
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Message says*: ${req.body.Body}`
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `[With image](${req.body.MediaUrl0})`
                    }
                },

            ]
        })
    })
    return res.sendStatus(200)
})

module.exports = router

