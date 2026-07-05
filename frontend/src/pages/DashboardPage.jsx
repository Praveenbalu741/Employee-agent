/**
 * pages/DashboardPage.jsx — Manager/HR analytics dashboard
 *
 * Sections:
 *  - Overview stats (total, avg sentiment, urgent)
 *  - Sentiment trend line chart (Recharts)
 *  - Theme frequency word-cloud-style grid
 *  - Urgent alerts panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

// ─── Stat card component ────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'teal', icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card tilt-card p-6"
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`theme-tag ${color === 'amber' ? 'border-amber-400/30 text-amber-400 bg-amber-400/10' : ''}`}>
        {sub}
      </span>
    </div>
    <div className={`font-heading font-bold text-4xl mb-1 ${color === 'amber' ? 'text-gradient-amber' : 'text-gradient-teal'}`}>
      {value}
    </div>
    <div className="text-slate-400 text-sm font-body">{label}</div>
  </motion.div>
);

// ─── Custom chart tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs font-body">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="text-teal-400 font-semibold">
        Sentiment: {(payload[0]?.value * 100).toFixed(0)}%
      </p>
      <p className="text-slate-400">Count: {payload[1]?.value || 0}</p>
    </div>
  );
};

// ─── Sentiment label ────────────────────────────────────────────────────────
const sentimentLabel = (score) => {
  if (score >= 0.4)  return { text: 'Positive',  color: '#2EC4B6' };
  if (score >= 0.1)  return { text: 'Slightly +', color: '#5EDDD6' };
  if (score >= -0.1) return { text: 'Neutral',    color: '#A0AABB' };
  if (score >= -0.4) return { text: 'Slightly −', color: '#FFB347' };
  return              { text: 'Negative',  color: '#FF5B5B' };
};

const DashboardPage = () => {
  const navigate  = useNavigate();
  const [overview,    setOverview]    = useState(null);
  const [trends,      setTrends]      = useState([]);
  const [themes,      setThemes]      = useState([]);
  const [urgent,      setUrgent]      = useState([]);
  const [period,      setPeriod]      = useState('day');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [ovRes, trendRes, themeRes, urgentRes] = await Promise.all([
        dashboardAPI.overview(),
        dashboardAPI.sentimentTrends({ period }),
        dashboardAPI.themes(),
        dashboardAPI.urgent(),
      ]);

      setOverview(ovRes.data.data);
      // Format trend data for Recharts
      setTrends(
        trendRes.data.data.map((d) => ({
          date: `${d._id.month || ''}/${d._id.day || d._id.week || ''}`,
          sentiment: parseFloat(d.avgSentiment.toFixed(3)),
          count: d.count,
        }))
      );
      setThemes(themeRes.data.data);
      setUrgent(urgentRes.data.data);
    } catch (err) {
      // Show mock data for demo if not authenticated or no data
      setOverview({ totalFeedback: 142, urgentUnresolved: 3, avgSentiment: 0.24, moodDistribution: [] });
      setTrends(generateMockTrends());
      setThemes(generateMockThemes());
      setUrgent(generateMockUrgent());
      if (err.response?.status !== 401) {
        toast.error('Could not load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data helpers for demo/dev
  const generateMockTrends = () =>
    Array.from({ length: 14 }, (_, i) => ({
      date: `6/${i + 20}`,
      sentiment: (Math.random() * 0.8 - 0.2).toFixed(3) * 1,
      count: Math.floor(Math.random() * 12) + 2,
    }));

  const generateMockThemes = () => [
    { theme: 'workload', count: 38 }, { theme: 'management', count: 27 },
    { theme: 'culture', count: 22 }, { theme: 'work_life_balance', count: 19 },
    { theme: 'compensation', count: 15 }, { theme: 'career_growth', count: 12 },
    { theme: 'communication', count: 10 }, { theme: 'recognition', count: 8 },
  ];

  const generateMockUrgent = () => [
    { _id: '1', category: 'Culture', urgentReason: 'burnout_crisis', aiSummary: 'Employee expressing severe burnout and considering resignation.', createdAt: new Date(), isAnonymous: true, status: 'open' },
    { _id: '2', category: 'Management', urgentReason: 'harassment', aiSummary: 'Reports of inappropriate behavior in team meetings.', createdAt: new Date(), isAnonymous: false, status: 'open' },
    { _id: '3', category: 'Workload', urgentReason: 'mental_health_crisis', aiSummary: 'Significant anxiety and mental health concerns mentioned.', createdAt: new Date(), isAnonymous: true, status: 'reviewed' },
  ];

  const urgentLabels = {
    harassment: 'Harassment', bullying: 'Bullying', discrimination: 'Discrimination',
    burnout_crisis: 'Burnout Crisis', safety_concern: 'Safety', mental_health_crisis: 'Mental Health', resignation_risk: 'Resignation Risk',
  };

  const avgScore = parseFloat(overview?.avgSentiment || 0);
  const sentiment = sentimentLabel(avgScore);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6" style={{ background: '#0F1420' }}>
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-slate-100">
              Insights <span className="text-gradient-teal">Dashboard</span>
            </h1>
            <p className="text-slate-400 font-body text-sm mt-1">Real-time feedback analytics powered by Echo AI</p>
          </div>
          {/* Period filter */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl" role="group" aria-label="Time period">
            {['day', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-heading capitalize transition-all ${
                  period === p ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={period === p}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Stats row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="💬" label="Total Feedback" value={overview?.totalFeedback ?? '—'} sub="All time" delay={0} />
          <StatCard icon="📊" label="Avg Sentiment" value={sentiment.text} sub={`${(avgScore * 100).toFixed(0)}%`} color="amber" delay={0.1} />
          <StatCard icon="🚨" label="Urgent Flags" value={overview?.urgentUnresolved ?? '—'} sub="Unresolved" color="amber" delay={0.2} />
          <StatCard icon="✅" label="Resolved" value={Math.floor((overview?.totalFeedback || 0) * 0.72)} sub="This month" delay={0.3} />
        </div>

        {/* ─── Main grid ──────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Sentiment trend chart — 2/3 width */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <h2 className="font-heading font-semibold text-slate-100 mb-4 text-lg">
              Sentiment Trend
              <span className="ml-2 text-sm font-body text-slate-400">({period}ly)</span>
            </h2>
            <div className="h-64" aria-label="Sentiment trend line chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2EC4B6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#70809A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[-1, 1]} tick={{ fill: '#70809A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="sentiment" stroke="#2EC4B6" strokeWidth={2.5} fill="url(#sentGrad)" dot={false} activeDot={{ r: 4, fill: '#2EC4B6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Theme breakdown — 1/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="font-heading font-semibold text-slate-100 mb-4 text-lg">Top Themes</h2>
            <div className="space-y-3">
              {themes.slice(0, 7).map((t, i) => {
                const maxCount = themes[0]?.count || 1;
                const pct = Math.round((t.count / maxCount) * 100);
                return (
                  <div key={t.theme}>
                    <div className="flex justify-between text-xs font-body mb-1">
                      <span className="text-slate-300 capitalize">{t.theme.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500">{t.count}</span>
                    </div>
                    <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: i % 2 === 0 ? '#2EC4B6' : '#F4A261' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ─── Urgent alerts ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mt-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-slate-100 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" aria-hidden="true" />
              Urgent Alerts
              <span className="text-sm font-body text-slate-400">({urgent.length} unresolved)</span>
            </h2>
          </div>

          {urgent.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-body">
              🎉 No urgent alerts. Your team is doing great!
            </div>
          ) : (
            <div className="space-y-3">
              {urgent.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-red-500/15 bg-red-500/5 cursor-pointer"
                  onClick={() => navigate(`/feedback/${item._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/feedback/${item._id}`)}
                  aria-label={`View urgent feedback: ${urgentLabels[item.urgentReason]}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="urgent-tag theme-tag">{urgentLabels[item.urgentReason] || item.urgentReason}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-body leading-snug line-clamp-2">
                      {item.aiSummary}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-slate-500 text-xs">{item.category}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.isAnonymous && <span className="text-xs text-slate-500">· Anonymous</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`theme-tag text-xs ${item.status === 'reviewed' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'urgent-tag'}`}>
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
