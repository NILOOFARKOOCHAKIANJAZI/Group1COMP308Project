import { useEffect, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { CHATBOT_QUERY } from '../graphql/queries'
import './CivicHelperBot.css'

const QUICK_REPLIES = [
  'How many issues in total?',
  'How many open issues are there?',
  'How many resolved issues?',
  'Are there any urgent issues right now?',
  'What are the most common issue categories?',
  'Which neighborhoods have the most issues?',
  'Find issues that need volunteers',
]

const AVATAR_SRC = '/earth-chan.png'

export default function CivicHelperBot() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatError, setChatError] = useState('')

  const messagesRef = useRef(null)

  const [sendQuery, { loading }] = useLazyQuery(CHATBOT_QUERY, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (!open) {
      setHovered(false)
    }
  }, [open])

  const handleQuickReply = async (text) => {
    if (loading) return
    setChatError('')

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)

    try {
      const { data } = await sendQuery({ variables: { question: nextMessages } })
      const payload = data?.chatbotQuery

      if (!payload?.success) {
        throw new Error(payload?.message || 'The assistant could not answer that.')
      }

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: payload.text || 'No response was returned.' },
      ])
    } catch (error) {
      setChatError(error.message || 'The assistant request failed.')
    }
  }

  const handleClear = () => {
    setMessages([])
    setChatError('')
  }

  const handleClose = () => {
    setOpen(false)
    setChatError('')
  }

  if (open) {
    return (
      <div className="helper-panel" role="dialog" aria-label="Civic Helper">
        <header className="helper-panel__head">
          <div className="helper-panel__avatar" aria-hidden="true">
            <img
              src={AVATAR_SRC}
              alt=""
              width={40}
              height={40}
              className="helper-panel__avatar-img"
            />
          </div>
          <div className="helper-panel__heading">
            <span className="helper-panel__eyebrow">AI helper</span>
            <span className="helper-panel__title">Civic Helper</span>
          </div>
          <div className="helper-panel__head-actions">
            <button
              type="button"
              className="helper-panel__ghost-btn"
              onClick={handleClear}
              disabled={loading || messages.length === 0}
            >
              Clear chat
            </button>
            <button
              type="button"
              className="helper-panel__ghost-btn"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="helper-panel__messages" ref={messagesRef}>
          {messages.length === 0 && !loading && (
            <div className="helper-panel__intro">
              <p className="helper-panel__intro-line">
                Hi there. I can answer simple questions about community issues. Tap one below to get started.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`helper-bubble helper-bubble--${message.role}`}
            >
              {message.content}
            </div>
          ))}

          {loading && (
            <div className="helper-bubble helper-bubble--assistant helper-bubble--typing">
              <span className="helper-typing-dot" />
              <span className="helper-typing-dot" />
              <span className="helper-typing-dot" />
            </div>
          )}

          {chatError && (
            <div className="helper-panel__error" role="alert">
              {chatError}
            </div>
          )}
        </div>

        <div className="helper-panel__quick-replies" aria-label="Suggested questions">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              className="helper-quick-reply"
              onClick={() => handleQuickReply(reply)}
              disabled={loading}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`helper-launcher ${hovered ? 'helper-launcher--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="helper-launcher__bubble"
        role="presentation"
        aria-hidden={!hovered}
      >
        Need any AI help?
      </div>
      <button
        type="button"
        className="helper-launcher__btn"
        onClick={() => setOpen(true)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Open Civic Helper"
      >
        <img
          src={AVATAR_SRC}
          alt=""
          width={140}
          height={140}
          className="helper-launcher__avatar-img"
        />
      </button>
    </div>
  )
}
