const { pool } = require("../db");
const express = require("express");
const router = express.Router();

router.route("/:companyName").get((req, res, next) => {
    pool.query(`SELECT aboutUs FROM Company WHERE name = '${req.params.companyName}'`).then(data => {
        res.locals.companyName = req.params.companyName;
        if (data.rows.length > 0) {
            res.locals.aboutUs = data.rows[0].aboutus;
        }
        res.render("aboutCompany");
    }).catch(err => {
        next(err);
    });
});

module.exports = router;
