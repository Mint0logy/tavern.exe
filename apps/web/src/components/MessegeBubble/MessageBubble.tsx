import "./MessageBubble.css"
import type { Message } from "../../App"

const MessageBubble = (message: Message) => {
    return (
    <div key={message.id} className={`message message_${message.sender}`}>
        <span className="message_display_name">
            {message.sender === 'player' ? 'Ty' : 'Karczmarz'}
        </span>
        <p>{message.content}</p>
    </div>)
}
export default MessageBubble