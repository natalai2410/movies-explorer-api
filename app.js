require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { createUser, login } = require('./controllers/users');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const {
  validationCreateUser,
  validationLogin,
} = require('./middlewares/validations');
const routes = require('./routes');

const { PORT = 3000 } = process.env;

// eslint-disable-next-line import/order
const mongoose = require('mongoose');

// eslint-disable-next-line import/order
const { errors } = require('celebrate');

const app = express();

app.use(express.json());

const allowedCors = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://kryukova.students.nomoredomains.icu',
  'https://kryukova.students.nomoredomains.icu',
];

app.use(cors({
  origin: allowedCors,
  credentials: true,
}));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger);
app.post('/signin', validationLogin, login);
app.post('/signup', validationCreateUser, createUser);

app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

// подключаемся к серверу mongo
async function main() {
  await mongoose.connect('mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

main();
