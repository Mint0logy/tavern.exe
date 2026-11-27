import { createServer, type IncomingMessage } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { ChatMessage } from '@tavern/shared'
import { RunStore } from './run-store.js'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


type PlayerMessageRequest = {
    message: string
}

const brainPath = resolve(dirname(fileURLToPath(import.meta.url)),'../../../packages/brain/build/tavern_brain',)

const runTavernBrain = (npcId: string, message: string): Promise<string> => {
    return new Promise((resolvePromise, reject) => {
        const brain = spawn(brainPath, [], {stdio: ['pipe', 'pipe', 'inherit']})
   
        const chunks: Buffer[] = []

        brain.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
        brain.on('error', reject)
        brain.on('close', code => {
            if (code !== 0){
                reject(new Error(`Brain stopped working with code ${code}`))
                return
            }

            resolvePromise(Buffer.concat(chunks).toString('utf8').trim())
        })
        brain.stdin.end(`${npcId}\n${message}\n`)
    })

}

const runStore = new RunStore()

const isPlayerMessageRequest = (body: unknown): body is PlayerMessageRequest => {
    return (
        body !== null &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        'message' in body &&
        typeof body.message === 'string' &&
        body.message.trim().length > 0
    )
}

const readJsonBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = []

    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk))
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const server = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.statusCode = 200
        res.end('OK')
        return
    }
    if (req.method === 'POST' && req.url === '/api/runs') {
        const run = runStore.createRun()
        res.statusCode = 201
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ run }))
        return
    }
    const messageRoute = req.url?.match(/^\/api\/runs\/([^/]+)\/messages$/)
    if (req.method === 'POST' && messageRoute) {
        const runId = messageRoute[1]
        let body: unknown

        try {
            body = await readJsonBody(req)
        } catch {
            res.statusCode = 400
            res.end('Invalid JSON')
            return
        }

        if (!isPlayerMessageRequest(body)) {
            res.statusCode = 400
            res.end('Invalid message request')
            return
        }

        const run = runStore.getRun(runId)
        if (!run) {
            res.statusCode = 404
            res.end('Run not found')
            return
        }

        const playerMessage: ChatMessage = {
            id: randomUUID(),
            content: body.message.trim(),
            speakerId: run.player.id,
        }

        const added = runStore.addMessage(run.id, playerMessage)
        if (!added) {
            res.statusCode = 500
            res.end('Could not save player message')
            return
        }

        const npc = run.participants.find(participant => participant.id === 'innkeeper')
        if (!npc) {
            res.statusCode = 500
            res.end('Active NPC not found')
            return
        }

        let npcAnswer: string
        try {
            npcAnswer = await runTavernBrain(npc.id, body.message.trim())
        } catch (error) {
            console.error('C++ Tavern Brain cannot handle message', error)
            res.statusCode = 500
            res.end('Brain unavailable')
            return
        }

        const npcMessage: ChatMessage = {
            id: randomUUID(),
            content: npcAnswer,
            speakerId: npc.id,
        }

        const npcMessageAdded = runStore.addMessage(run.id, npcMessage)
        if (!npcMessageAdded) {
            res.statusCode = 500
            res.end('Could not save NPC message')
            return
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ run }))
        return
    }

    res.statusCode = 404
    res.end('Not found')
    return
})


server.listen(3000, () => {
    console.log('Tavern API listening on http://localhost:3000')
})