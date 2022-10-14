const movieRoutes = require('express').Router();

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
const { validationCreateMovie, validationMovieId } = require('../middlewares/validations');

const auth = require('../middlewares/auth');

movieRoutes.use(auth);

movieRoutes.get('/movies', getMovies);
movieRoutes.post('/movies', validationCreateMovie, createMovie);
movieRoutes.delete('/movies/:id', validationMovieId, deleteMovie);

module.exports = movieRoutes;
