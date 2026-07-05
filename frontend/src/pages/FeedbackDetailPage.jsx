/**
 * pages/FeedbackDetailPage.jsx — Individual feedback thread view
 * Shows AI summary, sentiment score, themes, suggested actions
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { feedbackAPI } from '../utils/api';
import toast from 'react-hot-toast';

const MOOD_MAP = {
  very_happy: { emoji: '😄', label: 'Great', color: '#2EC4B6' },
  happy:      { emoji: '😊', label: 'Good',  color: '#5EDDD6' },
  neutral:    { emoji: '😐', label: 'Okay',  color: '#A0AABB' },
  unhappy:    { emoji: '😔', label: 'Not great', color: '#FFB347' },
  very_unhappy: { emoji: '😞', label: 'Struggling', color: '#FF5B5B' },
};

const STATUS_COLORS = {
  open:     'text-amber-400 bg-amber-400/10 border-amber-400/25',
  reviewed: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
  resolved: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
};

// Sentiment score visual
const SentimentGauge = ({ score }) => {
  const pct = ((score + 1) / 2) * 100; // Map -1..1 → 0..100
  const color = score >= 0.2 ? '#2EC4B6' : score >= -0.2 ? '#FFB347' : '#FF5B5B';
  return (
    <div>
      <div className="flex justify-between text-xs font-body text-slate-400 mb-1.5">
        <span>Very Negative</span>
        <span>Neutral</span>
        <span>Very Positive</span>
      </div>
      <div className="sentiment-bar relative h-3 rounded-full">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-navy-900 shadow-lg"
          style={{ backgroundColor: color, left: `calc(${pct}% - 10px)` }}
          initial={{ left: '50%' }}
          animate={{ left: `calc(${pct}% - 10px)` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="font-heading font-bold text-2xl" style={{ color }}>
          {score >= 0 ? '+' : ''}{(score * 100).toFixed(0)}%
        </span>
        <span className="text-slate-400 text-sm font-body ml-2">sentiment score</span>
      </div>
    </div>
  );
};

// Suggested action items from AI urgency type
const getActionItems = (feedback) => {
  const actions = {
    harassment:          ['Schedule confidential HR meeting within 24h', 'Review team interaction logs', 'Engage legal/compliance team'],
    bullying:            ['Speak privately with affected employee', 'Conduct anonymous team survey', 'Review management practices'],
    burnout_crisis:      ['Immediate 1:1 check-in with employee', 'Review current workload distribution', 'Discuss PTO/mental health resources'],
    mental_health_crisis:['Provide EAP resources immediately', 'Connect with mental health support', 'Reduce workload pressure'],
    safety_concern:      ['Conduct safety inspection', 'Review incident reporting procedures', 'Brief team on safety protocols'],
    resignation_risk:    ['Schedule retention conversation', 'Review compensation/role alignment', 'Identify growth opportunities'],
  };
  return actions[feedback?.urgentReason] || [
    'Review feedback in context of recent team events',
    'Consider team-wide discussion on the topic',
    'Follow up in next 1:1',
  ];
};

const FeedbackDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [id]);

  const loadFeedback = async () => {
    try {
      const { data } = await feedbackAPI.get(id);
      setFeedback(data.data);
    } catch {
      // Show mock data for demo
      setFeedback({
        _id: id,
        category: 'Workload',
        text: "I've been consistently working past 9 PM for the last three weeks. The project deadlines are unrealistic and I feel like I'm falling behind no matter how hard I try. I'm starting to feel burnt out and I'm worried about my health.",
        mood: 'very_unhappy',
        isAnonymous: true,
        sentimentScore: -0.72,
        themes: ['workload', 'burnout_crisis', 'work_life_balance'],
        isUrgent: true,
        urgentReason: 'burnout_crisis',
        aiSummary: "Employee reports chronic overwork with unrealistic deadlines over three weeks, expressing significant burnout risk and health concerns.",
        status: 'open',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await feedbackAPI.update(id, { status: newStatus });
      setFeedback((f) => ({ ...f, status: newStatus }));
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1420' }}>
        <div className="flex gap-2"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
      </div>
    );
  }

  const mood = MOOD_MAP[feedback.mood] || MOOD_MAP.neutral;
  const actionItems = getActionItems(feedback);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6" style={{ background: '#0F1420' }}>
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-teal-400 text-sm font-body mb-6 flex items-center gap-1.5 transition-colors" aria-label="Go back">
          ← Back to Dashboard
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 items-start justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-slate-100 mb-2">
              Feedback Detail
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="theme-tag">{feedback.category}</span>
              {feedback.isUrgent && <span className="urgent-tag theme-tag">🚨 Urgent</span>}
              {feedback.isAnonymous && <span className="theme-tag">🔒 Anonymous</span>}
              <span className={`theme-tag ${STATUS_COLORS[feedback.status]}`}>
                {feedback.status}
              </span>
            </div>
          </div>
          {/* Status update buttons */}
          <div className="flex gap-2">
            {feedback.status !== 'reviewed' && (
              <button onClick={() => updateStatus('reviewed')} disabled={updating} className="btn-teal text-sm px-4 py-2">
                Mark Reviewed
              </button>
            )}
            {feedback.status !== 'resolved' && (
              <button onClick={() => updateStatus('resolved')} disabled={updating} className="btn-outline text-sm px-4 py-2">
                Resolve
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">

            {/* Mood & Date */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{mood.emoji}</span>
                <div>
                  <p className="font-heading font-semibold text-slate-100">{mood.label}</p>
                  <p className="text-slate-400 text-xs font-body">{new Date(feedback.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-slate-200 font-body text-sm leading-relaxed italic border-l-2 border-amber-400/40 pl-4">
                "{feedback.text}"
              </p>
            </motion.div>

            {/* AI Summary */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <h2 className="font-heading font-semibold text-teal-400 text-sm">Echo AI Summary</h2>
              </div>
              <p className="text-slate-200 font-body text-sm leading-relaxed">{feedback.aiSummary}</p>
            </motion.div>

            {/* Suggested actions */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚡</span>
                <h2 className="font-heading font-semibold text-amber-400 text-sm">Suggested Actions</h2>
              </div>
              <ul className="space-y-2.5">
                {actionItems.map((action, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-2.5 text-sm text-slate-300 font-body"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-400 text-xs flex items-center justify-center font-heading font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {action}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Sentiment gauge */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
              <h2 className="font-heading font-semibold text-slate-100 text-sm mb-4">Sentiment Score</h2>
              <SentimentGauge score={feedback.sentimentScore ?? 0} />
            </motion.div>

            {/* Theme tags */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
              <h2 className="font-heading font-semibold text-slate-100 text-sm mb-3">Detected Themes</h2>
              <div className="flex flex-wrap gap-2">
                {(feedback.themes || []).map((t) => (
                  <span key={t} className="theme-tag capitalize">{t.replace(/_/g, ' ')}</span>
                ))}
                {(!feedback.themes || feedback.themes.length === 0) && (
                  <span className="text-slate-500 text-xs font-body">Processing...</span>
                )}
              </div>
            </motion.div>

            {/* Meta info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h2 className="font-heading font-semibold text-slate-100 text-sm mb-3">Details</h2>
              <dl className="space-y-2 text-xs font-body">
                {[
                  ['Submitted', new Date(feedback.createdAt).toLocaleDateString()],
                  ['Category',  feedback.category],
                  ['Anonymous', feedback.isAnonymous ? 'Yes' : 'No'],
                  ['AI Processed', feedback.aiProcessed ? 'Yes' : 'Pending'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-300">{val}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailPage;
