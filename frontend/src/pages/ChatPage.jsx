/**
 * pages/ChatPage.jsx — Employee feedback conversational UI
 *
 * Flow: mood check-in → open feedback → category tagging → anonymous toggle → submit
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackAPI } from '../utils/api';
import toast from 'react-hot-toast';

// ─── Conversation flow steps ───────────────────────────────────────────────────
const STEPS = ['mood', 'feedback', 'category', 'anonymous', 'done'];

const MOODS = [
  { value: 'very_happy', emoji: '😄', label: 'Great' },
  { value: 'happy',      emoji: '😊', label: 'Good' },
  { value: 'neutral',    emoji: '😐', label: 'Okay' },
  { value: 'unhappy',    emoji: '😔', label: 'Not great' },
  { value: 'very_unhappy', emoji: '😞', label: 'Struggling' },
];

const CATEGORIES = [
  'Workload', 'Management', 'Culture', 'Compensation',
  'Work-Life Balance', 'Career Growth', 'Team Dynamics', 'Other',
];

// ─── AI message bubble ─────────────────────────────────────────────────────────
const AIBubble = ({ message, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-start gap-3 mb-4"
  >
    {/* Agent avatar */}
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-lg">
      🌊
    </div>
    <div className="chat-bubble-ai font-body text-sm text-slate-200 leading-relaxed">
      {message}
    </div>
  </motion.div>
);

// ─── User reply bubble ─────────────────────────────────────────────────────────
const UserBubble = ({ content }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex justify-end mb-4"
  >
    <div className="chat-bubble-user font-body text-sm text-slate-200 leading-relaxed">
      {content}
    </div>
  </motion.div>
);

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-start gap-3 mb-4"
  >
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-lg">
      🌊
    </div>
    <div className="chat-bubble-ai flex items-center gap-2 py-3">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </motion.div>
);

// ─── Main Chat Page ────────────────────────────────────────────────────────────
const ChatPage = () => {
  const navigate  = useNavigate();
  const bottomRef = useRef(null);

  const [step, setStep]         = useState('mood');
  const [messages, setMessages] = useState([
    { type: 'ai', content: "Hey there! 👋 I'm Echo, your feedback companion. Everything you share here helps make your workplace better. Let's start — how are you feeling today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Feedback form state
  const [mood,        setMood]        = useState('');
  const [feedbackText,setFeedbackText]= useState('');
  const [category,    setCategory]    = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ─── Add AI message after a typing delay ──────────────────────────────────
  const addAIMessage = (content, delay = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [...m, { type: 'ai', content }]);
    }, delay);
  };

  // ─── Handle mood selection ─────────────────────────────────────────────────
  const handleMoodSelect = (m) => {
    setMood(m.value);
    setMessages((msgs) => [...msgs, { type: 'user', content: `${m.emoji} ${m.label}` }]);
    addAIMessage(
      `Thanks for sharing that. ${m.value === 'very_happy' || m.value === 'happy' ? "Great to hear you're doing well! 🌟" : "I'm sorry to hear that — your wellbeing matters. 💙"} Now, tell me in your own words — what's on your mind? What would you like to share with your team or management?`
    );
    setStep('feedback');
  };

  // ─── Handle free-text feedback ────────────────────────────────────────────
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setMessages((msgs) => [...msgs, { type: 'user', content: feedbackText }]);
    addAIMessage("Got it — that's really helpful context. 🙏 Which area does this feedback relate to most?");
    setStep('category');
  };

  // ─── Handle category selection ────────────────────────────────────────────
  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setMessages((msgs) => [...msgs, { type: 'user', content: `📌 ${cat}` }]);
    addAIMessage("Almost done! Last question — would you like to submit this feedback anonymously? Your choice is completely respected either way.");
    setStep('anonymous');
  };

  // ─── Handle anonymity and submit ──────────────────────────────────────────
  const handleAnonymousChoice = async (anon) => {
    setIsAnonymous(anon);
    const anonLabel = anon ? '🔒 Anonymous' : '👤 With my name';
    setMessages((msgs) => [...msgs, { type: 'user', content: anonLabel }]);
    addAIMessage("Thank you — submitting your feedback now...", 600);

    setLoading(true);
    try {
      await feedbackAPI.submit({
        category,
        text: feedbackText,
        mood,
        isAnonymous: anon,
      });
      setTimeout(() => navigate('/confirmation'), 1500);
    } catch (err) {
      toast.error('Submission failed. Please try again.');
      setLoading(false);
      setStep('anonymous');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1420' }}>
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="pt-20 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-xl animate-float">
              🌊
            </div>
            <div>
              <p className="font-heading font-semibold text-slate-100 text-sm">Echo</p>
              <p className="text-teal-400 text-xs font-body">Feedback Agent · Active</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" aria-label="Online" />
              <span className="text-slate-400 text-xs">Private session</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Messages area ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-label="Feedback conversation" aria-live="polite">
        <div className="max-w-2xl mx-auto flex flex-col">
          {messages.map((msg, i) =>
            msg.type === 'ai'
              ? <AIBubble key={i} message={msg.content} />
              : <UserBubble key={i} content={msg.content} />
          )}

          <AnimatePresence>
            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Input area — changes based on step ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isTyping && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky bottom-0 pb-safe bg-navy-900 border-t border-white/5 px-4 py-4"
          >
            <div className="max-w-2xl mx-auto">
              {/* Mood step */}
              {step === 'mood' && (
                <div className="flex justify-center gap-2 flex-wrap" role="group" aria-label="Select your mood">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleMoodSelect(m)}
                      className="mood-btn"
                      aria-label={`Mood: ${m.label}`}
                    >
                      <span>{m.emoji}</span>
                      <span className="text-xs font-body text-slate-400">{m.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Feedback text step */}
              {step === 'feedback' && (
                <form onSubmit={handleFeedbackSubmit} className="flex gap-3">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share what's on your mind... (minimum 10 characters)"
                    className="input-field resize-none flex-1 min-h-[80px]"
                    aria-label="Your feedback"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={feedbackText.trim().length < 10}
                    className={`btn-teal px-4 self-end ${feedbackText.trim().length < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Send feedback"
                  >
                    Send →
                  </button>
                </form>
              )}

              {/* Category step */}
              {step === 'category' && (
                <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Select feedback category">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="px-4 py-2 rounded-xl text-sm font-heading font-medium border border-white/10 text-slate-300 hover:border-teal-400/40 hover:text-teal-400 hover:bg-teal-400/5 transition-all duration-200"
                      aria-label={`Category: ${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Anonymity step */}
              {step === 'anonymous' && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleAnonymousChoice(true)}
                    disabled={loading}
                    className="btn-amber flex-1 max-w-xs flex items-center justify-center gap-2"
                    aria-label="Submit anonymously"
                  >
                    🔒 Submit Anonymously
                  </button>
                  <button
                    onClick={() => handleAnonymousChoice(false)}
                    disabled={loading}
                    className="btn-outline flex-1 max-w-xs flex items-center justify-center gap-2"
                    aria-label="Submit with your name"
                  >
                    👤 With My Name
                  </button>
                </div>
              )}

              {step === 'done' && (
                <p className="text-center text-slate-400 font-body text-sm">Submitting your feedback...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
