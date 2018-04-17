var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.session);
    let flag = req.session.hasOwnProperty("user");
    let name = req.session.user;
    res.render('index', {title: 'Express', flag: flag, name: name});
});

module.exports = router;
