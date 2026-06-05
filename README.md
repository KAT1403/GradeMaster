# GradeMaster

> **Privacy-first academic calculator, predictor, and analytics dashboard for the 25/25/50 grading system.**

GradeMaster helps students understand their current academic standing and plan what they need to score next. It supports the common **25/25/50** model: Formative Assessments, Summative Assessments for the Unit, and Summative Assessment for the Quarter.

The project is designed as a client-side tool: calculations, saved subjects, and history stay in the browser through local storage. No academic data is sent to an external server.

---

## Features

- **Grade calculator:** calculates the current percentage, grade, and GPA-style equivalent from FA, SA/SOR, and SOCH scores.
- **Target predictor:** estimates what score is needed to reach a target grade and shows whether the target is still mathematically possible.
- **Scenario analysis:** models SOCH requirements, additional FA grades, safety thresholds, and margin-of-error cases.
- **Analytics dashboard:** visualizes FA trends, stability, volatility, and comparison between daily work and summative results.
- **Smart paste:** parses copied grade text and fills the calculator faster.
- **History:** saves multiple subject calculations locally, with pinning and automatic cleanup for old entries.
- **Localization:** available in Russian, Kazakh, and English.
- **Light and dark themes:** user preference is persisted locally.

---

## Tech Stack

- **Core:** `React 19`, `TypeScript`, `Vite`
- **State Management:** `Zustand` with localStorage persistence
- **Routing:** `react-router-dom`
- **Styling:** `SCSS Modules`
- **Charts:** `Recharts`
- **Internationalization:** `i18next`, `react-i18next`
- **Icons:** `lucide-react`
- **Deployment/Insights:** `Vercel Analytics`, `Vercel Speed Insights`

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/KAT1403/GradeMaster.git

# Navigate to the project directory
cd GradeMaster

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build the production bundle
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

---

## Privacy

GradeMaster does not require an account and does not store academic records on a backend. Saved calculations are kept in the user's browser storage. Vercel analytics may collect aggregate product usage metrics, but grade data is processed client-side.

---

## License

This project is licensed under the **MIT License**.
