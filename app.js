/* eslint-disable no-undef */
const express = require('express');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const config = require('config');
const { getDb } = require('./database/database');
const {
  getActTrips, getTripById, getUserBookings, getUser,
} = require('./database/query');
const wyslijZgloszenie = require('./auth/wyslijzgloszenie');
const signUp = require('./auth/signup');
const authenticate = require('./auth/authenticate');

const app = express();
const port = 3000;

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static('.'));
app.set('view engine', 'pug');
app.set('views', './views');

function redirectIfAuth(req, res, next) {
  if (req.session.user) {
    res.redirect('/profile');
  } else {
    next();
  }
}

function setContext(req) {
  const logged = !!req.session.user;
  return {
    isLoggedIn: logged,
  };
}

app.use((req, res, next) => {
  const date = new Date();
  const dateStr = `Zadanie nastapilo w dniu ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  if (config.util.getEnv('NODE_ENV') !== 'test') {
    console.log(dateStr);
  }
  res.locals.dateString = dateStr;

  if (date.getDate() === 16 && date.getMonth() + 1 === 4) {
    console.log('jestem tu');
    res.send('maintenance!');

    res.end();
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

getDb().then((db) => {
  app.get('/main', async (req, res) => {
    const context = setContext(req);
    context.trips = await getActTrips(db);
    res.render('main', { context });
  });

  app.get('/trip/succ/:trip_id([0-9]{0,})', async (req, res) => {
    const context = setContext(req);
    context.trip = await getTripById(db, req.params.trip_id);
    context.msg = 'Pomyslnie wyslano zgloszenie';
    if (context.trip == null) {
      res.send('nie ma wycieczki o tkaim numerze');
    } else {
      res.render('details', { context });
    }
  });

  app.get('/trip/:trip_id([0-9]{0,})', async (req, res) => {
    const context = setContext(req);
    context.trip = await getTripById(db, req.params.trip_id);
    if (context.trip == null) {
      res.send('nie ma wycieczki o tkaim numerze');
    } else {
      res.render('details', { context });
    }
  });

  app.get('/book/:trip_id([0-9]{0,})', async (req, res) => {
    const context = setContext(req);
    const trip = await getTripById(db, req.params.trip_id);
    context.trip_id = trip ? trip.id : null;
    context.errors = [];
    if (context.trip_id == null) {
      res.send('nie ma wycieczki o tkaim numerze');
    } else {
      const form = {
        imie: '',
        nazwisko: '',
        email: '',
        liczba_miejsc: 0,
      };

      if (req.session.user) {
        const user = await getUser(db, req.session.user);
        form.imie = user.first_name;
        form.nazwisko = user.last_name;
        form.email = user.email;
      }

      context.form = form;

      res.render('book', { context });
    }
  });

  app.post(
    '/book/:trip_id([0-9]{0,})',
    body('first_name', 'imie nie moze byc puste').isLength({ min: 1 }),
    body('last_name', 'nazwisko nie moze byc puste').isLength({ min: 1 }),
    body('email', 'nieprawidlowy email').isEmail(),
    body('liczba_miejsc', 'liczba miejsc musi byc > 0').isInt({ min: 1 }),
    async (req, res) => {
      const context = setContext(req);

      const form = {
        imie: req.body.first_name,
        nazwisko: req.body.last_name,
        email: req.body.email,
        liczba_miejsc: req.body.liczba_miejsc,
      };

      const errors = validationResult(req);

      context.form = form;
      context.errors = errors.array().map((x) => x.msg);
      context.trip_id = req.params.trip_id;
      if (!errors.isEmpty()) {
        res.render('book', { context });
      } else {
        try {
          await wyslijZgloszenie(db, req.params.trip_id, form);
          res.redirect(`/trip/succ/${req.params.trip_id}`);
        } catch (err) {
          context.errors.push(err);
          res.render('book', { context });
        }
      }
    },
  );

  app.get('/signup', redirectIfAuth, async (req, res) => {
    const context = setContext(req);
    context.form = {};
    context.errors = [];
    res.render('signup', { context });
  });

  app.post(
    '/signup',
    body('first_name', 'imie nie moze byc puste').isLength({ min: 1 }),
    body('last_name', 'nazwisko nie moze byc puste').isLength({ min: 1 }),
    body('email', 'nieprawidlowy email').isEmail(),
    body('password', 'Hasło musi mieć co najmniej 6 znaków').isLength({ min: 6 }),

    async (req, res) => {
      const context = setContext(req);
      const form = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        password_conf: req.body.password_conf,
      };

      const errors = validationResult(req).array();

      if (form.password !== form.password_conf) {
        errors.push({ msg: 'Hasło i potwierdzenie się nie zgadzają.' });
      }
      context.form = form;
      context.errors = errors.map((x) => x.msg);

      if (errors.length > 0) {
        res.render('signup', { context });
      } else {
        try {
          await signUp(db, form);
          res.redirect('/profile');
        } catch (err) {
          context.errors.push(err.message);
          res.render('signup', { context });
        }
      }
    },
  );

  app.get('/login', redirectIfAuth, (req, res) => {
    const context = setContext(req);
    context.form = {};
    context.errors = [];
    res.render('login', { context });
  });

  app.post(
    '/login',
    body('email', 'nieprawidlowy email').isEmail(),
    body('password', 'Hasło musi mieć co najmniej 6 znaków').isLength({ min: 6 }),

    async (req, res) => {
      const context = setContext(req);

      const form = {
        email: req.body.email,
        password: req.body.password,
      };

      const errors = validationResult(req).array();

      context.form = form;
      context.errors = errors.map((x) => x.msg);
      if (errors.length > 0) {
        res.render('login', { context });
      } else {
        try {
          await authenticate(db, form);

          req.session.regenerate((err) => {
            if (err) next(err);

            req.session.user = form.email;

            req.session.save((err) => {
              if (err) return next(err);
              res.redirect('/profile');
              return true;
            });
          });
        } catch (err) {
          context.errors.push(err);
          res.render('login', { context });
        }
      }
    },
  );

  app.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.save((err) => {
      if (err) next(err);

      req.session.regenerate((err) => {
        if (err) next(err);
        res.redirect('/main');
      });
    });
  });

  app.get('/profile', async (req, res) => {
    const context = setContext(req);
    if (req.session.user) {
      const result = await getUserBookings(db, req.session.user);
      context.user = result.user;
      context.bookings = result.bookings;

      res.render('profile', { context });
    } else {
      res.redirect('/login');
    }
  });

  app.use((req, res) => {
    res.status(404).send('<h1>Nie znaleziono strony o podanym adresie! </h1>');
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});

module.exports = app;