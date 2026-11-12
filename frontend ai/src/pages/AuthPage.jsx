import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BrainCircuit, CheckCircle2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { createDefaultDemoProfile, saveLearnerProfile } from '../services/learner-profile'
import './Auth.css'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [learningGoal, setLearningGoal] = useState('Master Java Data Structures & Algorithms for Technical Interviews')
  const [error, setError] = useState('')

  const enterDemo = (customName) => {
    setError('')
    try {
      if (customName && customName.trim()) {
        createDefaultDemoProfile(customName.trim())
      } else {
        createDefaultDemoProfile('Alex Rivers')
      }
      navigate('/', { replace: true })
    } catch (profileError) {
      setError(profileError.message || 'Could not initialize demo profile.')
    }
  }

  const submitProfile = (event) => {
    event.preventDefault()
    enterDemo(displayName)
  }

  return (
    <section className="auth-page page-enter">
      <div className="auth-brand">
        <span className="brand-mark"><BrainCircuit size={20} /></span>
        <span className="brand-name">mentor<span>.ai</span></span>
      </div>

      <div className="auth-card panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Instant Demo Access
          </span>
        </div>

        <h1>{isSignup ? 'Create Custom Demo Profile' : 'Welcome to DSA AI Mentor'}</h1>
        <p className="auth-description">
          {isSignup
            ? 'Personalize your demo learner profile name and goal. Stored directly in your browser.'
            : 'Enter the interactive Java DSA learning platform immediately with a pre-configured dummy profile.'}
        </p>

        {/* Demo Profile Badge Preview */}
        {!isSignup && (
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '12px 16px', margin: '16px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px' }}>
              AR
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px', color: '#fff' }}>Alex Rivers</strong>
                <span style={{ fontSize: '11px', background: '#27272a', color: '#a1a1aa', padding: '1px 6px', borderRadius: '4px' }}>Intermediate</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
                5-Day Streak · 1,450 XP · 12 Solved · Java 17
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a1a1aa' }}>
            <CheckCircle2 size={15} style={{ color: '#86efac' }} /> No real email or password required
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a1a1aa' }}>
            <CheckCircle2 size={15} style={{ color: '#86efac' }} /> Interactive visualizer for every concept & practice problem
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a1a1aa' }}>
            <CheckCircle2 size={15} style={{ color: '#86efac' }} /> Full OpenJDK 17 Java compiler & test case evaluator
          </div>
        </div>

        {error && <p className="auth-form-error" role="alert">{error}</p>}

        {isSignup ? (
          <form className="auth-form" onSubmit={submitProfile}>
            <div className="auth-field">
              <label htmlFor="auth-name">Your Display Name</label>
              <input
                id="auth-name"
                name="displayName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Maya Chen"
                maxLength={60}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-goal">Target Learning Goal</label>
              <input
                id="auth-goal"
                name="learningGoal"
                type="text"
                maxLength={120}
                value={learningGoal}
                onChange={(event) => setLearningGoal(event.target.value)}
                required
              />
            </div>
            <button className="primary-button auth-submit" type="submit" style={{ padding: '12px', fontSize: '15px', fontWeight: 600 }}>
              Launch Workspace <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="primary-button auth-submit"
              type="button"
              onClick={() => enterDemo()}
              style={{ padding: '14px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <UserCheck size={18} /> Continue as Demo User <ArrowRight size={16} />
            </button>
          </div>
        )}

        <p className="auth-switch" style={{ marginTop: '16px' }}>
          {isSignup ? 'Prefer default profile?' : 'Want to customize your profile details?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Use default demo user' : 'Set custom name & goal'}
          </Link>
        </p>
      </div>

      <p className="auth-footer">
        <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
        Demo user profile and progress persist in your browser across sessions.
      </p>
    </section>
  )
}
