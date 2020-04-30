var Airtable = require('airtable');
// This attaches you to the photos table which has chapter setup and photos bases
var base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app095XefOeH5BuTo');
const fs = require('fs')

async function fetchConfig() {
    return new Promise((resolve, reject) => {
        base('Chapter Setup')
            .select({ view: "Grid view" })
            .eachPage(function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.

                const config = records.reduce((result, value) => {
                    result[value.fields['SMS Phone Number']] = {
                        chapter: value.fields['Chapter Name'],
                        slackChannel: value.fields['Slack Channel'],
                        driveFolder: value.fields['Google Drive Folder']
                    }
                    return result
                }, {});

                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
                try {
                    fs.writeFileSync('chapter-map.json', config)
                } catch (e) {
                    console.log('Failed to write chapter-map.json to disk', e)
                }
                resolve(config)
            }, function done(err) {
                if (err) { console.error(err); reject(); }
            });
    })
}

module.exports = fetchConfig