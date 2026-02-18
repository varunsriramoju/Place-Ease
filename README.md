# 🎓 PlaceEase - Smart Placement Management System

**The Future of Campus Recruitment.** PlaceEase is a powerful, AI-assisted platform that bridges the gap between students, recruiters, and placement admins.

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

---

## 🚀 Overview

Campus placements are chaotic. **PlaceEase** brings order to the chaos with a unified system for tracking the entire recruitment lifecycle. From posting a job to the final offer letter, everything happens here.

But it's not just a database. PlaceEase includes **advanced intelligence**:
- 🧠 It **recommends** jobs to students based on their profile.
- 📉 It analyzes **skill gaps** to show students what they're missing.
- 💬 It includes a **chatbot** for instant support.
- 🔔 Real-time **notifications** ensure no deadline is missed.
- 📊 **Analytics** help admins optimize placement strategies.

---

## ✨ Key Features

### 👨‍🎓 For Students
*   **Smart Job Recommendations:** Our algorithm scores jobs (Skills 50%, CGPA 30%, Branch 20%) to show your best matches first.
*   **Skill Gap Analysis:** See exactly which high-demand skills you lack based on thousands of job postings.
*   **One-Click Apply:** Upload your resume once and apply instantly.
*   **Chat Assistant:** Need help? Ask the PlaceEase Bot about eligibility, resume tips, or process details.
*   **Real-time Alerts:** Get notified the second your application status changes (Shortlisted/Rejected/Offered).

### 🏢 For Recruiters
*   **Job Management:** Post openings with detailed criteria (Branch, CGPA, CTC).
*   **Candidate Tracking:** View applicants, download resumes, and update statuses in bulk.
*   **Talent Search:** Filter the student database to find specific profiles.

### 👨‍💼 For Admins
*   **Analytics Dashboard:** Visual insights into placement trends, top recruiters, and CTC distributions.
*   **Job Approval Workflow:** Review and approve postings to ensure quality.
*   **Student Support:** Chat directly with students to resolve complex queries.

---

## 🛠️ Technology Stack

We built PlaceEase using industry-standard enterprise technologies for reliability and scale.

### Backpack (Robust & Secure)
| Tech | Role | Why? |
| :--- | :--- | :--- |
| **Java 17** | Core | Modern features (Records), LTS stability. |
| **Spring Boot 3.2** | Framework | Production-ready, auto-configuration. |
| **Spring Security + JWT** | Auth | Stateless, secure authentication. |
| **Spring Data JPA** | DAO | Simplified database interactions. |
| **H2 Database** | Storage | Fast in-memory DB for dev/test. |
| **WebSocket (STOMP)** | Real-time | Instant notifications and chat. |

### Frontend (Fast & Responsive)
| Tech | Role | Why? |
| :--- | :--- | :--- |
| **React (Vite)** | UI | Component-based, lightning-fast builds. |
| **Tailwind CSS** | Styling | Rapid, utility-first design directly in markup. |
| **Axios** | API Client | Clean promise-based HTTP requests. |
| **Recharts** | Charts | Beautiful data visualization for analytics. |

---

## ⚙️ Getting Started

Follow these steps to run PlaceEase locally.

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **Maven** (optional, wrapper included)

### 1️⃣ Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Run the application using the Maven wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    *Note: The server will start on `http://localhost:8080`.*

### 2️⃣ Frontend Setup
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Note: The UI will be available at `http://localhost:5173`.*

---

## 📚 API Documentation

We use **Swagger UI** for interactive API documentation. Once the backend is running, visit:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

You can test all endpoints (Auth, Students, Jobs, Analytics) directly from the browser.

---

## 👥 Contributors

Built with ❤️ by **Varun Sriramoju**.

For questions or support, please open an issue or contact the maintainers.

---
*© 2026 PlaceEase System. All rights reserved.*
