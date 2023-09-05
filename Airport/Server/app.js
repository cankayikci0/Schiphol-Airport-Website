const db  = require('./db');

const bcrypt = require('bcrypt');

const express = require('express');
const bodyParser = require('body-parser');

const passport = require('passport');
const session = require('express-session');

const LocalStrategy = require('passport-local').Strategy;


//console.log(db);

const app = express();

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
    
app.use(passport.initialize());
app.use(passport.session());

const authUser = (username, password, done) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result, fields) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];
            try {
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (passwordMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password' });
                }
            } catch (e) {
                return done(e);
            }
        } else {
            return done(null, false, { message: 'No user with that username' });
        }
    });
};


passport.use(new LocalStrategy(authUser));

passport.serializeUser((user, done) => {
    console.log('Serializing user')
    done(null, user);
}
);

passport.deserializeUser((user, done) => {
        done(null, user);
    }
);



app.use(bodyParser.urlencoded({extended: false}));


app.set('view engine', 'ejs');
app.get('/',(req,res,next) => {
    //Write a code that will get data from database and send it to the client
    if(!req.isAuthenticated()){
        res.redirect('/login');
    }
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

    const userId = req.user;

    //console.log(userId);
    

    
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
        console.log(flightData);
        console.log(req.user.id);

        // Insert flight data into the user table
        db.execute('INSERT INTO user_flights (user_id, flight_id) VALUES(?,?)', [req.user.id, flightData.id],(err, insertResult) => {
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
    const userId = req.user.id;

    db.query('SELECT f.* FROM flights f JOIN user_flights uf ON f.id = uf.flight_id WHERE uf.user_id = ?', [userId], (err, result, fields) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred' });
        }

        if (result.length === 0) {
            return res.json({ message: 'No flights found for the user' });
        }

        res.render('your-flights', {flights: result});
    });
});



// app.post('/flights/your-flights/:id', (req, res, next) => {

//     const flightId = req.params.id;

//     db.execute('DELETE FROM user WHERE id = ?', [flightId], (err, result, fields) => {
//         if(err) throw err;
//         res.status(200).redirect(302, '/flights/your-flights');
//     }
//     );
// }
// );

app.get('/register', (req, res, next) => {
    res.render('registration');
}
);

app.get('/login', (req, res, next) => {
    res.render('login');
    db.query('SELECT * FROM users WHERE username = ?', ['can'], (err, result, fields) => {
        if(err) throw err;
        console.log(result[0]);
    }
    );
}
);


app.post('/register', async (req, res, next) => {

const username = req.body.username;
const password = req.body.password;

const hashedPassword = await bcrypt.hash(password, 10);

const query = 'INSERT INTO users (username, password_hash) SELECT ?, ? WHERE NOT EXISTS (SELECT username FROM users WHERE username = ?)'
const values = [username, hashedPassword, username];

db.execute(query, values, (err, result, fields) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      // Handle other database-related errors here
      res.status(500).send('Internal Server Error');
    } else {
      if (result.affectedRows === 1) {
        // One row was inserted, indicating a successful registration
        res.status(200).redirect(302, '/login');
      } else {
        // No rows were inserted, indicating a duplicate username
        res.status(400).send('Username already exists');
      }
    }
  });

}
);

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
})
);

app.listen(3000);