/**
 * src/pages/Dashboard.jsx
 * Overview: stats, category doughnut chart, monthly trend bar chart, recent transactions, budget progress.
 */

import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';
import { dashboardAPI, budgetsAPI } from '../utils/api';
import { StatCard, Card, TxItem, ProgressBar, EmptyState, Loader } from '../components/UI';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CHART_COLORS = ['#7c6af7','#4fd1c5','#f6ad55','#fc8181','#68d391','#a78bfa','#34d399','#f472b6','#60a5fa','#fb923c','#e879f9','#2dd4bf','#facc15'];

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, budgetData] = await Promise.all([
          dashboardAPI.stats(),
          budgetsAPI.list(),
        ]);
        setData(statsData);
        setBudgets(budgetData.budgets);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  const { stats, categoryBreakdown = [], recentTransactions = [], monthlyTrend = [] } = data || {};

  // Doughnut chart data
  const doughnutData = {
    labels: categoryBreakdown.map(c => c.category),
    datasets: [{
      data: categoryBreakdown.map(c => c.total),
      backgroundColor: CHART_COLORS,
      borderWidth: 2,
      borderColor: '#13161e',
    }],
  };

  // Bar chart data
  const barData = {
    labels: monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map(m => m.income),
        backgroundColor: 'rgba(104,211,145,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map(m => m.expenses),
        backgroundColor: 'rgba(252,129,129,0.7)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8892a4', font: { family: 'DM Sans' }, boxWidth: 12 } },
    },
    scales: {
      x: { ticks: { color: '#8892a4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#8892a4', callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  // simple greeting based on time
const hr = new Date().getHours();
const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div>
      <div className="page-header">
        <h1>{greeting}, {user?.name?.split(' ')[0]} ✨</h1>
        <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Income"    value={fmt(stats?.total_income || 0)}    icon="📈" variant="income"  sub={`This month: ${fmt(stats?.month_income || 0)}`} />
        <StatCard label="Total Expenses"  value={fmt(stats?.total_expenses || 0)}  icon="📉" variant="expense" sub={`This month: ${fmt(stats?.month_expenses || 0)}`} />
        <StatCard label="Net Balance"     value={fmt(stats?.balance || 0)}         icon="⚖️" variant="balance" />
        <StatCard label="Savings Rate"    value={`${stats?.savings_rate || 0}%`}   icon="🏦" variant="savings" />
      </div>

      {/* Charts */}
      <div className="two-col">
        <Card title="Spending by Category">
          {categoryBreakdown.length === 0
            ? <EmptyState icon="📊" message="No expense data yet" />
            : <div style={{ height: 220 }}><Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined, plugins: { legend: { position: 'right', labels: { color: '#8892a4', font: { family: 'DM Sans' }, boxWidth: 12 } } }, cutout: '65%' }} /></div>
          }
        </Card>

        <Card title="6-Month Trend">
          {monthlyTrend.every(m => m.income === 0 && m.expenses === 0)
            ? <EmptyState icon="📈" message="No trend data yet" />
            : <div style={{ height: 220 }}><Bar data={barData} options={chartOptions} /></div>
          }
        </Card>
      </div>

      {/* Recent + Budgets */}
      <div className="two-col">
        <Card title="Recent Transactions" action={
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('history')}>View all</button>
        }>
          {recentTransactions.length === 0
            ? <EmptyState icon="💤" message="No transactions yet" />
            : recentTransactions.map(t => (
                <TxItem key={`${t.type}-${t.id}`} type={t.type} label={t.label} description={t.description} date={t.date} amount={t.amount} />
              ))
          }
        </Card>

        <Card title="Budget Overview" action={
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('budget')}>Manage</button>
        }>
          {budgets.length === 0
            ? <EmptyState icon="🎯" message="No budgets set yet" />
            : budgets.map(b => (
                <ProgressBar
                  key={b.id}
                  label={b.category}
                  value={b.spent}
                  max={b.monthly_limit}
                  amounts={`${fmt(b.spent)} / ${fmt(b.monthly_limit)}`}
                />
              ))
          }
        </Card>
      </div>
    </div>
  );
}
