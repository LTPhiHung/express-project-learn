var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const flash = require('connect-flash');
const flash = require('express-flash-notification');
const session = require('express-session');

var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const pathConfig = require('./path');
// Define Path
global.__base = __dirname + '/';
global.__path_app = __base + pathConfig.folder_app + '/';
global.__path_configs = __path_app + pathConfig.folder_configs + '/';
global.__path_helpers = __path_app + pathConfig.folder_helpers + '/';
global.__path_routes = __path_app + pathConfig.folder_routes + '/';
global.__path_schemas = __path_app + pathConfig.folder_schemas + '/';
global.__path_validates = __path_app + pathConfig.folder_validates + '/';
global.__path_views = __path_app + pathConfig.folder_views + '/';

const systemConfig = require(__path_configs + 'system');
const databaseConfig = require(__path_configs + 'database');

// var indexRouter = require('./routes/backend/home');
// var itemRouter = require('./routes/backend/items');

mongoose.connect(`mongodb+srv://${databaseConfig.username}:${databaseConfig.password}@cluster0.ksu1ffa.mongodb.net/${databaseConfig.database}?retryWrites=true&w=majority`)
  .then(() => {
    console.log('connected to db')
  });

// const kittySchema = new mongoose.Schema({
//   name: String
// });

// const Kitten = mongoose.model('Kitten', kittySchema);

// const silence = new Kitten({ name: '12345' });
// console.log(silence.name); // 'Silence'

// silence.save();

var app = express();
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(flash(app, {
  viewName: __path_views + 'elements/notify',
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', __path_views + 'backend');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//  Local variable
app.locals.systemConfig = systemConfig;

// setup router
app.use(`/${systemConfig.prefixAdmin}`, require(__path_routes + 'backend/index'));
app.use('/', require(__path_routes + 'frontend/index'));

// app.use('/admin/items', itemRouter);
// app.use('/admin/dashboard', require('./routes/backend/dashboard'));

// CRUD: Create Update Delete Sorting Filter Search Pagination 

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
  res.render(__path_views + 'pages/error', { pageTitle: 'Page Not Found' });
});

module.exports = app;
