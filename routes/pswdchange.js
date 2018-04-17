const express = require('express');
const router = express();
const mysql = require('mysql');
const sqlconfig = require('./constant').sqlconfig;

router.get('/', (req, res, next) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    res.render('pswdchange', {flag : flag, name : name});
});

router.get('/wrong', (req, res) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    res.render('pswdchange', {flag : flag, name : name, fail : true});
});

router.post('/', (req, res, next) => {
    let oldpassword = req.body.oldpassword;
    let newpassword = req.body.newpassword;
    let name = req.session.user;
    let connection = mysql.createConnection(sqlconfig);
    let query = "select * from admins where name = '" + name + "' and password = '" + oldpassword + "';";
    let promise = new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err || results.length === 0) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    }).then(result => {
        connection.query("update admins set password = '" + newpassword + "' where name = '" + name + "';");
        res.redirect('/');
    }).catch(error => {
        res.redirect('/pswdchange/wrong');
    });
});

module.exports = router;