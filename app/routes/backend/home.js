var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/home/index', { pageTitle: 'HomePage' });
});

module.exports = router;
