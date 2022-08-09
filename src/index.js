// CITATIONS:
// SQL execution approach from https://stackoverflow.com/a/22757249
// Reading a file into memory: https://nodejs.org/api/fs.html#fsreadfilepath-options-callback
// Relative paths in NodeJS: https://stackoverflow.com/questions/13051961/proper-way-to-reference-files-relative-to-application-root-in-node-js
// An example of promises: https://thewebdev.info/2022/05/01/how-to-make-a-promise-from-settimeout-with-javascript/

const { pool } = require("./db");
const fs = require("fs");
const path = require("path");

/**
 * Asynchronously executes the SQL file at the given path. The result
 * is returned via a promise.
 */
function runSqlFile(relativePath) {
    return new Promise((resolve) => {
        fs.readFile(path.join(__dirname, relativePath), (err, data) => {
            if (err) throw err;
            pool.query(data.toString(), (_err, result) => {
                if (_err) throw _err;
                resolve(result);
            });
        });
    });
}

async function initializeTables() {
    // Of course, we wouldn't want to drop all tables in an actual production environment.
    // While the initialization scripts are still changing, though, dropping all tables is
    // an easy way to ensure that any changes to the scripts will take effect in the database.
    await runSqlFile("./sql/dropAllTables.sql");
    await runSqlFile("./sql/createTables.sql");
    await runSqlFile("./sql/populateTables.sql");

    // To demonstrate that the initialization worked: query for all job postings
    // that belong to the company "University of British Columbia". There should be
    // two postings.
    //
    // This query was constructed with the help of section 5.2.1 of the textbook.
    const ubcPostings = await pool.query("SELECT jobTitle "
        + "FROM JobPosting AS jp, JobPostingModifier AS jpm "
        + "WHERE jp.lastModifiedBy = jpm.lastModifiedBy "
        + "AND jpm.companyName = 'University of British Columbia';");
    const jobTitles = new Set();
    jobTitles.add(ubcPostings.rows[0].jobtitle);
    jobTitles.add(ubcPostings.rows[1].jobtitle);
    if (!jobTitles.has('Vice President') || !jobTitles.has('Senior Professor')) {
        throw new Error('Database initialization test failed.');
    }
    console.log('Successfully initialized database.');
}

initializeTables();
