import { useState } from 'react'
import Chat from './components/Chat/Chat'
import Logo from './components/Logo/Logo'
import MessageInput from './components/MessageInput/MessageInput'
import './App.css'

export type Message = {
  id: string
  content: string
  sender: 'player' | 'npc'
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Witaj w karczmie, wędrowcze!', sender: 'npc' },
  ])

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'player',
    }

    setMessages(prev => [...prev, newMessage])
  }

  return (
    <main className="app">
      <Logo />
      <Chat messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </main>
  )
}

export default App