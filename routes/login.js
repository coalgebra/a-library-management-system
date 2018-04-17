const express = require('express');
const router = express.Router();
const mysql = require("mysql");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render("login", {flag : false});
});

router.post('/', function(req, res) {
    console.log("post on sign in");
    let username = req.body.username;
    let password = req.body.password;
    console.log(username);
    console.log(password);

    let promise = new Promise((resolve, reject) => {
        console.log("in sql");
        let result = null;
        let connection = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'qwerty',
            database: 'test'
        });
        connection.connect();
        connection.query(
            'SELECT * FROM admins WHERE name = "'+ username + '" AND password = "' + password + '";',
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length > 0) {
                        console.log("found");
                        resolve({status : 65535});
                    } else {
                        console.log("did not found");
                        resolve({status : 0});
                    }
                }
            });
        connection.end();
    }).then(result => {
        if (result.status > 50) {
            console.log("passed");
            req.session.user = username;
            res.redirect("/");
        } else {
            console.log("did not pass");
            res.render("login", {flag : false, fail : true});
        }
    }).catch(err => {

    });
});

module.exports = router;
