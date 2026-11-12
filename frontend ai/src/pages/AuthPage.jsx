import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BrainCircuit, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'
import { authenticateDemoUser, DEMO_CREDENTIALS } from '../services/demo-auth'
import { createDefaultDemoProfile, saveLearnerProfile } from '../services/learner-profile'
import './Auth.css'
import './AuthLogin.css'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [learningGoal, setLearningGoal] = useState('Master Java Data Structures & Algorithms for Technical Interviews')
  const [error, setError] = useState('')

  const signIn = (event) => {
    event.preventDefault()
    setError('')

    if (!userId.trim() || !password) {
      setError('Enter both your demo User ID and password.')
      return
    }

    if (!authenticateDemoUser(userId, password)) {
      setError('The User ID or password is incorrect. Use the demo credentials shown below.')
      return
    }

    try {
      createDefaultDemoProfile(isSignup && displayName.trim() ? displayName.trim() : 'Alex Rivers')
      if (isSignup && learningGoal.trim()) saveLearnerProfile({ learningGoal })
      navigate('/', { replace: true })
    } catch (profileError) {
      setError(profileError.message || 'Could not initialize demo profile.')
    }
  }

  return (
    <section className="auth-page page-enter">
      <div className="auth-brand">
        <span className="brand-mark"><BrainCircuit size={20} /></span>
        <span className="brand-name">mentor<span>.ai</span></span>
      </div>

      <div className="auth-card panel">
        <span className="auth-demo-badge"><Sparkles size={12} /> Local demo account</span>
        <h1>{isSignup ? 'Personalize your demo profile' : 'Welcome to DSA AI Mentor'}</h1>
        <p className="auth-description">
          {isSignup
            ? 'Sign in with the demo account to save your profile preferences in this browser.'
            : 'Sign in with the demo account to continue to your learning dashboard.'}
        </p>

        <div className="demo-credentials" aria-label="Demo account credentials">
          <p><CheckCircle2 size={15} /> Demo credentials</p>
          <div><span>User ID</span><code>{DEMO_CREDENTIALS.userId}</code></div>
          <div><span>Password</span><code>{DEMO_CREDENTIALS.password}</code></div>
        </div>

        <div className="auth-benefits">
          <p><CheckCircle2 size={15} /> Learning progress remains saved in this browser</p>
          <p><CheckCircle2 size={15} /> Interactive algorithm lessons and practice</p>
          <p><CheckCircle2 size={15} /> No external authentication service required</p>
        </div>

        {error && <p className="auth-form-error" role="alert">{error}</p>}

        <form className="auth-form" onSubmit={signIn}>
          <div className="auth-field">
            <label htmlFor="auth-user-id">User ID</label>
            <input
              id="auth-user-id"
              name="userId"
              type="text"
              autoComplete="username"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              aria-invalid={Boolean(error)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error)}
                required
              />
              <button
                className="password-visibility"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isSignup && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-name">Display name</label>
                <input
                  id="auth-name"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  maxLength={60}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-goal">Learning goal</label>
                <input
                  id="auth-goal"
                  name="learningGoal"
                  type="text"
                  maxLength={120}
                  value={learningGoal}
                  onChange={(event) => setLearningGoal(event.target.value)}
                />
              </div>
            </>
          )}

          <button className="primary-button auth-submit" type="submit">
            {isSignup ? 'Login and Save Profile' : 'Login'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Use the default demo profile?' : 'Want to customize your profile details?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Use standard login' : 'Customize profile'}
          </Link>
        </p>
      </div>

      <p className="auth-footer">
        <ShieldCheck size={14} /> Demo credentials are for this local demo only. They are not for protecting sensitive data.
      </p>
    </section>
  )
}
