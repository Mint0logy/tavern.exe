import { randomUUID } from 'node:crypto'
import type { Character, Run, ChatMessage } from '@tavern/shared'

export class RunStore {
    private readonly runs = new Map<string, Run>()

    createRun(): Run {
        const player: Character = {
            id: 'player',
            kind: 'player',
            displayName: 'Ty',
            hp: 20,
            maxHp: 20,
            level: 1,
            experience: 0
        } 

        const run: Run = {
            id: randomUUID(),
            player: player,
            participants: [
                player,
                {
                    id: 'innkeeper',
                    kind: 'npc',
                    displayName: 'Karczmarz',
                    hp: 40,
                    maxHp: 40,
                    level: 1,
                    experience: 0,
                },
            ],
            messages: [
                {
                    id: randomUUID(),
                    content: 'Witaj w karczmie, wędrowcze!',
                    speakerId: 'innkeeper',
                },
            ],
            sceneMode: 'dialogue',
        }

        this.runs.set(run.id, run)
        return run
    }
    
    getRun(id: string): Run | undefined {
        return this.runs.get(id)
    }

    addParticipant(runId: string, character: Character): boolean {
       const run = this.getRun(runId)
       if (!run) return false
       if (run.participants.some(participant => participant.id === character.id)) return false

       run.participants.push(character)
       return true
    }

    removeParticipant(runId: string, characterId: string): boolean {
        const run = this.getRun(runId)
        if (!run) return false 

        if (characterId === run.player.id) return false

        const participantIndex = run.participants.findIndex(participant => participant.id === characterId)

        if (participantIndex === -1) return false

        run.participants.splice(participantIndex, 1)
        return true
    }

    addMessage(runId: string, message: ChatMessage): boolean {
        const run = this.getRun(runId)
        if (!run) return false
        if (!(run.participants.some(participant => participant.id === message.speakerId))) return false

        run.messages.push(message)
        return true
    }
}