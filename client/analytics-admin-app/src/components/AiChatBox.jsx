import { gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'
import { useState } from 'react'

const GET_CHAT_MESSAGES = gql`
  query Chatbot($question: [MessageInput!]!) {
    chatbotQuery(question: $question) {
      text
      success
      message
    }
  }
`

export default function AiChatBox() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const [sendQuery, { loading }] = useLazyQuery(GET_CHAT_MESSAGES)

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages = [
      ...messages,
      { role: 'user', content: input }
    ]

    setMessages(newMessages)

    const { data } = await sendQuery({
      variables: {
        question: newMessages
      }
    })

    if (data?.chatbotQuery?.text) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.chatbotQuery.text }
      ])
    }

    setInput('')
  }

 return (
    <div className="container mt-5">
      <div className="card shadow mx-auto" style={{ maxWidth: '400px' }}>
        
        {/* Clickable Header */}
        <div 
          className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3"
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <div className="d-flex align-items-center">
            <h6 className="mb-0">AI Assistant</h6>
          </div>
          <div className="d-flex align-items-center">
            {loading && <div className="spinner-border spinner-border-sm me-2" role="status"></div>}
            {/* Visual indicator for toggle */}
            <span>{isOpen ? '−' : '＋'}</span>
          </div>
        </div>

        {/* Collapsible Section */}
        {isOpen && (
          <>
            <div 
              className="card-body bg-light" 
              style={{ height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
            >
              {messages.length === 0 && (
                <div className="text-center text-muted my-auto small">
                  <p>Ask me anything!</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`mb-3 d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div 
                    className={`p-2 px-3 rounded-3 shadow-sm ${
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-dark'
                    }`}
                    style={{ maxWidth: '85%', fontSize: '0.9rem' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer bg-white border-top-0 py-3">
              <div className="input-group input-group-sm">
                <input
                  className="form-control shadow-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}