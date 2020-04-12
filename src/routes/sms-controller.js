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

        await Promise.all(sendFilesToGDrive(req.body), sendFilestoSlack(req.body))

        res.sendStatus(200)
    } catch (e) {
        return res.send(e).status(500)
    }
}

async function sendFilesToGDrive(body) {
    const numFiles = body.NumMedia
    const { chapter, driveFolder } = chapterMap[body.From]

    for (let i = 0; i < numFiles; i++) {
        const url = 'MediaUrl' + i;
        const contentType = 'MediaContentType' + i;
        let img = await fetch(body[url])
        await drive.files.create({
            resource: {
                name: `${chapter} - ${Date.now()}`,
                parents: [driveFolder]
            },
            media: {
                mimeType: body[contentType],
                body: img.body
            }
        })
    }

}

async function sendFilestoSlack(body) {
    const { slackChannel } = chapterMap[body.From]
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
