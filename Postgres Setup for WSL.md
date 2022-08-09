Sources: https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database and https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

Note that these steps have only been tested on WSL.

Install PostgreSQL with:

```
sudo apt install postgresql postgresql-contrib
```

Start PostgreSQL and log in to the server with:

```
sudo service postgresql start
sudo -u postgres psql
```

Then type these SQL commands:

```
CREATE USER cpsc304_project_admin WITH PASSWORD 'password';
CREATE DATABASE cpsc304_project OWNER cpsc304_project_admin;
```

Make a user with the same name as the database user, so that you can connect to the database through the command line:

```
sudo adduser cpsc304_project_admin
```

Use "password" as the password, and choose default options for everything else. You are done!

If you want to connect to the database, type:

```
sudo -u cpsc304_project_admin psql -d cpsc304_project
```

Type `\q` to disconnect.
