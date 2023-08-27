const db  = require('./db');

const express = require('express');

//console.log(db);

const app = express();


app.set('view engine', 'ejs');
app.use((req,res,next) => {
    //Write a code that will get data from database and send it to the client
    
    db.query('SELECT * FROM flights', (err, result, fields) => {
        if(err) throw err;
        console.log(result);
        res.render('main', {flights: result});
    }
    );
});

app.listen(3000);