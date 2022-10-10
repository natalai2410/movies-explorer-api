const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

 const { JWT_SECRET, NODE_ENV } = process.env;

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ConflictError = require('../errors/conflictError');
const ServerError = require('../errors/serverError');

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  console.log(req.user);
  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new ValidationError('Переданы некорректные данные'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const { _id } = req.user;
  User.findByIdAndUpdate(_id, { name, about }, { new: true, runValidators: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
  } = req.body;
  bcrypt.hash(req.body.password, 10).then((hash) => User.create({
    name, about, avatar, email, password: hash,
  }))
    .then(() => res.send({
      name, about, avatar, email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  // ищем пользователя в  БД
  User.findUserByCredentials(email, password)
    .then((user) => {
      // eslint-disable-next-line max-len
      const token = jwt.sign({ _id: user._id }, `${NODE_ENV === 'production' ? JWT_SECRET : 'super-secret_key'}`, { expiresIn: '7d' });
      // const token = jwt.sign({ _id: user._id }, 'super-secret_key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  createUser,
  updateUser,
  login,
  getCurrentUser,
};
