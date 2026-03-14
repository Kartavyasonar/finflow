
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const authRouter      = require('./routes/auth');
const expensesRouter  = require('./routes/expenses');
const incomeRouter    = require('./routes/income');
const budgetsRouter   = require('./routes/budgets');
const dashboardRouter = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});



app.use('/api/auth',      authRouter);
app.use('/api/expenses',  expensesRouter);
app.use('/api/income',    incomeRouter);
app.use('/api/budgets',   budgetsRouter);
app.use('/api/dashboard', dashboardRouter);


app.get('/api/health', (_req, res) => {
  res.json({
    status: "ok",
    service: "FinFlow API",
    time: new Date().toISOString()
  });
});



const FRONTEND_BUILD = path.join(__dirname, "public");

app.use(express.static(FRONTEND_BUILD));

app.get("*", (_req, res) => {
  const indexPath = path.join(FRONTEND_BUILD, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: "FinFlow API running",
      health: "/api/health"
    });
  }
});


app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});



app.listen(PORT, () => {
  console.log(`\n🚀 FinFlow API running on port ${PORT}`);
  console.log(`📖 Health check: /api/health\n`);
});

module.exports = app;