import { createServer, type IncomingMessage } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { ChatMessage } from '@tavern/shared'
import { RunStore } from './run-store.js'
import { runTavernBrain } from './brain-client.js'
import { savePlayerMessage, respondAsNpc, handlePlayerMessage } from './message-service.js'

type PlayerMessageRequest = {
    message: string
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

        const result = await handlePlayerMessage(runStore, runId, body.message)
        if (!result.ok){
            if (result.reason === 'run-not-found'){
                res.statusCode = 404
                res.end('Run not found')
            }
            else {
                res.statusCode = 500

                if (result.reason === 'player-save-failed') res.end('Could not save player msg')
                if (result.reason === 'npc-not-found') res.end('There is no NPC with that name')
                if (result.reason === 'npc-save-failed') res.end('Could not save NPC msg' )
            }
            return
        }

        const run = result.run
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