const fs = require('fs');

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '',
        user: '',
        password: '',
        database: '',
        port: '',
        ssl: true,
    },
    pool: { min: 0, max: 20 },
});
