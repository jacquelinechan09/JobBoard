const { pool } = require("../db");
const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
    res.render("userLookup/userLookup");
}).post((req, res) => {
    pool.query(`SELECT email, name FROM ${req.body.table} WHERE ${req.body.attribute} = '${req.body.attributeValue}'`, (err, data) => {
        if (err) throw err;
        res.locals.result = data.rows;
        res.render("userLookup/userLookup");
    });
});

module.exports = router;
