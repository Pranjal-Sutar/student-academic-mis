# Student Academic Workload and Performance Planning MIS

A web-based Management Information System (MIS) prototype for college students to manage academic workload and monitor performance.

---

## 📋 Project Overview

This application demonstrates how an MIS **collects, organises, analyses, and presents** academic data to support better planning and decision-making. It is a college MIS activity prototype — simple, functional, and easy to explain.

### What This System Does (MIS Perspective)

| MIS Function | Implementation |
|---|---|
| **Data Collection** | Students input assignments, marks, and exam dates |
| **Data Storage** | LocalStorage persists all data between sessions |
| **Data Processing** | Average calculation, status checking, overdue detection |
| **Information Generation** | Dashboard KPIs, subject averages, completion rates |
| **Decision Support** | Rule-based recommendations for priority planning |

---

## 🚀 Key Features

### A. Dashboard
- Total/pending/overdue assignment counts
- Upcoming exam count
- Overall academic average
- Subject-wise bar chart (colour-coded: green ≥75%, amber 60–74%, red <60%)
- Upcoming deadlines and exam schedule
- Recommendation panel

### B. Assignments & Exams
- View and filter assignments by subject and status
- Add new assignments with title, subject, due date, description
- Mark assignments as completed
- View all scheduled examinations with dates, times, and venues
- Visual overdue/due-soon indicators

### C. Academic Performance
- Subject average cards with attention flags
- Bar chart + radar chart for performance visualisation
- Add marks records (assessment name, marks obtained, max marks)
- Detailed marks table with mini progress bars

### D. Workload Recommendations (Rule-based)
| Rule | Trigger |
|---|---|
| Overdue (🔴) | Assignment past due date and still pending |
| Due soon (🟡) | Assignment due within 3 days |
| Low marks (🟠) | Subject average < 60% |
| All good (🟢) | None of the above apply |

### E. Reports
- Assignment completion percentage with progress bar
- Pending and overdue assignment lists
- Subject-wise marks table with averages
- Subjects requiring attention section
- All values computed dynamically from current data

---

## 🛠 Technology Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | Frontend framework and build tool |
| Tailwind CSS v3 | Utility-first styling |
| Recharts | Bar chart, Radar chart |
| Lucide React | Icon set |
| date-fns | Date formatting |
| LocalStorage | Client-side data persistence |

No backend. No database server. No authentication. No external APIs.

---

## 📁 Project Structure

```
student-academic-mis/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   └── sampleData.js        # Sample assignments, exams, marks
│   ├── hooks/
│   │   └── useLocalStorage.js   # Persistence hook
│   ├── utils/
│   │   └── computeStats.js      # All analytics and rules logic
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatusBadge.jsx
│   │   └── RecommendationCard.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── AssignmentsPage.jsx
│   │   ├── PerformancePage.jsx
│   │   └── ReportsPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 📊 Sample Data

The application ships with pre-loaded sample data for **5 subjects**:

| Subject | Sample Average |
|---|---|
| Python Programming | ~74% |
| Data Structures | ~60% ⚠️ borderline |
| Operating Systems | ~53% 🔴 needs attention |
| Linear Algebra | ~50% 🔴 needs attention |
| MIS | ~81% |

**10 assignments** with a mix of pending, completed, and overdue statuses.
**5 examinations** with dates, times, venues, and syllabus.
**20 marks records** across 4–5 assessments per subject.

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Node.js 18+ and npm

### Steps

```bash
# Clone / open the project folder
cd student-academic-mis

# Install dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Reset Sample Data
Click **"Reset Sample Data"** at the bottom of the sidebar to restore all original sample data.

---

## 🏗 Build for Production

```bash
npm run build
```

Output is in the `dist/` folder — ready for static hosting.

---

## 🚀 Deploying to Vercel

### Option 1 – Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2 – Vercel Dashboard (Recommended)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**
3. Import the GitHub repository
4. Vercel auto-detects Vite — leave defaults as-is
5. Click **Deploy**

**No environment variables are required** — this is a fully client-side application.

---

## 🧠 How to Explain This as an MIS (for teachers)

1. **Data collected**: Student enters assignment titles, due dates, subjects, and marks
2. **Data stored**: All data is saved in browser LocalStorage (simulating a database)
3. **Data processed**: The app computes averages, checks deadlines, identifies overdue tasks
4. **Information generated**: Dashboard shows KPIs, charts, completion rates, and performance summaries
5. **Decision support**: Recommendations guide the student on what to prioritise (rule-based, no AI)

This qualifies as an MIS because it **transforms raw academic data into actionable information** that supports student decision-making.

---

## 📝 Marks Threshold

The attention threshold is defined as a constant in `src/data/sampleData.js`:

```js
export const LOW_MARKS_THRESHOLD = 60; // percentage
```

Change this value to adjust when subjects are flagged as needing attention.

---

*Built as a college MIS activity prototype — React + Vite + Tailwind + Recharts + LocalStorage*
