require('dotenv').config();
// This code should be part of your Node.js server-side application
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.PASSWORD,
    database: 'node-db'
});

const addFlight = item => {
    db.execute('INSERT INTO user (id, actualLandingTime, estimatedLandingTime, flightDirection, flightName, flightNumber, route) VALUES (?, ?, ?, ?, ?, ?, ?)', [item.id, item.actualLandingTime, item.estimatedLandingTime, item.flightDirection, item.flightName, item.flightNumber, item.route]);
};

function findFlight(id){
    db.execute('SELECT * FROM flights WHERE id = ?', [id], (err, result, fields) => {

        if(err) throw err;
        //res.render('flight', {flight: result[0]});
        //console.log(result[0]);

        return result[0];
    });


}


module.exports = {addFlight, findFlight};
