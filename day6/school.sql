
PRAGMA foreign_keys = ON;

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id)
        REFERENCES students(student_id),
    FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
);

CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);

INSERT INTO students (student_id, name, email) VALUES
(1, 'Amina Otieno', 'amina@example.com'),
(2, 'Brian Kamau', 'brian@example.com'),
(3, 'Carol Wanjiku', 'carol@example.com'),
(4, 'David Mwangi', 'david@example.com');

INSERT INTO courses (course_id, course_name) VALUES
(101, 'Computer Science'),
(102, 'Database Systems'),
(103, 'Web Development');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 101, 'A'),
(1, 102, 'B'),
(2, 101, 'B'),
(2, 103, 'A'),
(3, 102, 'A');

SELECT s.name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE s.name = 'Amina Otieno';

SELECT s.name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE c.course_name = 'Computer Science';

SELECT
    c.course_name,
    COUNT(e.student_id) AS number_of_students
FROM courses AS c
LEFT JOIN enrolments AS e
    ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_id;

SELECT s.student_id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e
    ON s.student_id = e.student_id
WHERE e.student_id IS NULL;

UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2
  AND course_id = 101;

