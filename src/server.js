const { pool } = require("./db");
const path = require("path");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bp = require("body-parser");
const util = require("./util");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(cookieParser());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.cookies = req.cookies;
    next();
});

app.use((err, req, res, next) => {
    res.send(err);
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/logout", (req, res) => {
    util.clearCookies(req, res);
    res.render("logoutsuccess");
});

app.get("/companyaggregation", (req, res) => {
    var sql = `SELECT t.companyname, AVG(t.avg_rating) AS company_avg_rating_score, AVG(t.num_rating) AS company_avg_rating, SUM(t.num_rating) AS company_total_rating
               FROM (SELECT e.email, e.companyname, AVG(rates.number) AS avg_rating, COUNT(rates.applicationid) AS num_rating, rw.ratingweight
                     FROM (SELECT e2.email, e2.jobtitle, e2.companyname 
                           FROM employee e1
                           INNER JOIN employee e2 ON e1.companyname = e2.companyname) e 
                     INNER JOIN rates ON e.email = rates.employeeemail 
                     INNER JOIN ratingweights rw ON rw.companyname = e.companyname AND rw.jobtitle = e.jobtitle
                     GROUP BY e.email, rw.ratingweight, e.companyname) t
               GROUP BY t.companyname`
    pool.query(sql, (err, data) => {
        if (err) throw err
        res.render("companyaggregation", {Data:data.rows})
    })
    
})

app.use("/applicant", require("./routes/applicant"));
app.use("/employee", require("./routes/employee"));
app.use("/apply", require("./routes/apply"));
app.use("/userLookup", require("./routes/userLookup"));
app.use("/filterUserAttributes", require("./routes/filterUserAttributes"));
app.use("/aboutCompany", require("./routes/aboutCompany"));

app.listen(3000);
console.log("Server running at http://localhost:3000");
