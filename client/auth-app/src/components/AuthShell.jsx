import { useEffect, useRef, useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import EarthChanScene from './EarthChanScene'
import { useAuth } from '../context/AuthContext'

export default function AuthShell() {
  const [activeTab, setActiveTab] = useState('login')
  const { loading, authMessage, authError } = useAuth()
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const tryPlay = () => {
      const promise = video.play()
      if (promise && typeof promise.catch === 'function') {
        promise.catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[AuthShell] video autoplay blocked', err)
        })
      }
    }

    if (video.readyState >= 2) {
      tryPlay()
    }

    const handleCanPlay = () => tryPlay()
    const handleError = (err) => {
      // eslint-disable-next-line no-console
      console.error('[AuthShell] video error', err)
    }
    const handleLoaded = () => {
      // eslint-disable-next-line no-console
      console.log('[AuthShell] video loaded data, dimensions:', video.videoWidth, 'x', video.videoHeight)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoaded)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoaded)
    }
  }, [])

  return (
    <div className="auth-shell">
      <video
        ref={videoRef}
        className="auth-shell__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/LoginBackground.mov" type="video/mp4" />
        <source src="/LoginBackground.mp4" type="video/mp4" />
      </video>

      <div className="auth-shell__veil" aria-hidden="true" />

      <aside className="auth-shell__scene">
        <EarthChanScene />
      </aside>

      <section className="auth-shell__panel">
        <div className="auth-panel">
          <div className="auth-panel__header">
            <p className="auth-panel__eyebrow">CivicCase Access</p>
            <h1 className="auth-panel__title">
              {activeTab === 'login' ? 'Welcome back' : 'Join the community'}
            </h1>
            <p className="auth-panel__lede">
              {activeTab === 'login'
                ? 'Sign in to report and track civic issues in your neighborhood.'
                : 'Create a resident account to report issues and engage with your community.'}
            </p>
          </div>

          <div className="tab-row" role="tablist" aria-label="Authentication">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={activeTab === 'login' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              className={activeTab === 'register' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          {loading ? <div className="message info">Checking current session...</div> : null}
          {authMessage ? <div className="message success">{authMessage}</div> : null}
          {authError ? <div className="message error">{authError}</div> : null}

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </section>
    </div>
  )
}
