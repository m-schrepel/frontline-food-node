const router = require('express').Router()
const fetch = require('node-fetch')

router.get('/', (req, res) => res.send('Yup. This is the server!').status(200))
router.get('/oauth2callback', (req, res) => {
    const code = req.query.code;
    client.getToken(code, (err, tokens) => {
        if (err) {
            console.error('Error getting oAuth tokens:');
            throw err;
        }
        client.credentials = tokens;
        res.send('Authentication successful! Please return to the console.');
    });
})
router.post('/sms', async (req, res) => {
    console.log(process.env.SLACK_HOOK)
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
                    type: 'image',
                    image_url: `${req.body.MediaUrl0}`,
                    alt_text: 'Image from SMS sender'
                },

            ]
        })
    })
    return res.sendStatus(200)
})

module.exports = router

