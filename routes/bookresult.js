const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const sqlconfig = require("./constant").sqlconfig;

/* GET users listing. */
router.post('/', function(req, res, next) {
    console.log("get book result");
    let flag = req.session.hasOwnProperty("user");
    let name = req.session.user;
    let promise = new Promise((resolve, reject) => {
        let result = null;
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
        let query = 'SELECT * FROM books ';
        if (req.body.bookname) {
            query += "where ";
            query += "locate('" + req.body.bookname +"', booknum) <> 0" + " or ";
            query += "locate('" + req.body.bookname +"', bookname) <> 0" + " or ";
            query += "locate('" + req.body.bookname +"', publisher) <> 0" + " or ";
            query += "locate('" + req.body.bookname +"', year) <> 0" + " or ";
            query += "locate('" + req.body.bookname +"', author) <> 0";
        }
        query += ';';
        console.log(query);
        connection.query(
            query ,
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(results);
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        console.log("got result");
        res.render('bookresult', {flag: flag, name: name, results : result});
    }).catch(err => {
        // do nothing
    });
});

module.exports = router;