const { pool } = require("../db");
const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
    res.render("filterUserAttributes/filterUserAttributes");
}).post((req, res) => {
    pool.query(`SELECT ${req.body.selected} FROM employee`, (err, data) => {
        if (err) throw err;
        res.locals.result = data.rows;  
        console.log(data.rows);
        res.render("filterUserAttributes/filterUserAttributes");
    });

});

module.exports = router;
