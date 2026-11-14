import type { Message } from '../../App'
import MessageBubble from '../MessageBubble/MessageBubble'
import './Chat.css'

const Chat = (props: { messages: Message[] }) => {
  return (
    <section className="chat_section" aria-label="Chat">
      <div className="chat_window" role="log" aria-label="Chat history">
        {props.messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </section>
  )
}

export default Chat