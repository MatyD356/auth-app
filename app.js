const bycrypt = require('bcryptjs')
require('dotenv').config()
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const moongoose = require('mongoose');
const Schema = moongoose.Schema;

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
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});
app.get('/sign-up', (req, res) => res.render('sign-up-form'))
app.post('/sign-up', (req, res, next) => {
  bycrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    // if err, do something
    // otherwise, store hashedPassword in DB
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    }).save(err => {
      if (err) {
        return next(err)
      };
      res.redirect('/');
    });
  });
})
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);
app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return doesNotReject(null, false, { message: 'Incorrect username' })
      }
      bycrypt.compare(password, user.password, (err, res) => {
        if (res) {
          //pass match log in
          return done(null, user)
        } else {
          //pass do not match
          return done(null, false, { message: 'Incorrect password' })
        }
      })

    }
    )
  })
)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.listen(3000, () => console.log('app listenig on port 3000! '))