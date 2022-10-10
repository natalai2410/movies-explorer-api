const Movie = require('../models/movie');

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ServerError = require('../errors/serverError');
const forbiddenError = require('../errors/forbiddenError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => res.send(cards.map((element) => element)))
    .catch(next);
};

const createMovies = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Movie.create({ name, link, owner })
    .then((cards) => res.send(cards))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при создании карточки фильма'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

const deleteMovies = (req, res, next) => {
  const { id } = req.params;
  return Movie.findById(id)
    .orFail(() => {
      throw new NotFoundError('Фильм с указанным _id не найден');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(id).then(() => res.send(card)).catch(next);
      } else {
        // eslint-disable-next-line new-cap
        next(new forbiddenError('Отказано в доступе'));
      }
    })
    .catch(next);
};

module.exports = {
  getCards: getMovies,
  createMovies,
  deleteMovies,
};
