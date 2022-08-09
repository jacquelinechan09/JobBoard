const { pool } = require("../../db");
const express = require("express");
const router = express.Router();
const util = require("../../util");

router.use(util.validateInterviewer);

router.route("/home").get((req, res) => {
    pool.query(`SELECT email, name, phoneNum, companyName, jobTitle FROM Employee WHERE email='${req.cookies.userEmail}'`, (err, data) => {
        if (err) throw err;
        res.render("employee/interviewer/home", { personalData: data.rows });
    });
});

router.route("/createInterview/:applicationId").get((req, res, next) => {
    util.validateCompany(req.params.applicationId, req.cookies.userEmail).then(() => {
        res.locals.applicationId = req.params.applicationId;
        res.render("employee/interviewer/createInterview");
    }).catch(err => {
        next(err);
    });
}).post((req, res, next) => {
    util.validateCompany(req.params.applicationId, req.cookies.userEmail).then(() => {
        return pool.query(`SELECT MAX(id) FROM Interview_IsOfferedTo`)
    }).then(data => {
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const location = req.body.location;

        if (startTime >= endTime) {
            return Promise.reject("End time must be later than start time.");
        }
        if (!location) {
            return Promise.reject("Location cannot be blank.");
        }

        let id = 1;
        if (data.rows[0].max) {
            id = parseInt(data.rows[0].max) + 1;
        }

        const startTimestamp = `'${req.body.date} ${startTime}'::TIMESTAMP`;
        const endTimestamp = `'${req.body.date} ${endTime}'::TIMESTAMP`;
        const sql = `INSERT INTO Interview_IsOfferedTo(id, startTime, endTime, location, applicationId) `
            + `VALUES (${id}, ${startTimestamp}, ${endTimestamp}, '${location}', ${req.params.applicationId});\n`
            + `INSERT INTO Conducts(interviewerEmail, interviewId) `
            + `VALUES ('${req.cookies.userEmail}', ${id});\n`
            + `UPDATE Application_IsCreatedBy_IsSubmittedTo `
            + `SET status='Selected for Interview' `
            + `WHERE id=${req.params.applicationId}`;
        return pool.query(sql);
    }).then(() => {
        res.render("employee/interviewer/createInterviewSuccess");
    }).catch(err => {
        next(err);
    });
});

router.route("/viewInterviews/:applicationId").get((req, res, next) => {
    util.validateCompany(req.params.applicationId, req.cookies.userEmail).then(() => {
        const sql = `
            SELECT i.id, i.startTime, i.endTime, i.location, c.interviewNotes
            FROM Interview_IsOfferedTo i, Conducts c
            WHERE i.applicationId = ${req.params.applicationId} AND i.id = c.interviewId AND c.interviewerEmail = '${req.cookies.userEmail}';
        `;
        return pool.query(sql);
    }).then(data => {
        res.locals.applicationId = req.params.applicationId;
        res.locals.interviewData = data.rows;
        res.render("employee/interviewer/viewInterviews");
    }).catch(err => {
        next(err);
    });
});

router.route("/updateInterviewNotes/:interviewId").post((req, res, next) => {
    let applicationId;
    pool.query(`SELECT applicationId FROM Interview_IsOfferedTo WHERE id=${req.params.interviewId}`)
    .then(data => {
        if (!data.rows) {
            return Promise.reject(`No interview with ID ${req.params.interviewId}`);
        }
        applicationId = data.rows[0].applicationid;
        return util.validateCompany(applicationId, req.cookies.userEmail);
    }).then(() => {
        const notes = req.body.notes;
        return pool.query(`UPDATE Conducts SET interviewNotes = '${notes}' WHERE interviewId = ${req.params.interviewId} AND interviewerEmail = '${req.cookies.userEmail}'`);
    }).then(() => {
        res.redirect(`/employee/interviewer/viewInterviews/${applicationId}`);
    }).catch(err => {
        next(err);
    });
});

module.exports = router;
