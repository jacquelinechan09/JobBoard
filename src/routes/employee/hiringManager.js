const { pool } = require("../../db");
const express = require("express");
const router = express.Router();
const util = require("../../util");

router.use(util.validateHiringManager);

router.route("/modifyposting").post((req, res) => {
    pool.query(`SELECT id, jobTitle, description, location, deadline FROM jobposting WHERE id = ${req.body.modifyId}`, (err, data) => {
        if (err) throw err
        const deadline = data.rows[0].deadline;
        // https://stackoverflow.com/a/23593099
        const month = deadline.getMonth().toString().padStart(2, '0');
        const day = deadline.getDay().toString().padStart(2, '0');
        const year = deadline.getFullYear().toString().padStart(4, '0');
        data.rows[0].deadline = `${year}-${month}-${day}`;
        res.render('employee/hiringManager/modifyposting', { jobData: data.rows[0] })
    })
})

router.route("/newoffer").post((req, res) => {
    var deadline = req.body.year + '-' + req.body.month + '-' + req.body.date + ' 23:59:59'
    var sql = `INSERT INTO offer_comesfrom_isextendedto(deadline, offerName, isAccepted, hiringManagerEmail, contents, applicationId)
               VALUES ('${deadline}'::TIMESTAMP, '${req.body.title}', FALSE, '${req.cookies.userEmail}', '${req.body.content}', '${req.body.applicationid}')
               ON CONFLICT DO NOTHING`
    pool.query(sql, (err) => {
        if (err) throw err
        sql = `UPDATE application_iscreatedby_issubmittedto
               SET status = 'Offer Extended'
               WHERE id = ${req.body.applicationid}`
        pool.query(sql, (err) => {
            if (err) throw err
            res.render('employee/hiringManager/offercreationsuccess', {applicationid:req.body.applicationid})
        })
    })
})

router.route("/modifypostingmain").post((req, res) => {
    pool.query(`SELECT companyname, name FROM employee WHERE email = '${req.cookies.userEmail}'`, (err, data) => {
        if (err) throw err
        var managercompany = data.rows[0].companyname
        var lastmodifier = data.rows[0].name + ' (' + req.cookies.userEmail + ')'
        var modifyId = req.body.modifyId.split(' ')[0]
        var modifyItem = req.body.modifyId.split(' ')[1]

        var sql = `INSERT INTO jobpostingmodifier VALUES ('${lastmodifier}', '${managercompany}') ON CONFLICT DO NOTHING;
                   INSERT INTO modifies VALUES ('${req.cookies.userEmail}', '${modifyId}') ON CONFLICT DO NOTHING;`;
        pool.query(sql, (err) => {
            if (err) throw err
            if (modifyItem == 'all') {
                sql = `UPDATE jobposting 
                       SET deadline = '${req.body.deadline} 23:59:59'::TIMESTAMP,
                           description = '${req.body.description}', 
                           location = '${req.body.location}', 
                           jobtitle = '${req.body.jobtitle}', 
                           lastmodifiedby = '${lastmodifier}', 
                           lastmodifiedtime = date_trunc('second', now()) 
                        WHERE id = ${modifyId}`
                pool.query(sql, (err) => {
                    if (err) throw err
                    res.redirect('/employee/companyView')
                })
            } else if (modifyItem == 'deadline') {
                sql = `UPDATE jobposting 
                       SET deadline = '${req.body.deadline} 23:59:59'::TIMESTAMP, lastmodifiedby = '${lastmodifier}', lastmodifiedtime = date_trunc('second', now())
                       WHERE id = ${modifyId}`
                pool.query(sql, (err) => {
                    if (err) throw err
                    res.redirect('/employee/companyView')
                })
            } else {
                sql = `UPDATE jobposting 
                       SET ${modifyItem} = '${req.body[modifyItem]}', lastmodifiedby = '${lastmodifier}', lastmodifiedtime = date_trunc('second', now())
                       WHERE id = ${modifyId}`
                pool.query(sql, (err) => {
                    if (err) throw err
                    res.redirect('/employee/companyView')
                })
            }
        })
    })
})

router.route("/addjobposting").get((req, res) => {
    res.render('employee/hiringManager/addjobposting')
}).post((req, res, next) => {
    let managerCompany; 
    let lastModifiedBy;
    pool.query(`SELECT companyname, name FROM employee WHERE email = '${req.cookies.userEmail}'`)
    .then(data => {
        managerCompany = data.rows[0].companyname;
        lastModifiedBy = data.rows[0].name + ' (' + req.cookies.userEmail + ')';
        return pool.query(`SELECT MAX(id) FROM jobposting`);
    })
    .then(data => {
        const id = (data.rows.length === 0) ? 1 : data.rows[0].max + 1;
        const sql = `
            INSERT INTO jobpostingmodifier VALUES ('${lastModifiedBy}', '${managerCompany}') ON CONFLICT DO NOTHING;
            INSERT INTO jobposting(id, deadline, description, location, jobTitle, lastModifiedBy)
                VALUES (${id}, '${req.body.deadline} 23:59:59'::TIMESTAMP, '${req.body.description}', '${req.body.location}', '${req.body.jobtitle}', '${lastModifiedBy}');
            INSERT INTO modifies(hiringManagerEmail, jobPostingId)
                VALUES ('${req.cookies.userEmail}', ${id});`;
        return pool.query(sql);
    }).then(() => {
        res.redirect("./home");
    }).catch(err => {
        next(err);
    })
})

router.route("/employeeview").get((req, res, next) => {
    let companyName;
    let companyRatingData;

    pool.query(`SELECT companyName FROM Employee WHERE email = '${req.cookies.userEmail}'`)
    .then(data => {
        companyName = data.rows[0].companyname;
        return pool.query(`SELECT COUNT(*) FROM Employee WHERE companyName = '${companyName}'`);
    }).then(data => {
        const sql = `
        SELECT COUNT(r.*)::REAL / ${parseInt(data.rows[0].count)}::REAL AS avg_num_ratings,
               AVG(r.number) AS avg_rating,
               COUNT(r.*) AS total_ratings
        FROM Employee e, Rates r
        WHERE e.email = r.employeeEmail
        AND e.companyName = '${companyName}'
        AND r.applicationId IN
            (SELECT app.id
            FROM Application_IsCreatedBy_IsSubmittedTo app, JobPosting jp, JobPostingModifier jpm
            WHERE app.jobPostingId = jp.id 
            AND jp.lastModifiedBy = jpm.lastModifiedBy 
            AND jpm.companyName = '${companyName}');
        `;
        return pool.query(sql);
    }).then(data => {
        companyRatingData = data.rows[0];
        const sql = `
            SELECT e.jobTitle,
                   e.name,
                   e.email,
                   COUNT(r.*) AS num_ratings, 
                   AVG(r.number) AS avg_rating,
                   rw.ratingWeight
            FROM Employee e, Rates r, RatingWeights rw
            WHERE e.email = r.employeeEmail
            AND e.companyName = '${companyName}'
            AND e.companyName = rw.companyName
            AND e.jobTitle = rw.jobTitle
            GROUP BY e.email, rw.ratingWeight;
        `;
        return pool.query(sql);
    }).then(data => {
        res.locals.companyName = companyName;
        res.locals.employeeData = data.rows;
        res.locals.companyRatingData = companyRatingData;
        res.render('employee/hiringmanager/employeemanage');
    }).catch(err => {
        next(err);
    });
});

router.route("/home").get((req, res) => {
    pool.query(`SELECT email, name, phoneNum, companyName, jobTitle FROM Employee WHERE email='${req.cookies.userEmail}'`, (err, data) => {
        if (err) throw err;
        res.render("employee/hiringManager/home", { personalData: data.rows });
    });
});

router.route("/newkeyword").post((req, res) => {
    pool.query(`SELECT companyName, name FROM Employee WHERE email = '${req.cookies.userEmail}'`).then(data => {
        const lastModifiedBy = `${data.rows[0].name} (${req.cookies.userEmail})`
        const sql = `
            INSERT INTO keyword VALUES('${req.body['keyword' + req.body.jobid]}') ON CONFLICT DO NOTHING;
            INSERT INTO modifies VALUES('${req.cookies.userEmail}', ${req.body.jobid}) ON CONFLICT DO NOTHING;
            INSERT INTO describes VALUES('${req.body['keyword' + req.body.jobid]}', ${req.body.jobid}) ON CONFLICT DO NOTHING;
            INSERT INTO JobPostingModifier VALUES ('${lastModifiedBy}', '${data.rows[0].companyname}') ON CONFLICT DO NOTHING;
            UPDATE JobPosting SET lastModifiedBy = '${lastModifiedBy}', lastModifiedTime = date_trunc('second', now()) WHERE id = ${req.body.jobid};
        `;
        return pool.query(sql);
    }).then(() => {
        res.redirect('/employee/companyView');
    }).catch(err => {
        next(err);
    });
});

router.route("/updaterating").post((req, res) => {
    var sql = `INSERT INTO rates VALUES('${req.cookies.userEmail}', ${req.body.applicationid}, ${req.body.rating}) ON CONFLICT DO NOTHING`
    pool.query(sql, (err) => {
        if (err) throw err
        sql = `UPDATE rates SET number = ${req.body.rating} WHERE employeeemail = '${req.cookies.userEmail}' AND applicationid = ${req.body.applicationid}`
        pool.query(sql, (err) => {
            if (err) throw err
            res.redirect("/employee/companyView")
        })
    })
})

router.route("/deleteJobs").post((req, res, next) => {
    pool.query(`DELETE FROM jobposting WHERE id IN (${req.body.selected})`, (err) => {
        if (err) return next(err);
        res.redirect('/employee/companyView')
    })
});

router.route("/aboveAvgRaters").post((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email='${req.cookies.userEmail}'`)
    .then(data => {
        const companyName = data.rows[0].companyname;
        const sql = `
            SELECT e.email, AVG(r1.number)
            FROM Employee e, Rates r1
            WHERE e.email = r1.employeeEmail
            AND r1.applicationId IN 
                (SELECT app.id
                FROM Application_IsCreatedBy_IsSubmittedTo app, JobPosting jp, JobPostingModifier jpm
                WHERE app.jobPostingId = jp.id
                AND jp.lastModifiedBy = jpm.lastModifiedBy 
                AND jpm.companyName = '${companyName}')
            GROUP BY e.email
            HAVING AVG(r1.number) > (
                SELECT AVG(r2.number)
                FROM Rates r2
                WHERE r2.applicationId IN
                    (SELECT app.id
                    FROM Application_IsCreatedBy_IsSubmittedTo app, JobPosting jp, JobPostingModifier jpm
                    WHERE app.jobPostingId = jp.id
                    AND jp.lastModifiedBy = jpm.lastModifiedBy 
                    AND jpm.companyName = '${companyName}')
            );`;
        return pool.query(sql);
    }).then(data => {
        res.locals.data = data.rows;
        res.render("employee/hiringManager/aboveAvgRaters");
    }).catch(err => {
        next(err);
    });
});

router.route("/avgRatingCompare").post((req, res, next) => {
    const input = parseFloat(req.body.number);
    pool.query(`SELECT companyName FROM Employee WHERE email='${req.cookies.userEmail}'`)
    .then(data => {
        const companyName = data.rows[0].companyname;
        const sql = `
            SELECT e.email, AVG(r1.number)
            FROM Employee e, Rates r1
            WHERE e.email = r1.employeeEmail
            AND r1.applicationId IN 
                (SELECT app.id
                FROM Application_IsCreatedBy_IsSubmittedTo app, JobPosting jp, JobPostingModifier jpm
                WHERE app.jobPostingId = jp.id
                AND jp.lastModifiedBy = jpm.lastModifiedBy 
                AND jpm.companyName = '${companyName}')
            GROUP BY e.email
            HAVING ${input} < AVG(r1.number);
        `;
        return pool.query(sql);
    }).then(data => {
        res.locals.input = input;
        res.locals.data = data.rows;
        res.render("employee/hiringManager/avgRatingCompare");
    }).catch(err => {
        next(err);
    });
});

router.route("/superManagers").post((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email='${req.cookies.userEmail}'`)
    .then(data => {
        const companyName = data.rows[0].companyname;
        res.locals.companyName = companyName;
        const sql = `
            SELECT hm.email, e.name
            FROM HiringManager hm, Employee e
            WHERE hm.email = e.email AND e.companyName = '${companyName}'
            AND NOT EXISTS (SELECT m1.jobPostingId
                    FROM Modifies m1, JobPosting jp, JobPostingModifier jpm
                    WHERE m1.jobPostingId = jp.id AND jp.lastModifiedBy = jpm.lastModifiedBy
                    AND jpm.companyName = '${companyName}'
                    EXCEPT
                    SELECT m2.jobPostingId
                    FROM Modifies m2
                    WHERE m2.hiringManagerEmail = hm.email);
            `;
        return pool.query(sql);
    }).then(data => {
        res.locals.superManagers = data.rows;
        res.render("employee/hiringManager/superManagers");
    }).catch(err => {
        next(err)
    });
});

router.route("/viewAllInterviews/:applicationId").get((req, res, next) => {
    util.validateCompany(req.params.applicationId, req.cookies.userEmail).then(() => {
        const sql = `
            SELECT i.id, i.startTime, i.endTime, i.location, c.interviewNotes, c.interviewerEmail
            FROM Interview_IsOfferedTo i, Conducts c
            WHERE i.applicationId = ${req.params.applicationId} AND i.id = c.interviewId;
        `;
        return pool.query(sql);
    }).then(data => {
        res.locals.interviewData = data.rows;
        res.locals.applicationId = req.params.applicationId;
        res.render("employee/hiringManager/viewAllInterviews");
    }).catch(err => {
        next(err);
    });
});

router.route("/editRatingWeights").get((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email = '${req.cookies.userEmail}'`).then(data => {
        return pool.query(`SELECT jobTitle, ratingWeight FROM RatingWeights WHERE companyName = '${data.rows[0].companyname}'`);
    }).then(data => {
        res.locals.ratingWeightData = data.rows;
        res.render("employee/hiringManager/editRatingWeights");
    }).catch(err => {
        next(err);
    });
}).post((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email = '${req.cookies.userEmail}'`).then(data => {
        const sql = `
            UPDATE RatingWeights
            SET ratingWeight = ${req.body.number}
            WHERE jobTitle = '${req.body.jobTitle}' AND companyName = '${data.rows[0].companyname}';
        `
        return pool.query(sql);
    }).then(() => {
        res.redirect("/employee/hiringManager/editRatingWeights");
    }).catch(err => {
        next(err);
    });
});

router.route("/editAboutUs").get((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email = '${req.cookies.userEmail}'`).then(data => {
        res.locals.companyName = data.rows[0].companyname;
        return pool.query(`SELECT aboutUs FROM Company WHERE name = '${data.rows[0].companyname}'`);
    }).then(data => {
        res.locals.aboutUs = data.rows[0].aboutus;
        res.render("employee/hiringManager/editAboutUs");
    }).catch(err => {
        next(err);
    })
}).post((req, res, next) => {
    pool.query(`SELECT companyName FROM Employee WHERE email = '${req.cookies.userEmail}'`).then(data => {
        return pool.query(`UPDATE Company SET aboutUs = '${req.body.aboutUs}' WHERE name = '${data.rows[0].companyname}'`);
    }).then(() => {
        res.redirect("/employee/hiringManager/editAboutUs");
    }).catch(err => {
        next(err);
    });
});

module.exports = router;
