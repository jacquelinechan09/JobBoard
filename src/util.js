const userTypes = require("./userTypes");
const { pool } = require("./db")

module.exports = { 
    clearCookies: function(req, res) {
        Object.keys(req.cookies).forEach((cookie) => {
            res.clearCookie(cookie);
        });
    },

    validateHiringManager: function(req, res, next) {
        if (req.cookies && req.cookies.userEmail) {
            const userType = req.cookies.userType;
            if (userType === userTypes.HIRING_MANAGER_AND_INTERVIEWER) {
                res.locals.isHiringManager = true;
                res.locals.isInterviewer = true;
                return next();
            } else if (userType === userTypes.HIRING_MANAGER) {
                res.locals.isHiringManager = true;
                return next();
            }
        }
        return res.render('employee/error');
    },

    validateInterviewer: function(req, res, next) {
        if (req.cookies && req.cookies.userEmail) {
            const userType = req.cookies.userType;
            if (userType === userTypes.HIRING_MANAGER_AND_INTERVIEWER) {
                res.locals.isHiringManager = true;
                res.locals.isInterviewer = true;
                return next();
            } else if (userType === userTypes.INTERVIEWER) {
                res.locals.isInterviewer = true;
                return next();
            }
        }
        return res.render('employee/error');
    },

    validateEmployee: function(req, res, next) {
        if (req.cookies && req.cookies.userEmail) {
            const userType = req.cookies.userType;
            if (userType === userTypes.HIRING_MANAGER_AND_INTERVIEWER) {
                res.locals.isHiringManager = true;
                res.locals.isInterviewer = true;
                return next();
            } else if (userType === userTypes.HIRING_MANAGER) {
                res.locals.isHiringManager = true;
                return next();
            } else if (userType === userTypes.INTERVIEWER) {
                res.locals.isInterviewer = true;
                return next();
            }
        }
        return res.render("employee/error");
    },

    validateApplicant: function(req, res, next) {
        if (req.cookies && req.cookies.userEmail && req.cookies.userType === userTypes.APPLICANT) {
            return next();
        }
        return next("User is not logged in as an applicant.");
    },

    validateCompany: function(applicationId, userEmail) {
        const sql = `SELECT jpm.companyName `
            + `FROM Application_IsCreatedBy_IsSubmittedTo app, JobPosting jp, JobPostingModifier jpm `
            + `WHERE app.id = ${applicationId} AND app.jobPostingId = jp.id AND jp.lastModifiedBy = jpm.lastModifiedBy`;
        
        return pool.query(sql)
        .then(data => {
            if (data.rows.length > 0) {
                return pool.query(`SELECT companyName FROM Employee WHERE email='${userEmail}' AND companyName = '${data.rows[0].companyname}'`);
            }
            return Promise.reject("Invalid application ID");
        })
        .then(data => {
            if (data.rows.length > 0) {
                return Promise.resolve("Validated");
            }
            return Promise.reject("Invalid application ID");
        });
    }
};
