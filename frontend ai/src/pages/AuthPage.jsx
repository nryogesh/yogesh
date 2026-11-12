import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BrainCircuit } from 'lucide-react'
import { saveLearnerProfile } from '../services/learner-profile'
import './Auth.css'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [learningGoal, setLearningGoal] = useState('Learn data structures and algorithms in Java')
  const [error, setError] = useState('')

  const enterDemo = (name = 'Demo User') => {
    setError('')
    try {
      saveLearnerProfile({ displayName: name, learningGoal })
      navigate('/', { replace: true })
    } catch (profileError) {
      setError(profileError.message || 'Could not save your demo profile.')
    }
  }

  const submitProfile = (event) => {
    event.preventDefault()
    enterDemo(displayName)
  }

  return <section className="auth-page page-enter">
    <div className="auth-brand"><span className="brand-mark"><BrainCircuit size={18} /></span><span className="brand-name">mentor<span>.ai</span></span></div>
    <div className="auth-card panel">
      <p className="eyebrow accent-eyebrow">Your DSA learning workspace</p>
      <h1>{isSignup ? 'Create a demo profile' : 'Welcome to mentor.ai'}</h1>
      <p className="auth-description">{isSignup ? 'Choose a name and a learning goal. Your profile stays on this device.' : 'Continue with a local demo profile to start learning.'}</p>
      <p className="auth-preview-note" role="note">Demo profiles are stored only in this browser. No password or real account is required.</p>

      {isSignup ? <form className="auth-form" onSubmit={submitProfile}>
        <div className="auth-field">
          <label htmlFor="auth-name">Display name</label>
          <input id="auth-name" name="displayName" type="text" autoComplete="name" maxLength={60} value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        </div>
        <div className="auth-field">
          <label htmlFor="auth-goal">Learning goal</label>
          <input id="auth-goal" name="learningGoal" type="text" maxLength={120} value={learningGoal} onChange={(event) => setLearningGoal(event.target.value)} required />
        </div>
        {error && <p className="auth-form-error" role="alert">{error}</p>}
        <button className="primary-button auth-submit" type="submit">Create demo profile <ArrowRight size={15} /></button>
      </form> : <>
        {error && <p className="auth-form-error" role="alert">{error}</p>}
        <button className="primary-button auth-submit" type="button" onClick={() => enterDemo()}>Continue as Demo User <ArrowRight size={15} /></button>
      </>}

      <p className="auth-switch">
        {isSignup ? 'Already have a demo profile?' : 'Want to personalize your profile?'}{' '}
        <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Continue as demo' : 'Set a display name'}</Link>
      </p>
    </div>
    <p className="auth-footer">Learning progress and profile details remain in this browser.</p>
  </section>
}
