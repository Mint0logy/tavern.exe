import type { Message } from '../../App'
import MessageBubble from '../MessegeBubble/MessageBubble'
import "./Chat.css"

type ChatProps = {
    messages: Message[],
}

const Chat = ({ messages }: ChatProps) => {
    return (<section>
        <div className="ChatWindow" role="log" aria-label="Chat history">
            {messages.map(message => (MessageBubble(message)))}
        </div>
    </section>)
}

export default Chat