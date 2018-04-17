const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    let flag = req.session.hasOwnProperty("user");
    let name = req.session.user;
    console.log(flag, name);
    res.render('about', {title: 'Express', flag: flag, name: name});
});

module.exports = router;