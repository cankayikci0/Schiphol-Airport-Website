const db  = require('./db');

const express = require('express');

//console.log(db);

const app = express();


app.set('view engine', 'ejs');
app.get('/',(req,res,next) => {
    //Write a code that will get data from database and send it to the client
    
    db.query('SELECT * FROM flights', (err, result, fields) => {
        if(err) throw err;
        console.log(result);
        res.render('main', {flights: result});
    }
    );
});

app.post('/flights/:id', (req,res,next) => {
    //console.log(req.params.id);

    db.query('SELECT * FROM flights WHERE id = ?', [req.params.id], (err, result, fields) => {
        if(err) throw err;
        console.log(result);
        res.render('flight', {flight: result[0]}
        );
});
});

app.listen(3000);