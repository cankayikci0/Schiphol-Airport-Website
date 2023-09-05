const mysql = require('mysql2');
require('dotenv').config();



const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.PASSWORD,
    database: 'node-db'
});

//db.execute('INSERT INTO flights (id) VALUES (1)');
//console.log(db);

const axios = require('axios');

const apiUrl = 'https://api.schiphol.nl/public-flights/flights?includedelays=false&page=0&sort=%2BscheduleTime';

const headers = {
    'Accept': 'application/json',
    'app_id': '6283fab5',
    'app_key': '83aef5286d5648a96ef0b264e79581bc',
    'ResourceVersion': 'v4'
};

axios.get(apiUrl, { headers })
    .then(response => {
        
    
        // Handle the response data here

        for(item of response.data.flights){
            // console.log(item);
            db.execute('INSERT IGNORE INTO flights (id, actualLandingTime, estimatedLandingTime, scheduleDateTime,flightDirection, flightName, flightNumber, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.actualLandingTime, item.estimatedLandingTime, item.scheduleDateTime, item.flightDirection, item.flightName, item.flightNumber, item.route.destinations]);
        };
    })
    .catch(error => {
        console.error('Error:', error);
    });

module.exports = db;

//route: { destinations: [ 'PMI' ], eu: 'S', visa: false },