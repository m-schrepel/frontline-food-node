const fs = require('fs')
const moment = require('moment')
const { google } = require('googleapis')
// This holds the map between incoming number, slack hook and drive folder
const chapterMap = JSON.parse(fs.readFileSync('chapter-map.json'))
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
})
// This gets config from airtable. If we don't have it, we default to a file on disk
const fetchConfig = require('../helpers/fetch-config')
const fetch = require('node-fetch')

const smsController = async (req, res) => {
    // This will be the chapter map file, either fetched from air-table or from disk if that fails
    let config
    // if we can't fetch this
    try {
        config = await fetchConfig()
        console.log('Config fetched from airtable')
    } catch (e) {
        // use the one on disk
        config = chapterMap
        console.log('Defaulting to config from disk')
    }
    console.log('Incoming SMS from ', req.body.To, config[req.body.To])
    // We wrap this whole controller in a try catch because we might
    // get a request which is not from Twilio and all the destructuring 
    // below will fail, so we'll just let that case fail in the catch block
    try {
        // Map this incoming number to endpoints
        // How many photos are in this MMS?
        const numMedia = Number(req.body.NumMedia)
        // Just return if there aren't photos
        if (numMedia < 1) {
            return res.sendStatus(200)
        }

        await Promise.all([sendFilesToGDrive(req.body, config), sendFilestoSlack(req.body, config)])

        res.set('Content-Type', 'text/richtext')
        res.send('Thanks!').status(200)
    } catch (e) {
        return res.send(e).status(500)
    }
}

async function sendFilesToGDrive(body, config) {
    const numFiles = body.NumMedia
    const { chapter, driveFolder } = config[body.To]

    for (let i = 0; i < numFiles; i++) {
        const url = 'MediaUrl' + i;
        const contentType = 'MediaContentType' + i;
        let img = await fetch(body[url])
        await drive.files.create({
            resource: {
                name: `${moment().format('YYYY-MM-DD')}--${body.To}--${Date.now().toString().slice(-4)}`,
                parents: [driveFolder]
            },
            media: {
                mimeType: body[contentType],
                body: img.body
            }
        })
    }

}

async function sendFilestoSlack(body, config) {
    const { slackChannel } = config[body.To]
    let numFiles = Number(body.NumMedia)
    const imageBlocks = Array.from(new Array(numFiles)).map((el, idx) => {
        const imgUrl = 'MediaUrl' + idx
        return {
            type: 'image',
            image_url: body[imgUrl],
            alt_text: 'Image from SMS sender'
        }
    })
    await fetch(slackChannel, {
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
                        text: `*Message says*: ${body.Body}`
                    }
                },
                ...imageBlocks
            ]
        })
    })
}

module.exports = smsController
