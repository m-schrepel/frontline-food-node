const fs = require('fs')
const { google } = require('googleapis')
// This holds the map between incoming number, slack hook and drive folder
const chapterMap = require('../../chapter-map')
// This is a one time generated oauth response with a long-lived oauth token
const token = JSON.parse(fs.readFileSync('token.json'))
// These are the program credentials for the google application
const { client_id, client_secret, redirect_uris } = JSON.parse(fs.readFileSync('credentials.json')).installed
// Here we set up auth for the program
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// Here we actually set the credentials for auth 
oauth2Client.setCredentials(token)
// v3 of the api, using our oAuth setup
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});
const fetch = require('node-fetch')


const smsController = async (req, res) => {
    console.log(req.body)
    return res.sendStatus(200)
}

module.exports = smsController

/**
 * await fetch(process.env.SLACK_HOOK, {
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
 */