import { randomUUID } from 'node:crypto'
import type { ChatMessage, Run } from '@tavern/shared'
import { RunStore } from './run-store.js'
import { runTavernBrain } from './brain-client.js'
import { brotliDecompressSync } from 'node:zlib'

type SavePlayerMessageResult = {ok: true; run: Run} | {ok: false, reason: 'run-not-found' | 'save-failed'}
type NpcResponseResult = {ok: true} | {ok: false, reason: 'npc-not-found' | 'save-failed'}
type HandlePlayerMessageResult = { ok:true, run: Run } | { ok: false, reason: 'run-not-found' | 'player-save-failed' | 'npc-not-found' | 'npc-save-failed'}

export const savePlayerMessage = (runStore: RunStore, runId: string, content: string): SavePlayerMessageResult => {
    const run = runStore.getRun(runId)
    if (!run) {return {ok: false, reason: 'run-not-found'}}

    const playerMessage: ChatMessage = {
        id: randomUUID(),
        content: content.trim(),
        speakerId: run.player.id,
    }

    if (!runStore.addMessage(runId, playerMessage)){
        return {ok: false, reason: 'save-failed'}
    }

    return {ok:true, run: run}
}

export const respondAsNpc = async (runStore: RunStore, run: Run, content: string, targetNpcId: string): Promise<NpcResponseResult> => {
    const npc = run.participants.find(participant => participant.id === targetNpcId)
    if (!npc) {return {ok: false, reason:'npc-not-found'}}

    let npcAnswer: string
    try {
        npcAnswer = await runTavernBrain(npc.id, content.trim())
    } catch (error) {
        console.error('Brain not braining right now: ',error)
        npcAnswer = 'Nie dosłyszałem, powtórz — straszny tu hałas.'
    }

    const npcMessage: ChatMessage = {
        id: randomUUID(),
        content:npcAnswer,
        speakerId: npc.id,
    }

    if (!runStore.addMessage(run.id, npcMessage)){
        return { ok: false, reason: 'save-failed'}
    }
    return { ok: true }
}

export const handlePlayerMessage = async (runStore: RunStore, runId: string, content: string): Promise<HandlePlayerMessageResult> => {
    const playerResult = await savePlayerMessage(runStore, runId, content)
    if(!playerResult.ok){
        if(playerResult.reason === 'run-not-found'){
            return { ok: false, reason: 'run-not-found'}
        }
        return { ok: false, reason: 'player-save-failed' }     
    }
    const run = playerResult.run
    const npcResult = await respondAsNpc(runStore, run, content, 'innkeeper')

    if (!npcResult.ok){
        if (npcResult.reason === 'npc-not-found'){
            return {ok: false, reason: 'npc-not-found'}
        }
        return { ok: false, reason: 'npc-save-failed'}
    }
    return { ok: true, run}
}