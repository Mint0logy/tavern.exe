import './MessageBubble.css'
import type { Message } from '../../App'

const MessageBubble = (props: { message: Message }) => {
  return (
    <div className={`message message_${props.message.sender}`}>
      <span className="message_display_name">
        {props.message.sender === 'player' ? 'Ty' : 'Karczmarz'}
      </span>
      <p>{props.message.content}</p>
    </div>
  )
}

export default MessageBubble