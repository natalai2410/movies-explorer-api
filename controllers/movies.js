const Movie = require('../models/movie');

const { REQUEST_OK, CREATE_OK } = require('../utils/constants');

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ServerError = require('../errors/serverError');
const ForbiddenError = require('../errors/forbiddenError');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      if (!movies) {
        throw new NotFoundError('Данные не найдены!');
      }
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;

  Movie.create({ owner, ...req.body })
    .then((movies) => res.status(CREATE_OK).send(movies))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при создании карточки фильма'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

const deleteMovie = (req, res, next) => {
  const { id } = req.params;
  return Movie.findById(id)
    .orFail(() => {
      throw new NotFoundError('Карточка фильма с указанным _id не найдена');
    })
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(id).then(() => res.status(REQUEST_OK).send(movie)).catch(next);
      } else {
        next(new ForbiddenError('Отказано в доступе'));
      }
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
