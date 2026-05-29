import { useState } from 'react'
import { loginUser, registerUser } from '../utils/api'
import './Auth.css'

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [showAdminField, setShowAdminField] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setError(''); setName(''); setEmail('')
    setPassword(''); setConfirmPwd(''); setAdminCode('')
  }

  const switchMode = () => { setIsLogin(!isLogin); reset() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) return setError('Please fill all fields')
    if (!isLogin) {
      if (!name.trim()) return setError('Name is required')
      if (password.length < 6) return setError('Password must be at least 6 characters')
      if (password !== confirmPwd) return setError('Passwords do not match')
    }

    setLoading(true)
    try {
      const data = isLogin
        ? await loginUser(email, password)
        : await registerUser(name, email, password, adminCode)

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon">🛍️</div>
          <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p>{isLogin ? 'Sign in to continue shopping' : 'Join ShopEase today'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              </div>

              <div className="admin-toggle">
                <button type="button" className="admin-toggle-btn"
                  onClick={() => setShowAdminField(!showAdminField)}>
                  {showAdminField ? '▾' : '▸'} Registering as Admin?
                </button>
              </div>

              {showAdminField && (
                <div className="form-group">
                  <label>Admin Secret Code</label>
                  <input className="form-input" type="password" placeholder="Enter admin code"
                    value={adminCode} onChange={e => setAdminCode(e.target.value)} />
                  <span className="field-hint">Use code: ADMIN2026</span>
                </div>
              )}
            </>
          )}

          {error && <div className="auth-error">⚠ {error}</div>}

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '11px' }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={switchMode}>{isLogin ? 'Register' : 'Login'}</button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
