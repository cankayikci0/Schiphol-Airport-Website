const db  = require('./db');

const express = require('express');
const bodyParser = require('body-parser');

//console.log(db);

const app = express();




app.set('view engine', 'ejs');
app.get('/',(req,res,next) => {
    //Write a code that will get data from database and send it to the client
    
    db.query('SELECT * FROM flights', (err, result, fields) => {
        if(err) throw err;
        //console.log(result);
        res.render('main', {flights: result});
    }
    );
});

const Flight = require('./add-flight');


app.post('/flights/:id', (req, res, next) => {
    const flightId = req.params.id;

    // Fetch flight data based on the provided ID
    db.execute('SELECT * FROM flights WHERE id = ?', [flightId], (err, result, fields) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving flight data');
        }

        if (result.length === 0) {
            return res.status(404).send('Flight not found');
        }

        const flightData = result[0];

        // Insert flight data into the user table
        db.execute('INSERT INTO user (id, actualLandingTime, estimatedLandingTime, flightDirection, flightName, flightNumber, route) VALUES (?, ?, ?, ?, ?, ?, ?)', [flightData.id, flightData.actualLandingTime, flightData.estimatedLandingTime, flightData.flightDirection, flightData.flightName, flightData.flightNumber, flightData.route], (err, insertResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('You have already booked this flight');
                console.log(err.message);
            }
            console.log('Flight data inserted successfully');
            res.status(200).redirect(302, '/');
            
        });
    });
});

app.get('/flights/your-flights', (req, res, next) => {
    db.query('SELECT * FROM user', (err, result, fields) => {

        if(err) throw err;
        res.render('user', {flights: result});
        console.log(result[0]);
    });
}
);

app.listen(3000);