/**
 * Module dependencies.
 */
var express = require('express')
  , passport = require('passport')
  , site = require('./site')
  , oauth2 = require('./oauth2')
  , user = require('./user')
  , client = require('./client')
  , util = require('util')
, login = require('./login');
  
  
// Express configuration
  
var app = express.createServer();
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ name: 'iPlanetDirectoryPro', secret: 'keyboard cat' }));
/*
app.use(function(req, res, next) {
  console.log('-- session --');
  console.dir(req.session);
  //console.log(util.inspect(req.session, true, 3));
  console.log('-------------');
  next()
});
*/
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// Passport configuration

require('./auth');


app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);

app.get('/iam/oauth2/customer/authorize', oauth2.authorize);
app.post('/iam/oauth2/customer/authorize', oauth2.authorize);
app.post('/iam/oauth2/customer/access_token', oauth2.token);
app.post('/oauth2/token', oauth2.token);


app.post('/authorize', oauth2.decision);

app.get('/api/userinfo', user.info);
app.get('/api/clientinfo', client.info);

app.post('/iam/json/customer/authenticate', login.authenticate);

app.get('*', function(req, res) {
    console.log('req', req, res);
});

app.listen(3002);
