require('dotenv').config();

const express = require('express');
const {
  validationCreateUser,
  validationLogin,
} = require('./middlewares/validations');
const errorHandler = require('./middlewares/errorHandler');
const { createUser, login } = require('./controllers/users');
const routes = require('./routes');
// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

// eslint-disable-next-line import/order
const mongoose = require('mongoose');
// eslint-disable-next-line import/order
const { errors } = require('celebrate');

// eslint-disable-next-line import/order
const { requestLogger, errorLogger } = require('./middlewares/logger');

// eslint-disable-next-line import/no-unresolved,import/order
const cors = require('cors');

const app = express();

app.use(express.json());

const allowedCors = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://zvyagina.students.nomoredomains.club',
  'https://zvyagina.students.nomoredomains.club',
  // 'http://api.zvyagina.students.nomoredomains.club',
  // 'https://api.zvyagina.students.nomoredomains.club',
];

app.use(cors({
  // origin: 'https://zvyagina.students.nomoredomains.club/',
  origin: allowedCors,
  credentials: true,
}));

// app.use(cookieParser());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger); // подключаем логгер запросов
app.post('/signin', validationLogin, login);
app.post('/signup', validationCreateUser, createUser);

app.use(routes);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorHandler);

// подключаемся к серверу mongo
async function main() {
  await mongoose.connect('mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
  });
}

main();
