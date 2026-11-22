import styled from 'styled-components'
import type { Character, ChatMessage } from '@tavern/shared'

type ChatWindowProps = {
    messages: ChatMessage[]
    participants: Character[]
}

const ChatWindow = ({ messages, participants }: ChatWindowProps) => (
    <ChatContainer aria-label='Chat window'>
        <MessageLog role='log' aria-live='polite'>
            {messages.map(message => (
                <ChatBubble
                    key={message.id}
                    message={message}
                    participants={participants}
                />
            ))}
        </MessageLog>
    </ChatContainer>
)

type ChatBubbleProps = {
    message: ChatMessage
    participants: Character[]
}

const ChatBubble = ({ message, participants }: ChatBubbleProps) => {
    const speaker = participants.find(
        participant => participant.id === message.speakerId,
    )

    return (
        <Bubble $speakerKind={speaker?.kind ?? 'npc'}>
            <strong>{speaker?.displayName ?? message.speakerId}</strong>
            <p>{message.content}</p>
        </Bubble>
    )
}
export default ChatWindow


// Styled components:

const ChatContainer = styled.section`
    display: flex;
    flex: 1;
    flex-direction: column;
`
const MessageLog = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    gap: 0.75rem;
    overflow-y: auto
`
const Bubble = styled.div<{ $speakerKind: Character['kind'] }>`
    align-self: ${({$speakerKind}) => $speakerKind === 'player' ? 'flex-end':'flex-start' };
    max-width: min(80%, 48rem);
    width: fit-content;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background-color: ${({$speakerKind})=> $speakerKind === 'player' ? 'var(--color-player)':'var(--color-npc)'};
`