var express = require('express')
  , app = express()
  , http = require('http')
  , path = require('path')
  , bcrypt = require('bcrypt')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , flash = require('connect-flash')
  , session = require('express-session')
  , server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(bodyParser());
app.use(cookieParser());
app.use(flash());
app.use(session({
  secret: 'tacocat',
  key: 'sid'
}));

app.get('/', function(req, res) {
  res.render("index", {user: req.session.user, message: req.flash('info')});
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;

  if (username == '' || password == '' || password_confirmation == '') {
    req.flash('info', "Cannot be blank");
    res.redirect('/');
    return;
  }

  if (password != password_confirmation) {
    req.flash('info', "Passwords do not match");
    res.redirect('/');
    return;
  }

  if (db[username] != null) {
    req.flash('info', "Username already taken");
    res.redirect('/');
    return;
  }

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      db[username] = hash;
      req.flash('info', "Signed up!");
      // Log in after sign up
      // req.session.user = username;
      res.redirect('/');
    });
  });

});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (username == '' || password == '') {
    req.flash('info', "Cannot be blank");
    res.redirect('/');
    return;
  }
  
  if (db[username] == null) {
    req.flash('info', "Username does not exist");
    res.redirect('/');
    return;
  }

  bcrypt.compare(password, db[username], function(err, match) {
    if (match == false) {
      req.flash('info', "Password is incorrect");
      res.redirect('/');
      return;
    }

    req.flash('info', "Logged in!");
    req.session.user = username;
    res.redirect('/');
  });

});

app.post('/logout', function(req, res) {
  req.flash('info', "Logged out!");
  req.session.user = null;
  res.redirect('/');
});

var db = {};

server.listen(3000);
