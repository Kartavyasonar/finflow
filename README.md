# FinFlow - Personal Finance Tracker

A web app to track expenses, income and budgets. Made this for my web development project. You can add your daily transactions, set budgets for different categories and see a breakdown of where your money is going.

Backend is Node.js with Express and frontend is React.js.

---

## Tech Stack

- React.js (frontend)
- Node.js + Express.js (backend)
- SQLite (database, schema written for MySQL)
- JWT for login sessions
- bcrypt for password hashing
- Chart.js for graphs

---

## How to Run

Need Node.js v18 or above.

**Start the backend:**
```bash
cd backend
npm install
node server.js
```
API runs at http://localhost:5000

**Start the frontend:**
```bash
cd frontend
npm install
npm start
```
App opens at http://localhost:3000

---

## What it does

- User registration and login with email and password
- Add expenses with category, date and description
- Track income with source type and frequency (monthly, weekly etc)
- Set monthly budget limits per category
- Progress bars showing how much of each budget is used
- Transaction history page with search and date filters
- Dashboard with spending pie chart and 6 month bar graph

---

## Project Structure

```
finflow/
  backend/
    server.js               main express server file
    db/
      database.js           database connection and table setup
    middleware/
      auth.js               checks jwt token on protected routes
    routes/
      auth.js               register and login endpoints
      expenses.js           add, edit, delete expenses
      income.js             add, edit, delete income
      budgets.js            set and delete budgets
      dashboard.js          stats and chart data

  frontend/
    src/
      App.jsx               root component, handles page switching
      index.jsx             react entry point
      styles.css            all the css
      context/
        AuthContext.jsx     global login state using context and useReducer
      utils/
        api.js              all fetch calls to the backend
      components/
        Sidebar.jsx         navigation sidebar
        UI.jsx              reusable components like Button Card Modal etc
      pages/
        AuthPage.jsx        login and register forms
        Dashboard.jsx       overview with stats and charts
        Expenses.jsx        expense tracking page
        Income.jsx          income tracking page
        Budget.jsx          budget setting and tracking
        History.jsx         full transaction history with filters
```

---


Made by Kartavya Sonar  
© 2026 All rights reserved
