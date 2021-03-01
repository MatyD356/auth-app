require('dotenv').config()
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const moongoose = require('mongoose');
const Schema = mongoose.Schema;

const mongoDb = process.env.MONGO_DB_LINK;

moongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = moongoose.connection;
db.on('error', console.error.bind(console, 'mongo connectione error'));

const User = moongoose.model(
  'User',
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
)

const app = express();
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index'));

app.listen(3000, () => console.log('app listenig on port 3000! '))