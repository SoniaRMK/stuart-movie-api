const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;

//Express & bodyParser

const express = require('express');
const { json } = require('express/lib/response');
const res = require('express/lib/response');
const app = express();
//CORS 
const cors = require('cors');
app.use(cors());

//Authentication

const { check, validationResult } = require('express-validator');

// Bodyparser morgan middleware & Authorization
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const morgan = require('morgan');
let auth = require('./auth.js')(app)

  // PASSPORT //////////
  const passport = require('passport');
  require('./passport');

const uuid = require('uuid');



//Mongoose connection

mongoose.connect('mongodb://localhost:27017/FelliniMovieDB', { useNewUrlParser: true, useUnifiedTopology: true });

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
  };
  
  let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
  }; 

  app.use(morgan('common'));

  app.use(express.static('public'));
  
  app.use(myLogger);
  app.use(requestTime);

  app.use(bodyParser.json());


 // ENDPOINTS  //

  //Welcome message (Tested/Working)***

  
  app.get('/', (req, res) => {
    let responseText = 'Welcome to The Fellini Club!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
  });

  // Documentation page (Tested/Working)***

  app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
  });


 // 1. Return a list of all movies to the user (Tested & Working)*******
 app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// 2. Return data about a single movie to the user (working)

app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
    })
});

// 3. Returns data about Genre (description) by name/Title (e.g. "Drama) ------ RETURNS THRILLER NO MATER WHAT


app.get('/movies/genres/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name})
  .then((movies) => {
    res.send(movies.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// 4. Return data about a Director

app.get('/movies/directors/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"director.name": req.params.name})
  .then((movies) => {
    res.send(movies.director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
  


// 5. Creates a new user // expects a JSON in the request body (Working)**********

app.post('/users', (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.password);
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: hashedPassword,
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            Birthday: req.body.Birthday,
            
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

  // 6. Updates the information of a user by username (Tested and Working)
  app.put('/users/:username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
      $set: {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        Birthday: req.body.Birthday,
       
      }
    },
    { new: true }) // the *updated (new) document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});


  // 7. Allow users add to their list of Favorites (create)
  app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate({ username: req.params.username }, {
      $push: { favoriteMovies: req.params.MovieID }
    },
    { new: true}, //This line makes sure that the updated document is returned
    (err, updateduser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updateduser);
      }
    });
  } );

// 8. Allow users to remove a movie from their list of favorites

app.delete('/users/:username/movies/:MovieID',  passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username}, {
    $pull: { favoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// 9.  Allow existing users to deregister (Working)

app.delete('/users/:username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.username + ' was not found');
    } else {
      res.status(200).send(req.params.username + ' was deleted.' );
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


    // GET all users (Tested & Working) ***********
    app.get('/users', (req, res) => {
      Users.find().then(users => res.json(users));
    });
 
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
