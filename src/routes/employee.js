const { pool } = require("../db");
const express = require("express");
const router = express.Router();
const util = require("../util");
const userTypes = require("../userTypes");

router.use("/hiringManager", require("./employee/hiringManager"));
router.use("/interviewer", require("./employee/interviewer"));

router.route("/").get((req, res) => {
    res.render("employee/employeeLogin");
}).post((req, res) => {
    let isHiringManager = false;
    let isInterviewer = false;

    pool.query(`SELECT password FROM employee WHERE email = '${req.body.email}'`)
    .then((data) => {
        const rows = data.rows;
        if (rows.length == 0 || rows[0].password !== req.body.password) {
            res.locals.loginFailed = true;
            res.render("employee/employeeLogin");
            return Promise.reject('Bad login');
        } else {
            return pool.query(`SELECT email FROM hiringmanager WHERE email='${req.body.email}'`)
        }
    })
    .then((data) => {
        if (data.rows.length > 0) {
            isHiringManager = true;
        }
        return pool.query(`SELECT email FROM interviewer WHERE email='${req.body.email}'`);
    })
    .catch((err) => {
        if (err === 'Bad login') {
            return Promise.reject(err); // skip the next "then"
        } else {
            throw err;
        }
    })
    .then((data) => {
        res.cookie('userEmail', req.body.email);
        isInterviewer = (data.rows.length > 0);

        if (isHiringManager) {
            if (isInterviewer) {
                res.cookie('userType', userTypes.HIRING_MANAGER_AND_INTERVIEWER)
            } else {
                res.cookie('userType', userTypes.HIRING_MANAGER);
            }
            res.redirect('employee/hiringManager/home');
        } else {
            res.cookie('userType', userTypes.INTERVIEWER);
            res.redirect('employee/interviewer/home');
        }
    })
    .catch((err) => {});
});


router.route("/new").get((req, res) => {
    res.render("employee/newEmployee");
}).post((req, res, next) => {
    if (!req.body.hiringManager && !req.body.interviewer) {
        return next("Must select at least one employee type");
    }

    const emailExistsMessage = "email exists";
    pool.query(`SELECT email FROM Employee WHERE email = '${req.body.email}'`).then(data => {
        if (data.rows.length > 0) {
            res.locals.emailExists = true;
            res.render("employee/newEmployee");
            return Promise.reject(emailExistsMessage);
        }
        let sql = `INSERT INTO company(name) VALUES ('${req.body.companyname}') ON CONFLICT DO NOTHING; `
        + `INSERT INTO ratingweights VALUES ('${req.body.companyname}', '${req.body.jobtitle}', 1) ON CONFLICT DO NOTHING; `
        + `INSERT INTO employee VALUES ('${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.phonenum}','${req.body.companyname}', '${req.body.jobtitle}'); `;

        if (req.body.hiringManager) {
            sql += `INSERT INTO hiringmanager VALUES ('${req.body.email}') ON CONFLICT DO NOTHING; `;
        }
        if (req.body.interviewer) {
            sql += `INSERT INTO interviewer VALUES ('${req.body.email}') ON CONFLICT DO NOTHING; `;
        }
        return pool.query(sql);
    }).then(() => {
        res.render("employee/employeeCreationSuccess");
    }).catch(err => {
        if (err !== emailExistsMessage) {
            next(err);
        }
    });
});

router.use(util.validateEmployee);
// Everything below this line is restricted to employees.

router.route("/companyView").get((req, res, next) => {
    pool.query(`SELECT companyname FROM employee WHERE email = '${req.cookies.userEmail}'`)
    .then(data => {
        // Find job posting data and application count for each job posting
        // belonging to the employee's company.
        // Note: the "LEFT OUTER JOIN" will include job postings which don't have
        // any applications yet.
        var company = data.rows[0].companyname;
        const sql = `
        SELECT jp.*, COUNT(app.id) AS appCount
        FROM JobPosting jp
        LEFT OUTER JOIN Application_IsCreatedBy_IsSubmittedTo app ON jp.id = app.jobPostingId
        WHERE jp.id IN (SELECT jp2.id
                        FROM JobPosting jp2, JobPostingModifier jpm
                        WHERE jp2.lastModifiedBy = jpm.lastModifiedBy AND jpm.companyName = '${company}')
        GROUP BY jp.id
        ORDER BY jp.id;
        `;

        return pool.query(sql);
    }).then(data => {
        const promises = [];

        // Loop over job postings from the employee's company.
        data.rows.forEach(row => {
            // Inspiration from https://stackoverflow.com/a/40329190
            // This block of code kicks off a query to find the keywords for the current job posting.
            promises.push(pool.query(`SELECT keywordWord FROM Describes WHERE jobPostingId = ${row.id}`)
                .then(_data => {
                    const keywordList = [];
                    _data.rows.forEach(_row => {
                        keywordList.push(_row.keywordword);
                    });
                    row.keywords = keywordList.join(', ');  // format the keywords as a comma-separated list
                    return Promise.resolve(row);
                })
            );
        });

        // The next "then" block only executes when all keywords for all job postings are found.
        return Promise.all(promises);
    }).then(promiseResult => {
        res.render("employee/companyView", { jobData: promiseResult });
    }).catch(err => next(err));
})

router.route("/viewApplications").post((req, res) => {
    pool.query(`SELECT * FROM application_iscreatedby_issubmittedto WHERE jobpostingid = ${req.body.jobid}`, (err, applicationdata) => {
        if (err) throw err
        res.render('employee/viewApplications', {applicationData:applicationdata.rows, jobID:req.body.jobid})
    })
})

router.route("/viewApplication").post((req, res) => {
    var sql = `SELECT application_iscreatedby_issubmittedto.*, applicant.name, applicant.location AS applicantlocation, jobposting.jobtitle, jobposting.description, jobposting.location AS joblocation, section.title, section.content ` 
            + `FROM application_iscreatedby_issubmittedto ` 
            + `INNER JOIN applicant ON application_iscreatedby_issubmittedto.applicantemail = applicant.email `
            + `INNER JOIN jobposting ON application_iscreatedby_issubmittedto.jobpostingid = jobposting.id `
            + `INNER JOIN section ON application_iscreatedby_issubmittedto.id = section.applicationid `
            + `WHERE application_iscreatedby_issubmittedto.id = ${req.body.applicationid}`
    pool.query(sql, (err, data) => {
        if (err) throw err
        var fileattachment = []
        for (let i = 0; i < data.rows.length; i++) {
            fileattachment[i] = {title:data.rows[i].title, content:data.rows[i].content}
        }
        sql = `SELECT rates.number, ratingweights.ratingweight, employee.email ` 
            + `FROM rates ` 
            + `INNER JOIN employee ON rates.employeeemail = employee.email `
            + `INNER JOIN ratingweights ON employee.companyname = ratingweights.companyname AND employee.jobtitle = ratingweights.jobtitle `
            + `WHERE rates.applicationid = ${req.body.applicationid}`
        pool.query(sql, (err, ratingdata) => {
            if (err) throw err
            var totalRating = 0
            var totalWeight = 0
            var managerHasRated = false
            var managerRating = 0
            ratingdata.rows.forEach((rateData) => {
                totalRating = totalRating + (rateData.number * rateData.ratingweight)
                totalWeight = totalWeight + rateData.ratingweight
                if (rateData.email == req.cookies.userEmail) {
                    managerHasRated = true
                    managerRating = rateData.number
                }
            })
            var finalRating = totalRating / totalWeight
            sql = `SELECT * 
                   FROM offer_comesfrom_isextendedto
                   WHERE applicationid = ${req.body.applicationid}`
            pool.query(sql, (err, offerdata) => {
                if (err) throw err;
                res.render('employee/viewApplication', {Data:data.rows[0], fileData:fileattachment, Rating:finalRating, hasRated:managerHasRated, specificRating:managerRating, offerData:offerdata.rows})
            })  
        })
    })
})



module.exports = router;
