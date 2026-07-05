/**
 * pages/ConfirmationPage.jsx — Thank you page with constellation completion animation
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animated SVG: constellation forming a completed star/heart shape
const ConstellationComplete = () => {
  // 8 nodes forming a circle — lines animate in sequence
  const nodes = [
    { x: 150, y: 50  }, { x: 220, y: 90  }, { x: 245, y: 170 },
    { x: 200, y: 235 }, { x: 150, y: 255 }, { x: 100, y: 235 },
    { x: 55,  y: 170 }, { x: 80,  y: 90  },
  ];
  const center = { x: 150, y: 155 };

  const lines = nodes.map((n, i) => ({
    x1: n.x, y1: n.y,
    x2: nodes[(i + 1) % nodes.length].x,
    y2: nodes[(i + 1) % nodes.length].y,
  }));

  return (
    <svg
      width="300"
      height="310"
      viewBox="0 0 300 310"
      aria-label="Constellation complete — feedback received"
      role="img"
    >
      {/* Soft glow */}
      <circle cx="150" cy="155" r="110" fill="rgba(46,196,182,0.04)" />

      {/* Animated edges */}
      {lines.map((l, i) => (
        <motion.line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(46,196,182,0.5)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
        />
      ))}

      {/* Spoke lines to center */}
      {nodes.map((n, i) => (
        <motion.line
          key={`s-${i}`}
          x1={n.x} y1={n.y} x2={center.x} y2={center.y}
          stroke="rgba(244,162,97,0.2)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + i * 0.08 }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={i % 2 === 0 ? 5 : 3.5}
          fill={i % 2 === 0 ? '#F4A261' : '#2EC4B6'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
        />
      ))}

      {/* Center pulse */}
      <motion.circle
        cx={center.x} cy={center.y} r="16"
        fill="rgba(244,162,97,0.15)"
        animate={{ r: [16, 22, 16] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx={center.x} cy={center.y} r="10" fill="#F4A261" opacity="0.9"/>
      <motion.text
        x={center.x} y={center.y + 5}
        textAnchor="middle"
        fontSize="12"
        fill="#0F1420"
        fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        ✓
      </motion.text>
    </svg>
  );
};

const ConfirmationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0F1420' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-lg"
      >
        {/* Constellation animation */}
        <div className="flex justify-center mb-8">
          <ConstellationComplete />
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-400/25 bg-teal-400/5 text-teal-400 text-sm font-body mb-4">
            ✨ Feedback received
          </div>

          <h1 className="font-heading font-bold text-4xl md:text-5xl text-slate-100 mb-4">
            Your voice has been{' '}
            <span className="text-gradient-amber">heard</span>
          </h1>

          <p className="text-slate-400 font-body text-base leading-relaxed mb-10">
            Thank you for taking the time to share. Your feedback is being analyzed by Echo 
            and will be reviewed by your team's leadership — you're helping build a better 
            workplace for everyone. 🌟
          </p>

          <div className="glass-card p-6 text-left mb-8">
            <h3 className="font-heading font-semibold text-slate-200 mb-3 text-sm">What happens next</h3>
            <ul className="space-y-2">
              {[
                { icon: '🧠', text: 'Echo AI analyzes sentiment and themes in real time' },
                { icon: '🔒', text: 'Your privacy preferences are fully respected' },
                { icon: '📊', text: 'Insights appear on your manager\'s dashboard' },
                { icon: '⚡', text: 'Urgent issues trigger immediate follow-up' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-slate-300 font-body">
                  <span className="flex-shrink-0">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="btn-amber px-8 py-3"
              aria-label="Submit another piece of feedback"
            >
              Share More Feedback
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="btn-outline px-8 py-3"
              aria-label="Return to home page"
            >
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConfirmationPage;
