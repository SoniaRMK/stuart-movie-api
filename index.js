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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const morgan = require('morgan');

const uuid = require('uuid');

  // PASSPORT //////////
  const passport = require('passport');
  require('./passport');

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


 // Get all movies (Tested / Working)***
 app.get('/movies', (req, res) => {
  Movies.find().then(movies => res.json(movies));
})

  
// Returns a joson object of a Single Movie (Tested / Working)***

app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
    })
});

//Returns all movies of a particular genre  ++++++

app.get('/movies/:genre', (req, res) => {
  Movies.find({ genre: req.params.genre })
    .then((movies) => {
      res.json(movies);
    })
    .catch ((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
    })
});
  

  // GET all users (Tested & Working) ***********
  app.get('/users', (req, res) => {
    Users.find().then(users => res.json(users));
  });



  // Return Data about a genre (description) 



  // Returns the JSON object of of a director by name

  app.get('/movies/directors/:director', (req, res) => {
    Movies.findOne({ director: req.params.director })
      .then((movies) => {
        res.json(movies.director);
      })
      .catch ((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err)
      })
  });

  


 
// Creates a new user // expects a JSON in the request body (Working)**********
app.post('/users', (req, res) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: req.body.password,
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

  // Updates the information of a user by username (Tested and Working)
  app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
      $set: {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        Birthday: req.body.Birthday,
        favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
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


// Add a movie to a user's list of favorites  (NOT WORKING)
app.post('/users/:username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

  //Delete Movie from favorite movies (NOT WORKING)
  
  app.delete('users/:username/movies/:MovieID', (req, res) => {
    Users.findOneAndRemove({ Title: req.params.Title })
      .then((movies) => {
        if (!movies) {
          res.status(400).send(req.params.Title + ' was not found');
        } else {
          res.status(200).send(req.params.Title + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


// Delete a user by username  (NOT WORKING)
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete a user by id  (NOT WORKING)
app.delete('/users/:_id', (req, res) => {
  Users.findOneAndRemove({ _id: req.params._id })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params._id + ' was not found');
      } else {
        res.status(200).send(req.params._id + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
  
 
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
