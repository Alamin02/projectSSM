//Express Router
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('monitor');
});



module.exports = router;