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

  //Welcome message (This is Working)********
  
  app.get('/', (req, res) => {
    let responseText = 'Welcome to The Fellini Club!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
  });

  // Documentation page (working)**********

  app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
  });


 // Get all movies (Tested & Working)********
 app.get('/movies', (req, res) => {
  Movies.find().then(movies => res.json(movies));
})

  
// Returns a joson object of a Single Movie

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

//Returns all movies of a particular genre

app.get('/movies/genres/:genre',(req, res) => {
  Movies.findOne({ "genreName": req.params.genre })
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Error: ' + err);
    })
});
  

  // GET all users (Tested & Working) ***********
  app.get('/users', (req, res) => {
    Users.find().then(users => res.json(users));
  });



  // Return Data about a genre (description) 

  app.get('/genres/:Genre', (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Genre })
      .then((movie) => {
        res.send(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
      })
  });

  // Returns the JSON object of of a director by name

  app.get('movies/directors/:Name', (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })
  });

  


 
// Creates a new user // expects a JSON in the request body
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

  // Updates the information of a user by username
  app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.Username }, {
      $set: {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        Birthday: req.body.Birthday
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

// Get a user by username
app.get('/users/:username', (req, res) => {
  Users.findOne({ username: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



 // Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
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

  //Delete Movie from favorite movies
  
  app.delete('/users/:Username/movies/:_id', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $pull: { FavoriteMovies: req.params._id }
    },
    { new: true })  // the *updated (new) document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });


// Delete a user by username
app.delete('/users/:Username/movies/:_id', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params._id }
  },
  { new: true })  // the *updated (new) document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
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
