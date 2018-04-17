const express = require('express');
const router = express();
const mysql = require('mysql');
const sqlconfig = require('./constant').sqlconfig;
const sd = require('silly-datetime');

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
        connection.query('select card_number, name, create_time, count(lent_date) as borrowed, count(return_date) as returned\n' +
            'from (\n' +
            '  select\n' +
            '    library_cards.card_number,\n' +
            '    library_cards.name,\n' +
            '    library_cards.create_time,\n' +
            '    records.lent_date,\n' +
            '    records.return_date\n' +
            '  from library_cards\n' +
            '    left join records on library_cards.card_number = records.card_number\n' +
            ') as T\n' +
            'group by T.card_number;',
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.render('cardmanage', {flag: flag, name: name, results : result});
    }).catch(err => {
        // do nothing
    });
});

router.get('/dataerr', function (req, res, next) {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
        connection.query('select card_number, name, create_time, count(lent_date) as borrowed, count(return_date) as returned\n' +
            'from (\n' +
            '  select\n' +
            '    library_cards.card_number,\n' +
            '    library_cards.name,\n' +
            '    library_cards.create_time,\n' +
            '    records.lent_date,\n' +
            '    records.return_date\n' +
            '  from library_cards\n' +
            '    left join records on library_cards.card_number = records.card_number\n' +
            ') as T\n' +
            'group by T.card_number;',
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        connection.end();
    }).then(result => {
        res.render('cardmanage', {flag: flag, name: name, results : result, fail : true});
    }).catch(err => {
    });
});

router.post('/remove', function (req, res, next) {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let cardnumber = req.body.cardnumber;
    console.log("removing ", cardnumber);
    let config = Object.create(sqlconfig);
    config.multipleStatements = true;
    let connection = mysql.createConnection(config);
    let promise = new Promise((resolve, reject) => {
        let query = "delete from records where card_number = '" + cardnumber + "';\n" +
            "delete from library_cards where card_number = '" + cardnumber + "';";
        console.log(query);
        connection.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    }).then(result => {
        res.redirect("/cardmanage");
    }).catch(err => {
        res.redirect('/cardmanage/dataerr');
    });
});

router.post('/', function (req, res, next) {
    let flag = req.session.hasOwnProperty("user");
    if (!flag) {
        res.redirect("/");
        return;
    }
    let name = req.session.user;
    let cardnumber = req.body.cardnumber;
    let cname = req.body.name;
    let create_time = sd.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    let query = 'insert into library_cards values (';
    query += "'" + cardnumber + "', ";
    query += "'" + cname + "', ";
    query += "'" + create_time + "');";
    let promise = new Promise((resolve, reject) => {
        let connection = mysql.createConnection(sqlconfig);
        connection.connect();
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
        res.redirect("/cardmanage");
    }).catch(err => {
        console.log(err);
        res.redirect("/cardmanage/dataerr");
    });
});

module.exports = router;