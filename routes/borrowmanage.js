const express = require('express');
const router = express();
const mysql = require('mysql');
const sqlconfig = require('./constant').sqlconfig;
const sd = require('silly-datetime');

router.get('/', (req, res, next) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
        connection.query(
            'select record_id, card_number, name, booknum, bookname, lent_date as borrow_time, return_date as return_time\n' +
            'from records natural join books natural join library_cards;', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.render('borrowmanage', {flag:true, name:name, results : result});
    }).catch(err => {
        console.log(err);
        res.render('borrowmanage', {flag:true, name:name, fail : true, errmsg : err});
    });
});

router.post('/search', (req, res, next) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let recordid = req.body.recordid;
    let cardnumber = req.body.cardnumber;
    let booknumber = req.body.booknumber;
    let cname = req.body.name;
    let bookname = req.body.bookname;
    let hidereturned = req.body.hidereturned;
    let connection = mysql.createConnection(sqlconfig);
    connection.connect();
    let query =
        'select record_id, card_number, name, booknum, bookname, lent_date as borrow_time, return_date as return_time\n' +
        'from records natural join books natural join library_cards where true';
    if (recordid) query += ' and locate(\'' + recordid + '\', record_id) <> 0';
    if (cardnumber) query += ' and locate(\'' + cardnumber + '\', card_number) <> 0';
    if (cname) query += ' and locate(\'' + cname + '\', name) <> 0';
    if (booknumber) query += ' and locate(\'' + booknumber + '\', booknum) <> 0';
    if (bookname) query += ' and locate(\'' + bookname + '\', bookname) <> 0';
    if (hidereturned) query += ' and return_date is null';
    query += ";";
    let promise = new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    }).then(result => {
        res.render('borrowmanage', {flag:true, name:name, results : result});
    }).catch(err => {
        console.log(err);
        res.render('borrowmanage', {flag:true, name:name, fail : true, errmsg : err});
    });
});

router.post('/return', (req, res, next) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let record_id = req.body.id;
    let connection = mysql.createConnection(sqlconfig);
    connection.connect();
    let date = sd.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    let query = 'update records\n' +
        'set return_date = \'' + date + '\'\n' +
        'where record_id = \'' + record_id + '\';';
    let promise = new Promise((resolve, reject) => {
        connection.query(
            query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.redirect('/borrowmanage');
    }).catch(err => {
        console.log(err);
        res.render('borrowmanage', {flag:true, name:name, fail : true, errmsg : err});
    });
});

router.post('/borrow', (req, res, next) => {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let recordid = req.body.recordid;
    let cardnumber = req.body.cardnumber;
    let booknumber = req.body.booknumber;
    let date = sd.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    let query = 'insert into records values (\n' +
        '    \'' + recordid + '\',\n' +
        '  \'' + cardnumber + '\',\n' +
        '  \'' + booknumber +'\',\n' +
        '  \'' + date + '\',\n' +
        '  null,\n' +
        '  \'' + name + '\'\n' +
        ');';
    let connection = mysql.createConnection(sqlconfig);
    connection.connect();
    let promise = new Promise((resolve, reject) => {
        connection.query(
            query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.redirect('/borrowmanage');
    }).catch(err => {
        console.log(err);
        res.render('borrowmanage', {flag:true, name:name, fail : true, errmsg : err});
    });
});

module.exports = router;