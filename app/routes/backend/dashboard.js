var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
  res.render('pages/dashboard/index', { pageTitle: 'Dashboard Page' });
});

module.exports = router;
