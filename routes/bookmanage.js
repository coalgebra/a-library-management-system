const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const formidable = require("formidable");
const sqlconfig = require("./constant").sqlconfig;
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const fs = require('fs');

/* GET users listing. */
router.get('/', function (req, res, next) {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
        let query = 'SELECT * FROM books;';
        connection.query(
            query ,
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.render('bookmanage', {flag: flag, name: name, results : result});
    }).catch(err => {
        // do nothing
    });
});

router.post('/remove', function(req, res, next) {
    console.log("Removing " + req.body.number);
    let booknumber = req.body.number;
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let promise = new Promise((resolve, reject) => {
        let config = Object.create(sqlconfig); config.multipleStatements = true;
        let connection = mysql.createConnection(config);
        connection.connect();
        let query = "delete from records where booknum = '" + booknumber + "';" +
            "delete from books where booknum = '" + booknumber + "';";
        connection.query(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
        connection.end();
    }).then(result => {
        console.log("fuck it");
        res.redirect("/bookmanage");
    }).catch(err => {
        res.render('bookmanage', {flag: flag, fail : true, errmsg : err});
    });
});

router.get('/dataerr', function(req, res) {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
        let query = 'SELECT * FROM books;';
        connection.query(
            query ,
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.render('bookmanage', {flag: flag, name: name, results : result, fail : true});
    }).catch(err => {
        // do nothing
    });
});

router.post('/load', function (req, res) {
    let config = Object.create(sqlconfig);
    config.multipleStatements = true;
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    const form = new formidable.IncomingForm();
    form.parse(req, (err, body, files) => {
        if (!files) {
            res.redirect('/bookmanage/dataerr');
            return;
        }
        let path = files.file.path;
        let content = fs.readFileSync(path).toString();
        let lines = content.split('\n');
        let connection = mysql.createConnection(config);
        let query = "";
        for (let i = 0; i < lines.length; i++) {
            let params = lines[i].split(',');
            query += "insert into books values (";
            query += params.join(",");
            query += ");";
        }
        let promise = new Promise((resolve, reject) => {
            connection.query(query, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            });
            connection.end();
        }).then(result => {
            res.redirect('/bookmanage');
        }).catch(err => {
            res.render('bookmanage', {flag: flag, name: name, fail : true, errmsg : err});
        });
    });
});

router.post('/', function(req, res, next) {
    console.log("wtf");
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    const form = new formidable.IncomingForm();
    form.parse(req, (err, body, files) => {
        let bookname = body.bookname;
        let booknum = body.booknumber;
        let publisher = body.publisher;
        let year = body.year;
        let author = body.author;
        let price = body.price;
        let total = body.total;
        let promise = new Promise((resolve, reject) => {
            let connection = mysql.createConnection(sqlconfig);
            connection.connect();
            let query = 'insert into books values (';
            query += "'" + booknum + "', '"
                + bookname + "', '"
                + publisher + "', "
                + year + ", '"
                + author + "', "
                + price + ", "
                + total + ", "
                + total + ");";
            connection.query(
                query ,
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            connection.end();
        }).then(result => {
            res.redirect("/bookmanage");
        }).catch(err => {
            res.render('bookmanage', {flag: flag, name: name, fail : true, errmsg : err});
        });
    });

});

module.exports = router;