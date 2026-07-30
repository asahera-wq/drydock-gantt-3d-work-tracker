# Database

This folder contains all SQL scripts used to build and update the PostgreSQL database for the Drydock Gantt-to-3D Work Tracker.

## Migration Naming Convention

001_create_companies.sql

002_create_shipyards.sql

003_create_users.sql

004_create_projects.sql

...

Every change to the database must have its own numbered SQL file.

The same SQL should be executed in Supabase SQL Editor and stored here for version control.
