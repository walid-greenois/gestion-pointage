'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <>
      {/* VIDEO BACKGROUND */}
      <video autoPlay muted loop className={styles.videoBackground}>
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className={styles.overlay}></div>

      {/* LOGIN CONTAINER */}
      <div className={styles.container}>
        <div className={styles.box}>
          <form onSubmit={handleSubmit}>
            {/* HEADING */}
            <h2 className={styles.heading}>
              <i className={`fas fa-heart ${styles.heartIcon}`}></i>
              Login
              <i className={`fas fa-heart ${styles.heartIcon}`}></i>
            </h2>

            {/* ERROR MESSAGE */}
            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* EMAIL INPUT */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              required
            />

            {/* PASSWORD INPUT */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              required
            />

            {/* SUBMIT BUTTON */}
            <input
              type="submit"
              value={loading ? 'Signing in...' : 'Sign in'}
              className={`${styles.inputField} ${styles.submitButton}`}
              disabled={loading}
            />

            {/* LINKS */}
            <div className={styles.group}>
              <a href="/forgot-password">Forgot Password</a>
              <a href="/signup">Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
