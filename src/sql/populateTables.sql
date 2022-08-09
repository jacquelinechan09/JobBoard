INSERT INTO Applicant(email, password, name, location)
VALUES
    ('bob@gmail.com', 'password123', 'Bob Smith', 'Vancouver, BC'),
    ('test_applicant@gmail.com', 'test', 'Test Applicant', 'Canada'),
    ('ryan@yahoo.com', 'ryanyahoo', 'Ryan Lastname', 'United States'),
    ('justin1234@gmail.com', 'correct_horse_battery_staple', 'Justin K', 'Richmond, British Columbia, Canada'),
    ('john@student.ubc.ca', 'cpsc304', 'John Student', 'CPSC 304 Labs'),
    ('1@gmail.com', '123', 'Bob Smith', 'online');

INSERT INTO Company(name, aboutUs)
VALUES
    ('CRUD Incorporated', 'We make CRUD apps. Apply today!'),
    ('AI Company', 'We make self-driving cars.'),
    ('University of British Columbia', 'Description 3'),
    ('Your Local Startup', ''),
    ('Test Company', 'Testing.'),
    ('New Company', ''),
    ('A Company', '');

INSERT INTO RatingWeights(companyName, jobTitle, ratingWeight)
VALUES
    ('AI Company', 'Junior SWE', 1),
    ('AI Company', 'Manager', 1),
    ('AI Company', 'Senior SWE', 2.5),
    ('AI Company', 'Senior Manager', 4),
    ('CRUD Incorporated', 'Software Tester', 1),
    ('CRUD Incorporated', 'Software Developer', 1),
    ('CRUD Incorporated', 'Associate Manager', 3.2),
    ('CRUD Incorporated', 'Senior Manager', 5),
    ('University of British Columbia', 'Research Assistant', 0.5),
    ('University of British Columbia', 'Instructor', 1.5),
    ('University of British Columbia', 'Professor', 3),
    ('University of British Columbia', 'President', 100),
    ('Your Local Startup', 'CEO', 10),
    ('Your Local Startup', 'Intern', 0.5),
    ('Test Company', 'Test Job 1', 1),
    ('Test Company', 'Test Job 2', 2),
    ('New Company', 'Manager', 1),
    ('A Company', 'Manager', 1);

INSERT INTO Employee(email, password, name, phoneNum, companyName, jobTitle)
VALUES
    ('michael@ai.com', 'password', 'Michael', '604-583-6812', 'AI Company', 'Junior SWE'),
    ('emily@ai.com', 'password2', 'Emily Lee', '778-390-2045', 'AI Company', 'Senior Manager'),
    ('donald@ai.com', 'password3', 'Donald Tan', null, 'AI Company', 'Senior Manager'),
    ('tester@crud.org', 'qa_is_my_middle_name', 'John Doe', '+1 (604) 238 4829', 'CRUD Incorporated', 'Software Tester'),
    ('manager@crud.org', '123456', 'John Doe Manager', null, 'CRUD Incorporated', 'Senior Manager'),
    ('john@student.ubc.ca', 'a_different_password', 'John Student', '123-456-7890', 'University of British Columbia', 'Research Assistant'),
    ('cheeren@cs.ubc.ca', 'cpsc221_rocks', 'Cinda Heeren', '604-822-9880', 'University of British Columbia', 'Professor'),
    ('jzahl@math.ubc.ca', 'password', 'Joshua Zahl', null, 'University of British Columbia', 'Professor'),
    ('pres.admin@ubc.ca', 'test', 'Santa J. Ono', null, 'University of British Columbia', 'President'),
    ('ceo@startup.domain', 'ceo', 'Brandon T', '(098) 765-4321', 'Your Local Startup', 'CEO'),
    ('test_employee@test.com', 'test', 'Test Employee', null, 'Test Company', 'Test Job 1'),
    ('1@123.com', '123', 'Bob 2', '1112223333', 'New Company', 'Manager'),
    ('1@a.com', '123', 'John', '1112223333', 'A Company', 'Manager'),
    ('1@ai.com', '123', 'Bob', '1112223333', 'AI Company', 'Manager'),
    ('2@ai.com', '123', 'John', '1112223333', 'AI Company', 'Manager');

INSERT INTO HiringManager(email)
VALUES
    ('emily@ai.com'),
    ('donald@ai.com'),
    ('manager@crud.org'),
    ('pres.admin@ubc.ca'),
    ('ceo@startup.domain'),
    ('test_employee@test.com'),
    ('1@123.com'),
    ('1@a.com'),
    ('1@ai.com'),
    ('2@ai.com');

INSERT INTO Interviewer(email)
VALUES
    ('michael@ai.com'),
    ('emily@ai.com'),
    ('tester@crud.org'),
    ('manager@crud.org'),
    ('john@student.ubc.ca'),
    ('cheeren@cs.ubc.ca'),
    ('jzahl@math.ubc.ca'),
    ('ceo@startup.domain');

INSERT INTO JobPostingModifier(lastModifiedBy, companyName)
VALUES
    ('Emily Lee (emily@ai.com)', 'AI Company'),
    ('Donald Tan (donald@ai.com)', 'AI Company'),
    ('Bob (1@ai.com)', 'AI Company'),
    ('John (2@ai.com)', 'AI Company'),
    ('John (1@a.com)', 'A Company'),
    ('John Doe Manager (manager@crud.org)', 'CRUD Incorporated'),
    ('Santa J. Ono (pres.admin@ubc.ca)', 'University of British Columbia'),
    ('Brandon T (ceo@startup.domain)', 'Your Local Startup'),
    ('Test Employee (test_employee@test.com)', 'Test Company');

-- Casting strings to timestamps: https://stackoverflow.com/a/18919571
INSERT INTO JobPosting(deadline, description, location, jobTitle, lastModifiedBy, lastModifiedTime)
VALUES
    ('2022-09-01 23:59:59'::TIMESTAMP, 'Job description 100', 'no longer remote', 'Senior SWE', 'Bob (1@ai.com)', '2022-07-23 11:42:10'::TIMESTAMP),
    ('2022-08-13 23:59:59'::TIMESTAMP, 'Job description 2', 'Seattle, WA', 'Software Tester', 'John Doe Manager (manager@crud.org)', '2022-07-01 00:00:00'::TIMESTAMP),
    ('2022-08-13 23:59:59'::TIMESTAMP, 'Job description 3', 'Vancouver, BC', 'Vice President', 'Santa J. Ono (pres.admin@ubc.ca)', '2022-07-01 12:00:30'::TIMESTAMP),
    ('2022-08-15 23:59:59'::TIMESTAMP, 'Job description 4', 'Vancouver, BC', 'Senior Professor', 'Santa J. Ono (pres.admin@ubc.ca)', '2022-07-01 12:10:20'::TIMESTAMP),
    ('2022-09-01 23:59:59'::TIMESTAMP, 'Job description 5', 'Richmond, BC', 'Intern', 'Brandon T (ceo@startup.domain)', '2022-07-15 15:48:59'::TIMESTAMP),
    ('2022-10-15 23:59:59'::TIMESTAMP, '', 'A city somewhere', 'Test Job 2', 'Test Employee (test_employee@test.com)', '2022-07-15 12:00:58'::TIMESTAMP),
    ('2022-10-13 23:59:59'::TIMESTAMP, 'a new job added for a new company', 'online', 'new job for a', 'John (1@a.com)', '2022-08-02 07:32:23'::TIMESTAMP),
    ('2022-12-12 23:59:59'::TIMESTAMP, '123 123 123 123', 'online', 'SWE', 'Bob (1@ai.com)', '2022-08-02 08:12:03'::TIMESTAMP),
    ('2022-10-10 23:59:59'::TIMESTAMP, 'description description', 'in person', 'Janitor', 'Bob (1@ai.com)', '2022-08-05 11:58:44'::TIMESTAMP),
    ('2022-09-09 23:59:59'::TIMESTAMP, 'describing this job', 'online', 'Another Job', 'Bob (1@ai.com)', '2022-08-02 09:13:57'::TIMESTAMP),
    ('2023-12-12 23:59:59'::TIMESTAMP, '123456', 'online', 'Testing Job for Interview', 'Bob (1@ai.com)', '2022-08-04 02:45:47'::TIMESTAMP),
    ('2022-08-24 23:59:59'::TIMESTAMP, '123', 'online', 'job 7', 'Bob (1@ai.com)', '2022-08-07 14:59:16'::TIMESTAMP),
    ('2022-08-24 23:59:59'::TIMESTAMP, '123', 'online', 'job 8', 'Bob (1@ai.com)', '2022-08-07 14:59:41'::TIMESTAMP),
    ('2022-08-24 23:59:59'::TIMESTAMP, '123', 'online', 'job 9', 'Bob (1@ai.com)', '2022-08-07 15:00:29'::TIMESTAMP);

INSERT INTO Keyword(word)
VALUES
    ('swe'),
    ('qa'),
    ('administration'),
    ('management'),
    ('internship'),
    ('research'),
    ('teaching'),
    ('senior'),
    ('old'),
    ('important'),
    ('software'),
    ('new word'),
    ('another'),
    ('new'),
    ('interesting');

INSERT INTO Application_IsCreatedBy_IsSubmittedTo(submissionTime, status, applicantEmail, jobPostingId)
VALUES
    ('2022-07-01 14:52:30'::TIMESTAMP, 'Submitted', 'bob@gmail.com', 1),
    ('2022-07-01 14:55:18'::TIMESTAMP, 'Submitted', 'bob@gmail.com', 4),
    ('2022-07-01 15:02:10'::TIMESTAMP, 'Selected for Interview', 'test_applicant@gmail.com', 2),
    ('2022-07-02 00:30:59'::TIMESTAMP, 'Offer Extended', 'john@student.ubc.ca', 1),
    ('2022-07-03 12:10:28'::TIMESTAMP, 'Offer Accepted', 'ryan@yahoo.com', 6),
    ('2022-07-03 12:11:40'::TIMESTAMP, 'Offer Extended', 'john@student.ubc.ca', 5),
    ('2022-07-05 08:40:30'::TIMESTAMP, 'Offer Extended', 'test_applicant@gmail.com', 3),
    ('2022-07-10 10:20:01'::TIMESTAMP, 'Offer Accepted', 'test_applicant@gmail.com', 4),
    ('2022-08-05 15:31:07'::TIMESTAMP, 'Submitted', '1@gmail.com', 1),
    ('2022-08-05 15:33:10'::TIMESTAMP, 'Submitted', '1@gmail.com', 9),
    ('2022-08-05 15:33:57'::TIMESTAMP, 'Submitted', '1@gmail.com', 10),
    ('2022-08-05 15:34:31'::TIMESTAMP, 'Submitted', '1@gmail.com', 11),
    ('2022-08-07 05:00:01'::TIMESTAMP, 'Submitted', 'test_applicant@gmail.com', 9);

INSERT INTO Section(title, applicationId, content)
VALUES
    ('Resume', 1, 'Bob''s impressive resume'), -- Escape apostrophes by putting two of them together (https://stackoverflow.com/a/12320729)
    ('Cover Letter', 1, 'Blah blah cover letter'),
    ('Resume', 2, 'Bob''s bad resume'),
    ('Resume (Test)', 3, 'This resume belongs to test_applicant@gmail.com'),
    ('Cover Letter', 3, 'Test cover letter'),
    ('References', 3, 'Lagrange, Newton, Fermat'),
    ('Resume', 4, 'John Student''s resume'),
    ('CV', 5, 'Blah blah blah'),
    ('Resume', 6, 'John Student''s resume'),
    ('Resume', 7, 'Test resume'),
    ('Resume', 8, 'Test resume'),
    ('Resume', 9, 'blah blah'),
    ('Resume', 10, 'blah blah'),
    ('Resume', 11, 'blah blah'),
    ('Resume', 12, 'blah blah'),
    ('Resume', 13, 'abcdefg!');

INSERT INTO Offer_ComesFrom_IsExtendedTo(deadline, offerName, isAccepted, hiringManagerEmail, contents, applicationId)
VALUES
    ('2022-07-15 23:59:59'::TIMESTAMP, 'UBC_Vice_President_Offer', FALSE, 'pres.admin@ubc.ca', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 7),
    ('2022-07-15 23:59:59'::TIMESTAMP, 'UBC_Senior_Professor_Offer', TRUE, 'pres.admin@ubc.ca', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 8),
    ('2022-07-15 23:59:59'::TIMESTAMP, 'AI_Company_Senior_SWE_Offer1', FALSE, 'emily@ai.com', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 4),
    ('2022-09-01 23:59:59'::TIMESTAMP, 'AI_Company_Senior_SWE_Offer2', FALSE, 'donald@ai.com', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 4),
    ('2022-09-01 23:59:59'::TIMESTAMP, 'Test_Job_2_Offer_Letter', TRUE, 'test_employee@test.com', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 5),
    ('2022-08-28 23:59:59'::TIMESTAMP, 'Startup_Internship_Offer', FALSE, 'ceo@startup.domain', 'Offer contents Offer contents Offer contents Offer contents Offer contents Offer contents', 6);

INSERT INTO Interview_IsOfferedTo(startTime, endTime, location, applicationId)
VALUES
    ('2022-07-03 14:00'::TIMESTAMP, '2022-07-03 14:30'::TIMESTAMP, 'Meeting Room 2', 3),
    ('2022-07-10 14:00'::TIMESTAMP, '2022-07-10 15:00'::TIMESTAMP, 'Remote (insert Zoom link here)', 4),
    ('2022-07-10 10:00'::TIMESTAMP, '2022-07-10 10:30'::TIMESTAMP, '1234 Street Road, Richmond, BC', 6),
    ('2022-07-11 11:00'::TIMESTAMP, '2022-07-11 12:00'::TIMESTAMP, 'ICCS Project Room 1', 7),
    ('2022-07-11 13:00'::TIMESTAMP, '2022-07-11 14:00'::TIMESTAMP, 'ICCS Project Room 1', 7),
    ('2022-07-12 13:00'::TIMESTAMP, '2022-07-12 14:30'::TIMESTAMP, 'ICCS 233', 8);

INSERT INTO Conducts(interviewerEmail, interviewId, interviewNotes)
VALUES
    ('manager@crud.org', 1, ''),
    ('michael@ai.com', 2, 'Excellent'),
    ('emily@ai.com', 2, 'A little difficulty with technical explanations, but fixable'),
    ('ceo@startup.domain', 3, 'Hire this guy immediately'),
    ('john@student.ubc.ca', 4, 'Great vision'),
    ('jzahl@math.ubc.ca', 4, ''),
    ('jzahl@math.ubc.ca', 5, 'Candidate seems to be a genius'),
    ('cheeren@cs.ubc.ca', 6, 'Teaching philosophy remarkable. Impressive contributions to planar graph theory.');

INSERT INTO Describes(keywordWord, jobPostingId)
VALUES
    ('swe', 1),
    ('senior', 1),
    ('old', 1),
    ('important', 1),
    ('software', 1),
    ('new word', 1),
    ('qa', 2),
    ('administration', 3),
    ('management', 3),
    ('research', 4),
    ('teaching', 4),
    ('senior', 8),
    ('new', 8),
    ('another', 8),
    ('new', 10),
    ('interesting', 10);

INSERT INTO Modifies(hiringManagerEmail, jobPostingId)
VALUES
    ('donald@ai.com', 1),
    ('emily@ai.com', 1),
    ('emily@ai.com', 8),
    ('emily@ai.com', 9),
    ('emily@ai.com', 10),
    ('emily@ai.com', 11),
    ('emily@ai.com', 12),
    ('emily@ai.com', 13),
    ('emily@ai.com', 14),
    ('1@ai.com', 1),
    ('1@ai.com', 8),
    ('1@ai.com', 9),
    ('1@ai.com', 10),
    ('1@ai.com', 11),
    ('1@ai.com', 12),
    ('1@ai.com', 13),
    ('1@ai.com', 14),
    ('2@ai.com', 1),
    ('2@ai.com', 8),
    ('2@ai.com', 9),
    ('2@ai.com', 10),
    ('2@ai.com', 11),
    ('2@ai.com', 12),
    ('2@ai.com', 13),
    ('manager@crud.org', 2),
    ('pres.admin@ubc.ca', 3),
    ('pres.admin@ubc.ca', 4),
    ('ceo@startup.domain', 5),
    ('test_employee@test.com', 6),
    ('1@a.com', 7);

INSERT INTO Rates(employeeEmail, applicationId, number)
VALUES
    ('michael@ai.com', 1, 3),
    ('donald@ai.com', 1, 1),
    ('pres.admin@ubc.ca', 2, 1),
    ('tester@crud.org', 3, 5),
    ('michael@ai.com', 4, 5),
    ('emily@ai.com', 4, 4),
    ('1@ai.com', 4, 5),
    ('emily@ai.com', 10, 3),
    ('emily@ai.com', 13, 3),
    ('1@ai.com', 11, 4);
