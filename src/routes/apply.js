const { pool } = require("../db");
const express = require("express");
const router = express.Router();
const util = require("../util");

function getSections(requestBody) {
    let sectionNum = 1;
    const sections = new Set();
    while (requestBody[`title${sectionNum}`] !== undefined) {
        const sectionTitle = requestBody[`title${sectionNum}`];
        const sectionContent = requestBody[`content${sectionNum}`];
        if (sectionTitle.length > 0) {
            sections.add({ title: sectionTitle, content: sectionContent });
        }
        sectionNum += 1;
    }
    return sections;
}

function submitApplication(applicationId, req) {
    const jobId = req.params.jobId;
    const sections = getSections(req.body);
    const applicationSql = `INSERT INTO Application_IsCreatedBy_IsSubmittedTo(id, applicantEmail, jobPostingId) `
        + `VALUES (${applicationId}, '${req.cookies.userEmail}', ${jobId});\n`;

    let sectionSql = "INSERT INTO Section(title, applicationId, content) VALUES ";
    let sectionsRemaining = sections.size;
    sections.forEach(section => {
        sectionsRemaining--;
        if (sectionsRemaining === 0) {
            sectionSql += `('${section.title}', ${applicationId}, '${section.content}');`;
        } else {
            sectionSql += `('${section.title}', ${applicationId}, '${section.content}'), `;
        }
    });
    return pool.query(applicationSql + sectionSql);
}

router.use(util.validateApplicant);

router.route("/:jobId").get((req, res, next) => {
    const sql = `
        SELECT jp.jobTitle, jp.deadline, jp.description, jp.location, jpm.companyName
        FROM JobPosting jp, JobPostingModifier jpm
        WHERE id=${req.params.jobId} AND jp.lastModifiedBy = jpm.lastModifiedBy
    `;
    pool.query(sql).then(data => {
        res.locals.jobData = data.rows[0];
        res.locals.jobId = req.params.jobId;
        res.render("applicationCreation/newApplication");
    }).catch(err => {
        next(err);
    })
}).post((req, res, next) => {
    pool.query(`SELECT MAX(id) FROM Application_IsCreatedBy_IsSubmittedTo`)
    .then(data => {
        let id = 1;
        if (data.rows[0].max) {
            id = parseInt(data.rows[0].max) + 1;
        }
        
        return submitApplication(id, req);
    })
    .then(() => {
        res.redirect('/applicant/view');
    })
    .catch(err => {
        next(err);
    });
});

module.exports = router;
