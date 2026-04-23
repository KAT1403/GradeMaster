# GradeMaster

> **Analytical platform for academic forecasting and strategic study planning.**

GradeMaster addresses the opacity of the **25/25/50 grading system** (Formative Assessments, Summative Assessments for the Unit, and Summative Assessment for the Term) by providing students with a data-driven roadmap. 

Unlike conventional grade calculators, GradeLogic utilizes predictive modeling to determine the precise requirements for target grades. The system operates on a **privacy-first principle**: all data is processed client-side without external server storage.

---

## Tech Stack

* **Core:** `React 18`, `TypeScript`
* **Styling:** `SCSS Modules`
* **Visualization:** `Recharts` (Monotone curves for trend analysis)
* **Infrastructure:** `Vercel` (Deployment & Analytics)
* **State Management:** `React Context API` & `LocalStorage Persistence`

---

## Key Features

* **High-Precision Forecasts:** Reverse-calculation of required scores for Summative Assessments based on current Formative data.
* **Trend Momentum Analysis:** Evaluation of academic trajectory using weighted moving averages to identify performance acceleration or deceleration.
* **Performance Gap Analysis:** Correlation check between daily classwork (FA) and exam results (SA) to identify preparation gaps or test-induced stress.
* **Risk Assessment:** Calculation of a "safety margin" to determine the allowable point loss without affecting the final grade.
* **Scenario Modeling:** Deterministic modeling of "best-case" and "worst-case" outcomes for the academic term.

---

## Installation

To clone and run the project locally, execute the following commands:

```bash
# Clone the repository
git clone https://github.com/KAT1403/GradeMaster.git

# Navigate to the project directory
cd gradelogic

# Install dependencies
npm install

# Launch the development server
npm run dev
```

### License
This project is licensed under the **MIT License**.
