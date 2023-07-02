var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/dashboard', require('./dashboard'));
router.use('/items', require('./items'));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { pageTitle: 'AdminPage' });
});

module.exports = router;
