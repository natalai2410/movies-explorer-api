require('dotenv').config();

const express = require('express');
// const {
//   validationCreateUser,
//   validationLogin,
// } = require('./middlewares/validations');

const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
const { createUser, login } = require('./controllers/users');
const routes = require('./routes');

const { PORT = 3000 } = process.env;

// eslint-disable-next-line import/order
const mongoose = require('mongoose');

// eslint-disable-next-line import/order
const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
// const { validationCreateUser, validationLogin } = require("./middlewares/validations");

const { validationCreateUser } = require('./middlewares/validations');

// const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

// const allowedCors = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://zvyagina.students.nomoredomains.club',
//   'https://zvyagina.students.nomoredomains.club',
//   // 'http://api.zvyagina.students.nomoredomains.club',
//   // 'https://api.zvyagina.students.nomoredomains.club',
// ];
//
// app.use(cors({
//   // origin: 'https://zvyagina.students.nomoredomains.club/',
//   origin: allowedCors,
//   credentials: true,
// }));

app.use(requestLogger);

//  app.post('/signin', validationLogin, login);

app.post('/signin', login);
app.post('/signup', validationCreateUser, createUser);

app.use(routes);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use(errorHandler);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

main();
