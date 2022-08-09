-- External sources used:
-- The PostgreSQL Docs: https://www.postgresql.org/docs/current/sql.html
-- CREATE TABLE syntax: https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-create-table/
-- Debugging an error with quotation marks: https://stackoverflow.com/a/30542991

-- ==================
-- Entity sets:
-- ==================

CREATE TABLE IF NOT EXISTS Applicant(
    email VARCHAR(80) PRIMARY KEY,
    password VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    location VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS Company(
    name VARCHAR(80) PRIMARY KEY,
    aboutUs VARCHAR(4000) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS RatingWeights(
    companyName VARCHAR(80) NOT NULL,
    jobTitle VARCHAR(80) NOT NULL,
    ratingWeight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (companyName, jobTitle),
    FOREIGN KEY (companyName) REFERENCES Company(name) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Employee(
    email VARCHAR(80) PRIMARY KEY,
    password VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    phoneNum VARCHAR(20),
    companyName VARCHAR(80),
    jobTitle VARCHAR(80) NOT NULL,
    FOREIGN KEY (companyName) REFERENCES Company(name) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (companyName, jobTitle) REFERENCES RatingWeights(companyName, jobTitle) 
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS HiringManager(
    email VARCHAR(80) PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES Employee(email) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Interviewer(
    email VARCHAR(80) PRIMARY KEY,
    FOREIGN KEY (email) REFERENCES Employee(email) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS JobPostingModifier(
    lastModifiedBy VARCHAR(170) NOT NULL,
    companyName VARCHAR(80) NOT NULL,
    PRIMARY KEY (lastModifiedBy),
    FOREIGN KEY (companyName) REFERENCES Company(name) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS JobPosting(
    id SERIAL PRIMARY KEY,
    deadline TIMESTAMP NOT NULL,
    description VARCHAR(4000) NOT NULL DEFAULT '',
    location VARCHAR(80) NOT NULL,
    jobTitle VARCHAR(80) NOT NULL,
    lastModifiedBy VARCHAR(170) NOT NULL,
    lastModifiedTime TIMESTAMP NOT NULL DEFAULT date_trunc('second', now()), -- https://stackoverflow.com/a/6195521
    FOREIGN KEY (lastModifiedBy) REFERENCES JobPostingModifier(lastModifiedBy)
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Keyword(
    word VARCHAR(30) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Application_IsCreatedBy_IsSubmittedTo(
    id SERIAL PRIMARY KEY,
    submissionTime TIMESTAMP NOT NULL DEFAULT date_trunc('second', now()),
    status VARCHAR(80) NOT NULL DEFAULT 'Submitted',
    applicantEmail VARCHAR(80) NOT NULL,
    jobPostingId INTEGER NOT NULL,
    FOREIGN KEY (applicantEmail) REFERENCES Applicant(email)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (jobPostingId) REFERENCES JobPosting(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Section(
    title VARCHAR(80) NOT NULL,
    applicationId INTEGER NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (title, applicationId),
    FOREIGN KEY (applicationId) REFERENCES Application_IsCreatedBy_IsSubmittedTo(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Offer_ComesFrom_IsExtendedTo(
    id SERIAL PRIMARY KEY,
    deadline TIMESTAMP NOT NULL,
    offerName VARCHAR(80) NOT NULL,
    isAccepted BOOLEAN NOT NULL DEFAULT FALSE,
    hiringManagerEmail VARCHAR(80),
    contents VARCHAR(500),
    applicationId INTEGER NOT NULL,
    FOREIGN KEY (hiringManagerEmail) REFERENCES HiringManager(email)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (applicationId) REFERENCES Application_IsCreatedBy_IsSubmittedTo(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Interview_IsOfferedTo(
    id SERIAL PRIMARY KEY,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    location VARCHAR(80) NOT NULL,
    applicationId INTEGER NOT NULL,
    FOREIGN KEY (applicationId) REFERENCES Application_IsCreatedBy_IsSubmittedTo(id)
        ON DELETE CASCADE
);

-- ==================
-- Relationship sets:
-- ==================

CREATE TABLE IF NOT EXISTS Conducts(
    interviewerEmail VARCHAR(80) NOT NULL,
    interviewId INTEGER NOT NULL,
    interviewNotes VARCHAR(500) NOT NULL DEFAULT '',
    PRIMARY KEY (interviewerEmail, interviewId),
    FOREIGN KEY (interviewerEmail) REFERENCES Interviewer(email)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (interviewId) REFERENCES Interview_IsOfferedTo(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Describes(
    keywordWord VARCHAR(30) NOT NULL,
    jobPostingId INTEGER NOT NULL,
    PRIMARY KEY (keywordWord, jobPostingId),
    FOREIGN KEY (keywordWord) REFERENCES Keyword(word)
        ON DELETE CASCADE,
    FOREIGN KEY (jobPostingId) REFERENCES JobPosting(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Modifies(
    hiringManagerEmail VARCHAR(80) NOT NULL,
    jobPostingId INTEGER NOT NULL,
    PRIMARY KEY (hiringManagerEmail, jobPostingId),
    FOREIGN KEY (hiringManagerEmail) REFERENCES HiringManager(email)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (jobPostingId) REFERENCES JobPosting(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Rates(
    employeeEmail VARCHAR(80) NOT NULL,
    applicationId INTEGER NOT NULL,
    number INTEGER NOT NULL,
    PRIMARY KEY (employeeEmail, applicationId),
    FOREIGN KEY (employeeEmail) REFERENCES Employee(email)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (applicationId) REFERENCES Application_IsCreatedBy_IsSubmittedTo(id)
        ON DELETE CASCADE
);
