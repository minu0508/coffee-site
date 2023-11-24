var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require("method-override");
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionStore = require("./middleware/session");

var indexRouter = require('./src/routes/index');
var signinRouter = require('./src/routes/signinRouter');
var signupRouter = require('./src/routes/signupRouter');
var menulistRouter = require('./src/routes/menulistRouter');
var orderRouter = require('./src/routes/orderRouter');
var basketRouter = require('./src/routes/basketRouter');
var resultRouter = require('./src/routes/resultRouter');
var managementRouter = require('./src/routes/management')
var ingredientRouter = require('./src/routes/ingredientRouter');
var supplyRouter = require('./src/routes/supplyRouter')
var bestRouter = require('./src/routes/bestRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method", {
  methods: ["POST", "GET"]
}));

app.use(session({
  secret:"20191514", // 나만의 보안 키
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}))

app.use('/', indexRouter);
app.use('/menulist', menulistRouter);
app.use('/menudetail', menulistRouter);
app.use('/order', orderRouter);
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/basket', basketRouter);
app.use('/result', resultRouter);
app.use('/ordermanagement', managementRouter);
app.use('/ingredientmanagement', ingredientRouter);
app.use('/supplyreport', supplyRouter);
app.use('/bestmenu', bestRouter);

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
