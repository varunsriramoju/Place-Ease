-- Sample data with BCrypt hashed passwords
-- Password for all users: password123

INSERT INTO users (id, email, password, role, name, phone, branch, cgpa, resume_url, skills, is_active, created_at, updated_at) VALUES
(1, 'admin@placeease.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Admin User', '9999999999', NULL, NULL, NULL, NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'student@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'Rahul Verma', '9876543210', 'CS', 8.50, NULL, '["Java","React","DSA"]', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'recruiter@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER', 'Amit Kapoor', '9123456789', NULL, NULL, NULL, NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'priya.sharma@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'Priya Sharma', '9876543211', 'IT', 7.80, NULL, '["Python","Django","SQL"]', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'arjun.patel@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'Arjun Patel', '9876543212', 'ECE', 8.20, NULL, '["C++","Embedded Systems"]', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'neha.gupta@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'Neha Gupta', '9876543213', 'CS', 9.10, NULL, '["JavaScript","Node.js","MongoDB"]', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
