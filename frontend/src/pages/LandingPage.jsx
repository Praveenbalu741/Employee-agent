/**
 * pages/LandingPage.jsx — Hero landing page with constellation background,
 * animated tagline, and dual CTA (Employee / Manager)
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConstellationBackground from '../components/ConstellationBackground';

// Abstract SVG "listening" mascot — ear/wave motif
const ListeningMascot = () => (
  <svg
    width="280"
    height="280"
    viewBox="0 0 280 280"
    fill="none"
    aria-label="Abstract listening wave mascot"
    role="img"
  >
    {/* Outer glow rings */}
    <circle cx="140" cy="140" r="130" stroke="rgba(46,196,182,0.08)" strokeWidth="1" />
    <circle cx="140" cy="140" r="110" stroke="rgba(244,162,97,0.12)" strokeWidth="1" />
    <circle cx="140" cy="140" r="90"  stroke="rgba(46,196,182,0.15)" strokeWidth="1" />

    {/* Animated wave arcs (ear motif) */}
    <path d="M100 140 Q110 110 140 140 Q170 170 180 140" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M80  140 Q100 95  140 140 Q180 185 200 140" stroke="#2EC4B6" strokeWidth="2"   strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M60  140 Q90  80  140 140 Q190 200 220 140" stroke="#F4A261" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    <path d="M40  140 Q80  65  140 140 Q200 215 240 140" stroke="#2EC4B6" strokeWidth="1"   strokeLinecap="round" fill="none" opacity="0.2"/>

    {/* Center node */}
    <circle cx="140" cy="140" r="10" fill="#F4A261" opacity="0.9"/>
    <circle cx="140" cy="140" r="6"  fill="#0F1420"/>
    <circle cx="140" cy="140" r="3"  fill="#F4A261"/>

    {/* Constellation nodes */}
    {[
      [80, 80, '46,196,182'],  [200, 80, '244,162,97'],
      [60, 160, '244,162,97'], [220, 160,'46,196,182'],
      [100,210, '46,196,182'], [180, 210,'244,162,97'],
    ].map(([x, y, c], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="3.5" fill={`rgb(${c})`} opacity="0.8"/>
        <line x1={x} y1={y} x2="140" y2="140" stroke={`rgba(${c},0.15)`} strokeWidth="1"/>
      </g>
    ))}
  </svg>
);

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card tilt-card p-6"
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-heading font-bold text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-300 text-sm font-body leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 constellation-bg" style={{ background: '#0F1420' }}>
      {/* ─── Constellation canvas background ─────────────────────────────────── */}
      <ConstellationBackground />

      {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        {/* Animated mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 animate-float"
        >
          <ListeningMascot />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-400/25 bg-teal-400/5 text-teal-400 text-sm font-body mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse inline-block" />
            AI-Powered Workplace Listening
          </div>

          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-slate-100 leading-tight mb-6">
            Every Voice{' '}
            <span className="text-gradient-amber">Deserves</span>{' '}
            to Be{' '}
            <span className="text-gradient-teal">Heard</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl font-body leading-relaxed max-w-2xl mx-auto mb-10">
            EchoAgent uses AI to transform employee feedback into meaningful insights — 
            safely, anonymously, and in real time. Connect the constellation of voices 
            in your organization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="btn-amber text-base px-8 py-4 flex items-center gap-2"
              aria-label="Share your feedback as an employee"
            >
              <span>🌊</span> Share Your Voice
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login?role=manager')}
              className="btn-outline text-base px-8 py-4 flex items-center gap-2"
              aria-label="Manager or HR login"
            >
              <span>📊</span> I'm a Manager
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs font-body">Discover more</span>
          <div className="w-px h-12 bg-gradient-to-b from-teal-400/30 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ─── FEATURES SECTION ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-3xl md:text-4xl text-center text-slate-100 mb-3"
        >
          Built for trust. Powered by{' '}
          <span className="text-gradient-teal">AI</span>.
        </motion.h2>
        <p className="text-slate-400 text-center font-body mb-12 max-w-xl mx-auto">
          Three steps to a healthier workplace culture.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🔐"
            title="Safe & Anonymous"
            desc="Employees choose their privacy level. Anonymous submissions are fully de-identified — even from the tech team."
            delay={0}
          />
          <FeatureCard
            icon="🧠"
            title="AI-Enriched Insights"
            desc="Claude AI analyzes every submission for sentiment, themes, and urgency — surfacing patterns managers can act on."
            delay={0.1}
          />
          <FeatureCard
            icon="⚡"
            title="Instant Alerts"
            desc="Urgent signals like burnout or harassment are flagged immediately so HR can respond before situations escalate."
            delay={0.2}
          />
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { n: '98%', label: 'Response Privacy' },
            { n: '<2s', label: 'AI Processing' },
            { n: '7 layers', label: 'Sentiment Analysis' },
            { n: '24/7',  label: 'Urgent Monitoring' },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="font-heading font-bold text-3xl text-gradient-amber">{n}</div>
              <div className="text-slate-400 text-sm font-body mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
