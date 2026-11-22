export type CharacterKind = 'player' | 'npc'
export type SceneMode = 'dialogue' | 'event'

export type ChatMessage = {
    id: string
    content: string
    speakerId: string
}

export type Character = {
    id: string
    kind: CharacterKind
    displayName: string
    hp: number
    maxHp: number
    level: number
    experience: number
}

export type NpcCharacter = Character & {
    kind: 'npc'
    profile: {
        role: string
        personality: string
    }
}

export type PlayerCharacter = Character & {
    kind: 'player'
    inventory: string[]
}

export type Participant = {
    characterId: string
    displayName: string
    kind: CharacterKind
}

export type Run = {
    id: string
    player: Character
    participants: Character[]
    messages: ChatMessage[]
    sceneMode: SceneMode
}