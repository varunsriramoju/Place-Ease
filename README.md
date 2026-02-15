# PlaceEase - College Placement Management System

A full-stack web application that automates student-job matching based on CGPA and branch eligibility with three user roles: Student, Recruiter, and Admin.

## 🚀 Tech Stack

### Backend
- Java 17 + Spring Boot 3.2.0
- H2 Database (file-based)
- Spring Security + JWT Authentication
- Maven

### Frontend
- React 18.2 + Vite 5.0
- TailwindCSS 3.3
- Axios for API calls
- React Router DOM 6.20

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 16+ and npm
- Any modern web browser

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔑 Test Credentials

### Student Account
- Email: `student@college.edu`
- Password: `password123`
- Branch: CS, CGPA: 8.50

### Recruiter Account
- Email: `recruiter@techcorp.com`
- Password: `password123`

### Admin Account
- Email: `admin@placeease.com`
- Password: `password123`

## 📊 Database Access

H2 Console is available at: `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:file:./data/placeease`
- Username: `sa`
- Password: (leave blank)

## 🎯 Key Features

### Student Features
- View eligible jobs based on CGPA and branch
- Apply for jobs with one click
- Track application status
- See job details including CTC, deadline, and requirements

### Recruiter Features
- Post new job openings
- View posted jobs with approval status
- Manage applications (shortlist, reject, offer)
- Update application status

### Admin Features
- Approve or reject job postings
- View eligible student count by branch for each job
- Dashboard with system statistics
- Monitor total students, recruiters, and jobs

## 🔐 Security Features

- JWT-based authentication (7-day expiry)
- BCrypt password hashing (strength 10)
- Role-based access control (RBAC)
- CORS configuration for frontend
- Protected API endpoints

## 🎨 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Student
- `GET /api/student/jobs` - Get eligible jobs (filtered)
- `POST /api/student/apply/{jobId}` - Apply for a job
- `GET /api/student/applications` - Get my applications

### Recruiter
- `POST /api/recruiter/jobs` - Post new job
- `GET /api/recruiter/jobs` - Get my posted jobs
- `GET /api/recruiter/jobs/{jobId}/applications` - Get job applications
- `PUT /api/recruiter/applications/{id}/status` - Update application status

### Admin
- `GET /api/admin/jobs/pending` - Get pending jobs with eligibility count
- `PUT /api/admin/jobs/{jobId}/approve` - Approve/reject job
- `GET /api/admin/dashboard` - Get system statistics

## 📝 Swagger Documentation

API documentation is available at: `http://localhost:8080/swagger-ui.html`

## ✅ Testing Workflow

1. **Register a Student**
   - Email: `test.student@college.edu`
   - Role: STUDENT
   - Branch: CS
   - CGPA: 8.5

2. **Login as Recruiter**
   - Post a job with required CGPA: 7.5, allowed branches: ["CS", "IT"]

3. **Login as Admin**
   - Approve the job
   - See eligibility count by branch

4. **Login as Student**
   - See the job in the feed (because CGPA 8.5 >= 7.5 and branch = CS)
   - Apply to the job

5. **Try Applying Again**
   - Should fail with "Already applied" error

6. **Login as Recruiter**
   - View applications
   - Update status to "SHORTLISTED"

7. **Login as Student**
   - See updated status in application tracker

## 🏗️ Project Structure

```
placmement-mg-sys/
├── backend/
│   ├── src/main/java/com/placeease/
│   │   ├── config/          # Security, CORS, Swagger config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT utilities
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql         # Sample data
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── App.jsx          # Main app with routing
│   │   └── main.jsx         # Entry point
│   └── public/
└── README.md
```

## 🎓 Core Business Logic

### Eligibility Filtering (Critical Feature)

Students see ONLY jobs where:
1. `job.status = 'APPROVED'`
2. `job.deadline >= TODAY`
3. `student.cgpa >= job.required_cgpa`
4. `student.branch IN job.allowed_branches`

This is implemented in `EligibilityService.java`:
```java
public List<Job> getEligibleJobs(User student) {
    return jobRepository.findAll().stream()
        .filter(job -> "APPROVED".equals(job.getStatus()))
        .filter(job -> job.getDeadline().isAfter(LocalDate.now()))
        .filter(job -> student.getCgpa().compareTo(job.getRequiredCgpa()) >= 0)
        .filter(job -> isEligibleByBranch(student.getBranch(), job.getAllowedBranches()))
        .collect(Collectors.toList());
}
```

### Admin Eligibility Counter

Before approving a job, admin sees how many students are eligible:
```json
{
  "total": 217,
  "breakdown": {
    "CS": 89,
    "IT": 67,
    "ECE": 61
  }
}
```

## 🐛 Troubleshooting

### Backend Issues
- **Port 8080 already in use**: Change port in `application.properties`
- **Database locked**: Close H2 console before restarting
- **JWT errors**: Check secret key in `application.properties`

### Frontend Issues
- **CORS errors**: Ensure backend is running on port 8080
- **401 Unauthorized**: Token expired, login again
- **Blank page**: Check browser console for errors

## 📄 License

This project is created for educational purposes.

## 👥 Support

For issues or questions, please check:
- Backend logs in terminal
- Frontend console in browser DevTools
- H2 database console for data verification
