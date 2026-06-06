# Result Analysis System

An automated web application designed to process, analyze, and visualize academic performance data. This system helps educational institutions, faculty, and students transform raw exam scores into meaningful graphical insights, performance trends, and statistical breakdowns.

---

##  Features

*   **Data Ingestion:** Easily upload or input student marks and academic records.
*   **Performance Analytics:** Automatically calculate pass percentages, averages, top performers, and subject-wise metrics.
*   **Visual Dashboards:** Interactive charts and graphs to easily spot performance trends and failing percentages.
*   **Report Generation:** Clean layout optimized for reviewing or exporting consolidated academic results.

---

##  Tech Stack

*   **Frontend:** HTML5, CSS3, Tailwind CSS (for modern, responsive styling)
*   **Logic & Interactivity:** JavaScript (ES6+) / React ecosystem
*   **Build Tools:** Vite (for fast local development and optimized production builds)

---

##  Project Directory Structure

```text
result-analysis-system
│
├── .firebase
│   └── hosting.ZGlzdA.cache
│
├── .firebaserc
├── .gitignore
├── README.md
├── eslint.config.js
├── firebase.json
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
│
├── public
│   ├── favicon.svg
│   └── icons.svg
│
└── src
    │
    ├── App.css
    ├── App.jsx
    ├── firebase.js
    ├── index.css
    ├── main.jsx
    │
    ├── assets
    │   ├── favicon.png
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── components
    │   │
    │   ├── auth
    │   │   └── LoginScreen.jsx
    │   │
    │   ├── common
    │   │   ├── AlertMessage.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   │
    │   ├── student
    │   │   ├── StudentCalculator.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── StudentPredictor.jsx
    │   │   └── StudentProfile.jsx
    │   │
    │   └── teacher
    │       ├── TeacherDashboard.jsx
    │       ├── TeacherDataManagement.jsx
    │       └── TeacherStudentScorecard.jsx
    │
    ├── data
    │   ├── students.js
    │   └── utils.js
    │
    └── pages
        ├── StudentPage.jsx
        └── TeacherPage.jsx