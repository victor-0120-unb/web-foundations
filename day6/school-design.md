
# School Database Design

## 1. Tables

### Students
The `students` table stores information about each student. It contains
`student_id` as the primary key, `name`, and `email`. The email is unique
and cannot be NULL so that each student has a distinct email address.

### Courses
The `courses` table stores the courses offered by the school. It contains
`course_id` as the primary key and `course_name`, which is required and
unique.

### Enrolments
The `enrolments` table records which student takes which course and the
student's grade for that course. It contains `student_id` and `course_id`
as foreign keys referencing the other two tables. The grade is stored
here because it belongs to a student's enrolment in a particular course.
The combination of `student_id` and `course_id` forms a composite primary
key, preventing duplicate enrolments for the same student and course.

## 2. Relationships

Students and enrolments have a one-to-many relationship because one
student can have several enrolment records, while each enrolment belongs
to one student.

Courses and enrolments also have a one-to-many relationship because one
course can have many enrolment records, while each enrolment refers to
one course.

Students and courses therefore have a many-to-many relationship: a
student can take several courses, and each course can have several
students. The `enrolments` table is necessary as a join table to connect
these two entities and store additional information, such as the grade,
for each student-course combination.

## 3. Index

I added an index named `idx_enrolments_course_id` on the `course_id`
column in the `enrolments` table. It can speed up queries that find
students on a particular course and count enrolments per course. It is
also useful because the composite primary key starts with `student_id`,
so it does not provide the same index for searches by `course_id` alone.

## 4. SQL or NoSQL?

I would choose a relational SQL database such as SQLite for this school
system. Students, courses, and enrolments have clear relationships and
well-defined fields. SQL supports primary keys, foreign keys, unique
constraints, joins, grouping, and transactions, which help maintain
accurate enrolment records and grades. A NoSQL database can be useful
for flexible or rapidly changing data structures, but its flexibility
is not necessary for this system's structured, relational data.