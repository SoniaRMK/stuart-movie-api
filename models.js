const mongoose = require('mongoose');

let movieSchema = mongoose.Schema ({
    title: {type: String, required: true},
    year: Date,
    summary: {type: String, required: true},
    imageURL: {type: String, required: true},
    director: {
        Name: String,
        Bio: String
    },
    genre: {
        Name: String,
        description: String
    },
    Actors: [String],
    imageURL: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model( 'User', userSchema);

module.exports.Movie = Movie;
module.exports.User - User;