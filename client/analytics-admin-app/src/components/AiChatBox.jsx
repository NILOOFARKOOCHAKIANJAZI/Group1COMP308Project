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
      <div className="card p-3">
        <h5>AI Chat Box</h5>

        <div style={{ height: '300px', overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <p key={i}>
              <strong>{msg.role}:</strong> {msg.content}
            </p>
          ))}
        </div>

        <div className="d-flex mt-3">
          <input
            className="form-control me-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}