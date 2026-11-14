import { useState } from 'react'
import Chat from './components/Chat/Chat'
import Logo from './components/Logo/Logo'
import MessageInput from './components/MessageInput/MessageInput'
import './App.css'

export type Message = {
  id: string
  content: string
  sender: 'player' | 'npc'
  displayName?: string
}

type ConversationResponse = {
  conversationId: string
}

type ChatResponse = {
  message: string
  npc: {
    id: string
    displayName: string
  }
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Witaj w karczmie, wędrowcze!', sender: 'npc' },
  ])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    const newPlayerMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'player',
    }

    setMessages(prev => [...prev, newPlayerMessage])
    setError(null)
    setIsSending(true)

    try {
      let activeConversationId = conversationId

      if (!activeConversationId) {
        const startResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ npcId: 'innkeeper' }),
        })
        const startBody = await startResponse.text()
        if (!startResponse.ok) throw new Error(startBody)

        const conversation: ConversationResponse = JSON.parse(startBody)
        activeConversationId = conversation.conversationId
        setConversationId(activeConversationId)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newPlayerMessage.content,
          conversationId: activeConversationId,
        }),
      })
      const responseBody = await response.text()
      if (!response.ok) throw new Error(responseBody)

      const answer: ChatResponse = JSON.parse(responseBody)
      const newBrainMessage: Message = {
        id: crypto.randomUUID(),
        content: answer.message,
        sender: 'npc',
        displayName: answer.npc.displayName,
      }

      setMessages(prev => [...prev, newBrainMessage])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app">
      <Logo />
      <Chat messages={messages} />
      {error && <p role="alert">{error}</p>}
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
    </main>
  )
}

export default App