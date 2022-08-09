const { pool } = require("../db");
const express = require("express");
const router = express.Router();
const util = require("../util");
const userTypes = require("../userTypes");

router.route("/").get((req, res) => {
    res.render("applicant/applicantLogin");
}).post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    pool.query(`SELECT password FROM Applicant WHERE email = '${email}'`, (err, data) => {
        if (err) throw err;
        const rows = data.rows;
        if ((rows.length == 0) || (rows[0].password !== password)) {
            res.locals.loginFailed = true;
            res.render("applicant/applicantLogin");
        } else {
            util.clearCookies(req, res);
            res.cookie("userEmail", email, { sameSite: "lax" });
            res.cookie("userType", userTypes.APPLICANT, { sameSite: "lax" });
            res.redirect("/applicant/dashboard");
        }
    });
});

router.route("/new").get((req, res) => {
    res.render("applicant/newApplicant");
}).post((req, res, next) => {
    const emailExistsMessage = "email exists";
    pool.query(`SELECT email FROM Applicant WHERE email = '${req.body.email}'`).then(data => {
        if (data.rows.length > 0) {
            res.locals.emailExists = true;
            res.render("applicant/newApplicant");
            return Promise.reject(emailExistsMessage);
        }
        return pool.query(`INSERT INTO Applicant VALUES ('${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.location}')`);
    }).then(() => {
        res.render("applicant/applicantCreationSuccess");
    }).catch(err => {
        if (err !== emailExistsMessage) {
            next(err);
        }
    });
});

// Returns (via a promise) a list of job posting data for the company with the specified name.
// Leave the function argument unspecified to fetch job postings for all companies.
function fetchJobPostings(companyName) {
    let sql = `
        SELECT jp.id, jp.jobTitle, jp.deadline, jpm.companyName
        FROM JobPosting jp, JobPostingModifier jpm
        WHERE jp.deadline > now() AND jp.lastModifiedBy = jpm.lastModifiedBy
    `;

    if (companyName !== undefined) {
        // Appends user input to WHERE clause
        sql += ` AND jpm.companyName = '${companyName}'`;
    }

    return pool.query(sql).then(data => {
        const promises = [];
        data.rows.forEach(row => {
            promises.push(pool.query(`SELECT keywordWord FROM Describes WHERE jobPostingId = ${row.id}`).then(_data => {
                // Compiles a list of keywords for the job with ID equal to row.id
                const keywordList = [];
                _data.rows.forEach(_row => {
                    keywordList.push(_row.keywordword);
                });

                return Promise.resolve({
                    id: row.id,
                    jobtitle: row.jobtitle,
                    deadline: row.deadline,
                    companyname: row.companyname,
                    keywords: keywordList.join(', ')    // format the keywords as a nice, readable string
                });
            }));
        });
        // Do not resolve the promise until all job data are ready.
        return Promise.all(promises);
    });
};

router.route("/view").get((req, res, next) => {
    fetchJobPostings().then(data => {
        res.locals.jobData = data;
        res.render("applicant/view");
    }).catch(err => {
        next(err);
    });
}).post((req, res, next) => {
    fetchJobPostings(req.body.companyName).then(data => {
        res.locals.jobData = data;
        res.render("applicant/view");
    }).catch(err => {
        next(err);
    });
});

router.use(util.validateApplicant);
// Everything below this line is restricted to applicants.

router.route("/dashboard").get((req, res) => {
    res.render("applicant/applicantPersonal");
});

router.route("/applicationview").get((req, res) => {
    var sql = `SELECT application_iscreatedby_issubmittedto.*, jobposting.jobtitle
               FROM application_iscreatedby_issubmittedto
               INNER JOIN jobposting ON jobposting.id = application_iscreatedby_issubmittedto.jobpostingid
               WHERE application_iscreatedby_issubmittedto.applicantemail = '${req.cookies.userEmail}'`
    pool.query(sql, (err, data) => {
        if (err) throw err
        var applicationid = ''
        data.rows.forEach((appdata) => {
            applicationid = applicationid + ', ' + appdata.id
        })
        applicationid = applicationid.substring(2)
        if (applicationid == '') {
            res.render("applicant/applicationview", {noData:true})
        }
        sql = `SELECT applicationid, starttime, location
               FROM interview_isofferedto
               WHERE applicationid IN (${applicationid})`
        pool.query(sql, (err, interviewdata) => {
            if (err) throw err
            sql = `SELECT id, applicationid, deadline, offername, isaccepted, contents
                   FROM offer_comesfrom_isextendedto
                   WHERE applicationid IN (${applicationid})`
            pool.query(sql, (err, offerdata) => {
                if (err) throw err
                res.render("applicant/applicationview", {noData:false, Data:data.rows, interviewData:interviewdata.rows, offerData:offerdata.rows})
            })
            
        })
    })
})

router.route("/viewoffer").get((req, res) => {
    res.redirect("./applicationview")
}).post((req, res) => {
    var sql = `SELECT * 
               FROM offer_comesfrom_isextendedto
               WHERE applicationid = ${req.body.applicationid}`
    pool.query(sql, (err, data) => {
        if (err) throw err
        res.render("applicant/offerview", {Data:data.rows})
    })
})

router.route("/acceptoffer").get((req, res) => {
    res.redirect("./applicationview")
}).post((req, res) => {
    var sql = `UPDATE offer_comesfrom_isextendedto 
               SET isaccepted = true 
               WHERE applicationid = ${req.body.applicationid}`
    pool.query(sql, (err) => {
        if (err) throw err
        sql = `UPDATE application_iscreatedby_issubmittedto
               SET status = 'Offer Accepted'
               WHERE id = ${req.body.applicationid}`
        pool.query(sql, (err) => {
            if (err) throw err
            res.redirect("./applicationview")
        })
    })
})

module.exports = router;
