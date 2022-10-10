const movieRoutes = require('express').Router();

const { getCards, createMovies, deleteMovies } = require('../controllers/movies');
// const { validationCreateMovie, validationMovieId } = require('../middlewares/validations');

// const auth = require('../middlewares/auth');
// cardRoutes.use(auth);

movieRoutes.get('/movies', getCards);

// movieRoutes.post('/movies', validationCreateMovie, createMovies);
movieRoutes.post('/movies', createMovies);
// movieRoutes.delete('/movies/:id', validationMovieId, deleteMovies);
movieRoutes.delete('/movies/:id', deleteMovies);

module.exports = movieRoutes;
