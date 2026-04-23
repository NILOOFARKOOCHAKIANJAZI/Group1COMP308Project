import { useEffect, useMemo, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { CHATBOT_QUERY } from '../graphql/queries'

const STARTER_PROMPTS = [
  'Show me the open flooding issues in the city right now.',
  'Which neighborhoods have the highest issue volume this week?',
  'Find issues that still need volunteers signed up.',
  'Summarize the most common community concerns recently.',
]

const SIDEBAR_TIPS = [
  'Ask about counts, statuses, or categories like "How many open potholes do we have?"',
  'Drill into a neighborhood: "What is happening in Bay Ridge?"',
  'Surface volunteer gaps: "Which urgent issues have no volunteers?"',
  'Request a quick narrative: "Summarize the last seven days."',
]

function getInitials(user) {
  const source = user?.fullName || user?.username || ''
  const parts = source.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === '') return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function GeminiSpark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M5 17l.7 1.8 1.8.7-1.8.7L5 22l-.7-1.8-1.8-.7 1.8-.7L5 17z" opacity="0.55" />
      <path d="M19 14l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4z" opacity="0.55" />
    </svg>
  )
}
// A simple animated indicator to show when the assistant is generating a response.
function TypingDots() {
  return (
    <span className="aa-ai-typing" aria-label="Assistant is typing">
      <span className="aa-ai-typing__dot" />
      <span className="aa-ai-typing__dot" />
      <span className="aa-ai-typing__dot" />
    </span>
  )
}

// The AiChatBox component provides an interface for users to interact with an AI assistant, allowing them to ask questions and receive responses about community issues. It manages the chat state, handles user input, and displays messages in a conversational format.
export default function AiChatBox({ currentUser }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [chatError, setChatError] = useState('')

  const streamRef = useRef(null)
  const inputRef = useRef(null)

  const [sendQuery, { loading }] = useLazyQuery(CHATBOT_QUERY, {
    fetchPolicy: 'no-cache',
  })

  const hasMessages = useMemo(() => messages.length > 0, [messages])
  const userInitials = useMemo(() => getInitials(currentUser), [currentUser])

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (overrideText) => {
    const textToSend = (overrideText ?? input).trim()
    if (!textToSend || loading) return

    setChatError('')
    setInput('')

    const nextMessages = [...messages, { role: 'user', content: textToSend }]
    setMessages(nextMessages)

    try {
      const { data } = await sendQuery({
        variables: { question: nextMessages },
      })

      const payload = data?.chatbotQuery
      if (!payload?.success) {
        throw new Error(payload?.message || 'The assistant could not process your request.')
      }

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: payload.text || 'No response was returned.',
        },
      ])
    } catch (error) {
      setChatError(error.message || 'The assistant request failed.')
    } finally {
      inputRef.current?.focus()
    }
  }

  const handleClear = () => {
    setMessages([])
    setInput('')
    setChatError('')
    inputRef.current?.focus()
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="aa-ai-page">
      <div className="aa-ai-main">
        <div className="aa-ai-hero">
          <div className="aa-ai-hero__avatar">
            <GeminiSpark />
          </div>
          <div className="aa-ai-hero__title-block">
            <div className="aa-ai-hero__eyebrow">CivicCase Assistant</div>
            <h1 className="aa-ai-hero__title">AI Civic Assistant</h1>
            <p className="aa-ai-hero__subtitle">
              Ask about issues, hotspots, volunteers, and trends. Powered by Gemini and LangGraph.
            </p>
          </div>
          <button
            type="button"
            className="aa-ai-hero__action"
            onClick={handleClear}
            disabled={loading || (!hasMessages && !chatError)}
          >
            Clear chat
          </button>
        </div>

        <div className="aa-ai-stream" ref={streamRef}>
          {!hasMessages && !loading ? (
            <div className="aa-ai-empty">
              <div className="aa-ai-empty__icon">
                <GeminiSpark />
              </div>
              <h2 className="aa-ai-empty__title">How can I help today?</h2>
              <p className="aa-ai-empty__text">
                Pick a starter question or type your own. The assistant has live access to issues, comments, upvotes, and volunteer data.
              </p>
              <div className="aa-ai-prompts">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="aa-ai-prompt"
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`aa-ai-msg aa-ai-msg--${message.role}`}
                >
                  <div className="aa-ai-msg__avatar">
                    {message.role === 'user' ? userInitials : <GeminiSpark />}
                  </div>
                  <div className="aa-ai-msg__bubble">{message.content}</div>
                </div>
              ))}

              {loading ? (
                <div className="aa-ai-msg aa-ai-msg--assistant">
                  <div className="aa-ai-msg__avatar">
                    <GeminiSpark />
                  </div>
                  <div className="aa-ai-msg__bubble">
                    <TypingDots />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {chatError ? <div className="aa-ai-error">{chatError}</div> : null}

        <div className="aa-ai-input-row">
          <textarea
            ref={inputRef}
            className="aa-ai-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask about open issues, trends, neighborhoods, or volunteer needs..."
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            className="aa-ai-send"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Sending' : 'Send'}
          </button>
        </div>
      </div>

      <aside className="aa-ai-side">
        <div className="aa-ai-side__card">
          <h3 className="aa-ai-side__title">
            <span className="aa-ai-side__title-icon">
              <GeminiSpark />
            </span>
            Try asking
          </h3>
          <ul className="aa-ai-side__list">
            {SIDEBAR_TIPS.map((tip) => (
              <li className="aa-ai-side__item" key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="aa-ai-side__brand">Powered by Gemini</div>
        </div>
      </aside>
    </div>
  )
}
