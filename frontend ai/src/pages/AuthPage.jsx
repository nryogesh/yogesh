import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit } from 'lucide-react'
import './Auth.css'

function validateForm(mode, formData) {
  const errors = {}
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (mode === 'signup' && !String(formData.get('name') || '').trim()) {
    errors.name = 'Enter your name.'
  }
  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!password) {
    errors.password = 'Enter a password.'
  } else if (mode === 'signup' && password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }
  if (mode === 'signup' && password !== formData.get('confirmPassword')) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function AuthPage({ mode, isSubmitting = false }) {
  const isSignup = mode === 'signup'
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [unlockedFields, setUnlockedFields] = useState(() => new Set())

  const handleSubmit = (event) => {
    event.preventDefault()
    setNotice('')
    const nextErrors = validateForm(mode, new FormData(event.currentTarget))
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setNotice(isSignup
      ? 'Authentication is not connected yet. No account was created.'
      : 'Authentication is not connected yet. You are not signed in.')
  }

  const fieldProps = (field) => ({
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    readOnly: !unlockedFields.has(field),
    onFocus: () => setUnlockedFields((current) => new Set(current).add(field)),
  })

  return <section className="auth-page page-enter">
    <div className="auth-brand"><span className="brand-mark"><BrainCircuit size={18} /></span><span className="brand-name">mentor<span>.ai</span></span></div>
    <div className="auth-card panel">
      <p className="eyebrow accent-eyebrow">Your DSA learning workspace</p>
      <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="auth-description">{isSignup ? 'Set up a profile for your learning journey.' : 'Sign in to continue your learning journey.'}</p>
      <p className="auth-preview-note" role="note">Preview only — account access is not enabled yet. Do not enter a real password.</p>

      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} autoComplete="off">
        {isSignup && <div className="auth-field">
          <label htmlFor="auth-name">Name</label>
          <input id="auth-name" name="preview-name" type="text" autoComplete="off" placeholder="Your name" {...fieldProps('name')} />
          {errors.name && <p className="auth-field-error" id="name-error">{errors.name}</p>}
        </div>}
        <div className="auth-field">
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" name="preview-email" type="email" autoComplete="off" placeholder="you@example.com" {...fieldProps('email')} />
          {errors.email && <p className="auth-field-error" id="email-error">{errors.email}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" name="preview-password" type="password" autoComplete="new-password" placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} {...fieldProps('password')} />
          {errors.password && <p className="auth-field-error" id="password-error">{errors.password}</p>}
        </div>
        {isSignup && <div className="auth-field">
          <label htmlFor="auth-confirm-password">Confirm password</label>
          <input id="auth-confirm-password" name="preview-confirm-password" type="password" autoComplete="new-password" placeholder="Re-enter your password" {...fieldProps('confirmPassword')} />
          {errors.confirmPassword && <p className="auth-field-error" id="confirmPassword-error">{errors.confirmPassword}</p>}
        </div>}
        {Object.keys(errors).length > 0 && <p className="auth-form-error" role="alert">Check the highlighted fields and try again.</p>}
        {notice && <p className="auth-form-notice" role="status">{notice}</p>}
        <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'} <ArrowRight size={15} />
        </button>
      </form>

      <p className="auth-switch">
        {isSignup ? 'Already have an account?' : 'New to mentor.ai?'}{' '}
        <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link>
      </p>
    </div>
    <p className="auth-footer">Authentication will be connected in a future setup phase.</p>
  </section>
}
