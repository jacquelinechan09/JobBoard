// Adapted from https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04
// Creates a connection pool so that we can issue queries.

const { Pool } = require("pg");

const pool = new Pool({
    user: "cpsc304_project_admin",
    database: "cpsc304_project",
    password: "password",
    port: 5432,
    host: "localhost"
});

module.exports = { pool };
