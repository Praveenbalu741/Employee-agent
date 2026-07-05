/**
 * pages/SettingsPage.jsx — Manager configuration: categories, anonymity, notifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Toggle = ({ checked, onChange, id, label }) => (
  <label htmlFor={id} className="flex items-center justify-between cursor-pointer group">
    <span className="font-body text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 ${
        checked ? 'bg-teal-400' : 'bg-navy-600'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </label>
);

const SectionCard = ({ title, icon, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6"
    aria-labelledby={`section-${title}`}
  >
    <h2 id={`section-${title}`} className="font-heading font-semibold text-slate-100 mb-5 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h2>
    {children}
  </motion.section>
);

const SettingsPage = () => {
  const { user } = useAuth();

  const [settings, setSettings]   = useState(null);
  const [loading,  setLoading]     = useState(true);
  const [saving,   setSaving]      = useState(false);
  const [newCat,   setNewCat]      = useState('');

  // Local form state
  const [categories,   setCategories]   = useState([]);
  const [anonDefault,  setAnonDefault]  = useState(false);
  const [urgentEmail,  setUrgentEmail]  = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [webhookUrl,   setWebhookUrl]   = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      const s = data.data;
      setSettings(s);
      setCategories(s.feedbackCategories || []);
      setAnonDefault(s.anonymityDefault || false);
      setUrgentEmail(s.notificationPreferences?.urgentEmail ?? true);
      setWeeklyDigest(s.notificationPreferences?.weeklyDigest ?? true);
      setWebhookUrl(s.notificationPreferences?.webhookUrl || '');
    } catch {
      // Use defaults for demo
      setCategories(['Workload', 'Management', 'Culture', 'Compensation', 'Work-Life Balance', 'Career Growth', 'Other']);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCat('');
  };

  const removeCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update({
        feedbackCategories: categories,
        anonymityDefault: anonDefault,
        notificationPreferences: {
          urgentEmail,
          weeklyDigest,
          webhookUrl: webhookUrl || null,
        },
      });
      toast.success('Settings saved successfully! ✅');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1420' }}>
        <div className="flex gap-2"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6" style={{ background: '#0F1420' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-100 mb-1">
            Team <span className="text-gradient-amber">Settings</span>
          </h1>
          <p className="text-slate-400 font-body text-sm">
            Configure feedback options for your team. Changes apply to all future submissions.
          </p>
        </motion.div>

        <div className="space-y-6">

          {/* Feedback Categories */}
          <SectionCard title="Feedback Categories" icon="🏷️" delay={0}>
            <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Feedback categories">
              {categories.map((cat) => (
                <motion.div
                  key={cat}
                  layout
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-navy-800 text-sm text-slate-200 font-body"
                  role="listitem"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="text-slate-500 hover:text-red-400 transition-colors ml-1 text-xs leading-none"
                    aria-label={`Remove category ${cat}`}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Add a new category..."
                className="input-field flex-1"
                aria-label="New category name"
              />
              <button onClick={addCategory} className="btn-teal px-4 py-2 text-sm whitespace-nowrap" aria-label="Add category">
                + Add
              </button>
            </div>
          </SectionCard>

          {/* Anonymity */}
          <SectionCard title="Anonymity Settings" icon="🔒" delay={0.1}>
            <div className="space-y-4">
              <Toggle
                id="anon-default"
                label="Anonymous by default — employees can opt to reveal their identity"
                checked={anonDefault}
                onChange={setAnonDefault}
              />
              <p className="text-slate-500 text-xs font-body">
                When enabled, all new feedback submissions default to anonymous. Employees can still choose to add their name.
              </p>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notification Preferences" icon="🔔" delay={0.2}>
            <div className="space-y-5">
              <Toggle
                id="urgent-email"
                label="Email alerts for urgent feedback (harassment, burnout, safety)"
                checked={urgentEmail}
                onChange={setUrgentEmail}
              />
              <Toggle
                id="weekly-digest"
                label="Weekly sentiment digest email every Monday"
                checked={weeklyDigest}
                onChange={setWeeklyDigest}
              />
              <div>
                <label htmlFor="webhook-url" className="block text-sm font-body text-slate-300 mb-1.5">
                  Webhook URL (Slack / Teams integration — optional)
                </label>
                <input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          {/* Profile Info (read-only) */}
          <SectionCard title="Manager Profile" icon="👤" delay={0.3}>
            <dl className="grid grid-cols-2 gap-3 text-sm font-body">
              {[
                ['Name',  user?.name  || '—'],
                ['Email', user?.email || '—'],
                ['Role',  user?.role  || '—'],
              ].map(([label, val]) => (
                <div key={label} className="col-span-1">
                  <dt className="text-slate-500 text-xs mb-0.5">{label}</dt>
                  <dd className="text-slate-200">{val}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          {/* Save button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className={`btn-amber w-full py-4 text-base ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            aria-busy={saving}
            aria-label="Save settings"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </span>
            ) : '💾 Save Settings'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
