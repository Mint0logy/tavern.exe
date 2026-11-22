import styled from 'styled-components'
import { useState } from 'react'
import type { ChatMessage, Character} from '@tavern/shared'
import Logo from './components/Logo'
import CharacterSheet from './components/CharacterSheet'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'



const App = () =>{
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      content: 'Witaj w karczmie, wędrowcze!',
      speakerId: "Innkeeper"
    }
  ])
  
  const handleSendMessage = (content: string) => {
    const playerMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      speakerId: 'player',
    }

    setMessages(previousMessages => [...previousMessages, playerMessage])
  }


  //TEST - Remove later:

  const participants: Character[] = [
    {
        id: 'player',
        kind: 'player',
        displayName: 'Ty',
        hp: 20,
        maxHp: 20,
        level: 1,
        experience: 0,
    },
    {
        id: 'innkeeper',
        kind: 'npc',
        displayName: 'Karczmarz',
        hp: 40,
        maxHp: 40,
        level: 1,
        experience: 0,
    },
]

  return (
    <AppLayout>
      <Logo/>
      <CharacterSheet/>
      <ChatWindow messages={messages} participants={participants}/>
      <ChatInput onSendMessage={handleSendMessage}/>
    </AppLayout>
  )
}
export default App

const AppLayout = styled.main`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 70%;
    height: 100dvh;
    margin-inline: auto;
    padding: 1rem 0;

    @media (max-width: 700px) {
        width: calc(100% - 1.5rem);
    }
`