## Apply to your dream job - a job-posting platform allowing hiring managers to create/modify postings

This is a term project (CPSC 304, Relational Databases with SQL) where we have two main types of users: applicants and employees. The employee is further split into
hiring managers and interviewers. Below are some functionalities implemented in our project:

Functionalities for all users:
- Look up users based on the value of a user-selected attribute.
- Create a new user by inputting personal data as well as selecting user type
Functionalities for applicants:
- Apply to jobs and attach an arbitrary number of textual “sections” in each application
- Ability to search for jobs by company name
- Automatically keeps track of application progress
- If an application is selected for an interview, the applicant can see the interview time and
location.
- Ability to accept job offers, possibly choosing from multiple offers.

Functionalities for employees:
- View all job postings belonging to their own company
- Rate applications submitted to any jobs belonging to their own company
- Special functionalities for hiring managers:
- Add/Modify/Delete job postings
- Extend a job offer to an applicant
- Assign a rating weight to all employees with the same job title
- See statistics for ratings given by employees in the company (e.g. the number of
ratings given per employee, the average rating per employee, the company-wide
average rating).
- View the most active hiring managers: the ones who have modified every job
posting belonging to the company.
- Specific functionalities for interviewers:
- Allows scheduling of interviews and recording interview notes
