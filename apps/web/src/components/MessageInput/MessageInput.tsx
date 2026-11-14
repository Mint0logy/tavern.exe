import { useState } from 'react'
import type { SubmitEvent } from 'react'
import './MessageInput.css'

const MessageInput = (props: {
  onSendMessage: (message: string) => void | Promise<void>
  disabled?: boolean
}) => {
  const [input, setInput] = useState('')

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = input.trim()
    if (!message) return

    props.onSendMessage(message)
    setInput('')
  }

  return (
    <section className="message_input_section" aria-label="Message input">
      <form className="message_input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          disabled={props.disabled}
          onChange={event => setInput(event.target.value)}
          placeholder="Napisz wiadomość..."
          aria-label="Wiadomość do karczmarza"
        />
        <button type="submit" disabled={props.disabled || !input.trim()}>Wyślij</button>
      </form>
    </section>
  )
}

export default MessageInput
