app.get('/', (req, res) => {
    let responseText = 'Welcome to The Fellini Club!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
  });
  
  app.get('/secreturl', (req, res) => {
    let responseText = 'This is a secret url with super top-secret content.';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
  
  });

  app.get('/movies', (req, res) => {
    res.json(felliniMovies);
  });

  app.get('/users', (req, res) => {
    res.json(users);
  });
  

 

  // Film Title URL (Wroking / Tested in Postman)

  app.get('/movies/:title', (req, res) => {
   const { title } = req.params;
   const movie = felliniMovies.find( movie => movie.title === title );

   if (movie) {
     res.status(200).json(movie);
   } else {
     res.status(400).send('no such movie')
   }
  })

  // Return Data about a genre (description) by name/Title

  app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = felliniMovies.find( movie => movie.genre.name === genreName ).genre
 
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send('no such genre')
    }
   })

   // Return Data about the Director (bio, birth year, death year) by name.

   app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = felliniMovies.find( movie => movie.director.name === directorName ).director
 
    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).send('no such director')
    }
   })


  // Create a User
  
  app.post('/users' , (req,res)=> {const newUser = req.body;
    if(newUser.name){
      newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)}else{res.status(400).send('user needs name')}
    });


  // Update User Name
  
  app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      user.name = updateUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send("no such user!");
    }
  });

  //ADD movie to favorite movies
  
  app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    const updateUser = req.body;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      user.favoriteMovies.push(movieTitle);
      res.status(200).send(`${movieTitle} has been added to user ${id} array!`);
    } else {
      res.status(400).send("no such user!");
    }
  });

  //Delete Movie from favorite movies
  
  app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter(
        (title) => title !== movieTitle
      );
      res
        .status(200)
        .send(`${movieTitle} has been removed from user ${id} array!`);
    } else {
      res.status(400).send("no such user!");
    }
  });

  // Delete User
  
  app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      users = users.filter((user) => user.id != id);
      res.status(200).send(`user ${id} has been deleted!`);
    } else {
      res.status(400).send("no such user!");
    }
  });
  
 
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
