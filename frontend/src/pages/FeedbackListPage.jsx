/**
 * pages/FeedbackListPage.jsx — Filterable list of all team feedback (manager view)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { feedbackAPI } from '../utils/api';

const STATUS_COLORS = {
  open:     'text-amber-400 bg-amber-400/10 border-amber-400/25',
  reviewed: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
  resolved: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
};

const MOOD_EMOJI = {
  very_happy: '😄', happy: '😊', neutral: '😐', unhappy: '😔', very_unhappy: '😞',
};

const MOCK_FEEDBACK = Array.from({ length: 12 }, (_, i) => ({
  _id: `mock-${i}`,
  category: ['Workload', 'Management', 'Culture', 'Compensation'][i % 4],
  text: 'Sample feedback text that would appear here in the actual application with real data from the backend API.',
  mood: ['very_happy', 'happy', 'neutral', 'unhappy', 'very_unhappy'][i % 5],
  isAnonymous: i % 3 === 0,
  sentimentScore: (Math.random() * 2 - 1).toFixed(2) * 1,
  themes: [['workload', 'management'], ['culture', 'recognition'], ['compensation', 'career_growth']][i % 3],
  isUrgent: i === 2 || i === 7,
  status: ['open', 'reviewed', 'resolved'][i % 3],
  aiSummary: 'AI-generated summary of this feedback submission.',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const FeedbackListPage = () => {
  const navigate = useNavigate();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({ status: '', category: '', isUrgent: '' });
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  useEffect(() => { loadFeedback(); }, [filters, page]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await feedbackAPI.list(params);
      setItems(data.data);
      setTotal(data.pagination.total);
    } catch {
      setItems(MOCK_FEEDBACK);
      setTotal(MOCK_FEEDBACK.length);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6" style={{ background: '#0F1420' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-100">
              All <span className="text-gradient-teal">Feedback</span>
            </h1>
            <p className="text-slate-400 text-sm font-body mt-1">{total} submissions total</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-6 flex flex-wrap gap-3">
          {[
            { key: 'status',   label: 'Status',   options: ['', 'open', 'reviewed', 'resolved'] },
            { key: 'isUrgent', label: 'Urgent',   options: ['', 'true', 'false'] },
            { key: 'category', label: 'Category', options: ['', 'Workload', 'Management', 'Culture', 'Compensation', 'Work-Life Balance'] },
          ].map(({ key, label, options }) => (
            <div key={key} className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs text-slate-500 font-body" htmlFor={`filter-${key}`}>{label}</label>
              <select
                id={`filter-${key}`}
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="input-field py-2 text-sm"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt || `All ${label}s`}</option>
                ))}
              </select>
            </div>
          ))}
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-2"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/feedback/${item._id}`)}
                className="glass-card p-4 cursor-pointer hover:border-teal-400/20 transition-all duration-200 flex flex-wrap md:flex-nowrap gap-4 items-start"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/feedback/${item._id}`)}
                aria-label={`View feedback: ${item.category}`}
              >
                {/* Left: Mood */}
                <div className="flex-shrink-0 text-3xl w-10 text-center">{MOOD_EMOJI[item.mood] || '😐'}</div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-1.5">
                    <span className="font-heading font-semibold text-sm text-slate-100">{item.category}</span>
                    {item.isUrgent && <span className="urgent-tag theme-tag text-xs">🚨 Urgent</span>}
                    {item.isAnonymous && <span className="theme-tag text-xs">🔒</span>}
                  </div>
                  <p className="text-slate-400 text-xs font-body line-clamp-2">{item.aiSummary || item.text}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(item.themes || []).map((t) => (
                      <span key={t} className="theme-tag text-xs">{t.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>

                {/* Right: Meta */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2 text-xs font-body">
                  <span className={`theme-tag ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                  <span className="text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1 rounded-full" style={{ background: `linear-gradient(to right, #FF5B5B, #FFB347, #2EC4B6)` }}>
                      <div
                        className="h-full w-1.5 rounded-full bg-white opacity-80"
                        style={{ marginLeft: `calc(${((item.sentimentScore + 1) / 2) * 100}% - 3px)` }}
                      />
                    </div>
                    <span className="text-slate-500">{item.sentimentScore >= 0 ? '+' : ''}{(item.sentimentScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-400 font-body">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={items.length < 10} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackListPage;
