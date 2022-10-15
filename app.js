require('dotenv').config();

const cors = require('cors');
const express = require('express');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const helmet = require('helmet');

const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const routes = require('./routes');

const apiLimiter = require('./middlewares/rate');

const {
  NODE_ENV,
  PORT = 3000,
  DB_ADDRESS,
} = process.env;

const app = express();
app.use(helmet());

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

app.use(requestLogger);
app.use(apiLimiter);

app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

async function main() {
  await mongoose.connect(`${NODE_ENV === 'production' ? DB_ADDRESS : 'mongodb://localhost:27017/moviesdb'}`, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

main();
