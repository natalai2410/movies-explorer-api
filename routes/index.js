const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./movies');
const NotFoundError = require('../errors/notFoundError');
const { validationLogin, validationCreateUser } = require('../middlewares/validations');
const { login, createUser } = require('../controllers/users');

router.post('/signin', validationLogin, login);
router.post('/signup', validationCreateUser, createUser);

router.use(userRoutes);
router.use(cardRoutes);

router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
