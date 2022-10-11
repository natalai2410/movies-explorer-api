// импортируем модель
const Card = require('../models/card');

const { REQUEST_OK, CREATE_OK } = require('../errors/errors');

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ServerError = require('../errors/serverError');
const forbiddenError = require('../errors/forbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards.map((element) => element)))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  // При успешной авторизации в объекте запроса появится свойство user
  const owner = req.user._id; // используем req.user

  Card.create({ name, link, owner })
    .then((cards) => res.status(CREATE_OK).send(cards))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при создании карточки'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

// eslint-disable-next-line consistent-return
const deleteCard = (req, res, next) => {
  const { id } = req.params;
  return Card.findById(id)
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Card.findByIdAndRemove(id).then(() => res.status(REQUEST_OK).send(card)).catch(next);
      } else {
        // eslint-disable-next-line new-cap
        next(new forbiddenError('Отказано в доступе'));
      }
    })
    .catch(next);
};

// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res, next) => {
  const { id } = req.params;
  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).then((card) => {
    if (!card) {
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    }
    return res.send(card);
  })
    .catch((err) => {
      if ((err.name === 'ValidationError') || (err.kind === 'ObjectId')) {
        return next(new ValidationError('Переданы некорректные данные для постановки лайка'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

// DELETE /cards/:cardId/likes — убрать лайк с  карточки
const dislikeCard = (req, res, next) => {
  const { id } = req.params;
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).then((card) => {
    if (!card) {
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    }
    return res.send(card);
  })
    .catch((err) => {
      if ((err.name === 'ValidationError') || (err.kind === 'ObjectId')) {
        return next(new ValidationError('Переданы некорректные данные для постановки лайка'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
