const userRoutes = require('express').Router();

const {
  updateUser,
  getCurrentUser,
} = require('../controllers/users');

const {
  validationUpdateUser,
} = require('../middlewares/validations');
const auth = require('../middlewares/auth');

userRoutes.use(auth);

userRoutes.get('/users/me', getCurrentUser);

userRoutes.patch('/users/me', validationUpdateUser, updateUser);

module.exports = userRoutes;
