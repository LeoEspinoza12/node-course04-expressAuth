const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promoRouter = require('./routes/promoRouter');

const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017/manski', {
  useNewUrlParser: true
});


const dishes = require('./models/schema')

connect.then((db)=>{
  console.log('connected correctly to the server \n');
}, (err)=>{
  console.log(err)
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// this part, we are going to create a function that will create
// the authentication of the user if he is login or not. if the user
// is logged in, then the user will be authenticated
function auth(req, res, next){
  
  // here we are going to log te request headers
  console.log(`Response Headers: `, req.headers, ` \n\n `);

  // assign a variable that will take the headers
  var authHeader = req.headers.authorization;

  // validate if the headers are true
  if(!authHeader) {

    // set an error for the header
    var err = new Error('Eey, no estas authenticado. \n Necesitas login la primera \n');

    // set the header
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err)
  }

  // buffer the header
  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
  console.log('Authorization auth: \n ', auth, '\n\n')

  // initiate the username and password
  var username = auth[0];
  var password = auth[1];

  // check if the password are the same
  if(username === 'admin' && password === 'password'){
    next();
  } else {

    // create a variable that we can pass the new error
    var err = new Error('Eey, no estas authenticado. \n Necesitas login la primera');

    // set the header
    res.setHeader('WWW-Authenticate', 'Basic');
    // set the header
    err.status = 401;
    return next(err)
  }

}

// call the auth function
app.use(auth)

// this is to send static pages if the user will not
// go to a specific route. the static pages are 
// placed in the public routes
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
