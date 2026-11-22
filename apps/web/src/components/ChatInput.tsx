import { useState } from 'react'
import styled from 'styled-components'
import type { SubmitEvent } from 'react'

type ChatInputProps = {
    onSendMessage: (message: string) => void
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
    const [inputFieldContent, setInputFiledContent] = useState('')

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()

        const message = inputFieldContent.trim()
        if (message) onSendMessage(message)
        setInputFiledContent('')
    }

    return (
        <InputForm onSubmit={handleSubmit}>
            <MessageField
                value={inputFieldContent}
                onChange={event => setInputFiledContent(event.target.value)}
                placeholder='Napisz swoją wiadomość'
                aria-label='Wiadomość do NPC'
            />
            <SendButton
                type='submit'
                disabled={!inputFieldContent.trim()}
            >
                Wyślij
            </SendButton>
        </InputForm>
    )
}

export default ChatInput


const InputForm = styled.form`
    display: flex;
    gap: 0.625rem;
    width: 100%;
`

const MessageField = styled.input`
    flex: 1;
    min-width: 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background-color: var(--color-surface);
    color: var(--color-text);
    outline: none;

    &:focus-visible {
        border-color: var(--color-focus);
    }

    &::placeholder {
        color: var(--color-muted);
    }
`

const SendButton = styled.button`
    flex: 0 0 auto;
    min-width: 5rem;
    padding: 0.75rem 1rem;
    border: 0;
    border-radius: 0.75rem;
    background-color: var(--color-accent);
    color: var(--color-button-text);
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`