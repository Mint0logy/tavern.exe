import styled from 'styled-components'
import { useState } from 'react'
import type { Run } from '@tavern/shared'
import { sendMessage, startRun } from './api'
import Logo from './components/Logo'
import CharacterSheet from './components/CharacterSheet'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'

const App = () => {
  const [run, setRun] = useState<Run | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartRun = async () => {
    setError(null)
    setIsStarting(true)

    try {
      setRun(await startRun())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się rozpocząć gry')
    } finally {
      setIsStarting(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!run) return

    setError(null)
    setIsSending(true)

    try {
      setRun(await sendMessage(run.id, content))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AppLayout>
      <Logo />
      <CharacterSheet />
      {run ? (
        <>
          <ChatWindow messages={run.messages} participants={run.participants} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
        </>
      ) : (
        <StartButton
          type='button'
          onClick={handleStartRun}
          disabled={isStarting}
        >
          {isStarting ? 'Przygotowuję rozgrywkę...' : 'Wyrusz w drogę...'}
        </StartButton>
      )}
      {error && <ErrorMessage role='alert'>{error}</ErrorMessage>}
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

const StartButton = styled.button`
    align-self: center;
    padding: 0.75rem 1.25rem;
    border: 0;
    border-radius: 0.75rem;
    background-color: var(--color-accent);
    color: var(--color-button-text);
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: wait;
    }
`

const ErrorMessage = styled.p`
    margin: 0;
    color: var(--color-text);
`