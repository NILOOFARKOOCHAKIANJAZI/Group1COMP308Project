import { useEffect, useMemo, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { CHATBOT_QUERY } from '../graphql/queries'

const starterPrompts = [
  'Show open flooding issues.',
  'Which neighborhoods need the most attention?',
  'Find issues without volunteers.',
  'Summarize recent community issue trends.',
]

export default function AiChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [chatError, setChatError] = useState('')

  const messageContainerRef = useRef(null)

  const [sendQuery, { loading }] = useLazyQuery(CHATBOT_QUERY, {
    fetchPolicy: 'no-cache',
  })

  const hasMessages = useMemo(() => messages.length > 0, [messages])

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (overrideText = '') => {
    const textToSend = (overrideText || input).trim()

    if (!textToSend || loading) {
      return
    }

    setChatError('')

    const nextMessages = [...messages, { role: 'user', content: textToSend }]
    setMessages(nextMessages)

    try {
      const { data } = await sendQuery({
        variables: {
          question: nextMessages,
        },
      })

      const payload = data?.chatbotQuery

      if (!payload?.success) {
        throw new Error(payload?.message || 'The chatbot could not process your request.')
      }

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: payload.text || 'No response was returned.',
        },
      ])
    } catch (error) {
      setChatError(error.message || 'The chatbot request failed.')
    } finally {
      setInput('')
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
    setChatError('')
  }

  return (
    <section className="panel-card panel-card-wide">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agentic chatbot</p>
          <h2>AI Civic Assistant</h2>
        </div>
      </div>

      <p className="chat-helper">
        Ask about open issues, volunteer gaps, neighborhoods that need attention, or general civic
        trends.
      </p>

      {!hasMessages ? (
        <div className="starter-prompts">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="starter-prompt-btn"
              onClick={() => handleSend(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="chat-messages" ref={messageContainerRef}>
        {!hasMessages ? (
          <div className="empty-chat-state">
            <p>No messages yet.</p>
            <small>Start with one of the suggested prompts or ask your own question.</small>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`chat-row ${message.role === 'user' ? 'chat-row-user' : 'chat-row-assistant'}`}
          >
            <div
              className={`chat-bubble ${
                message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {chatError ? <div className="panel-error">{chatError}</div> : null}

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask about open issues, trends, or volunteer needs..."
        />

        <button
          type="button"
          className="panel-primary-btn"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>

        <button
          type="button"
          className="panel-secondary-btn"
          onClick={handleReset}
          disabled={loading && !hasMessages}
        >
          Reset
        </button>
      </div>
    </section>
  )
}