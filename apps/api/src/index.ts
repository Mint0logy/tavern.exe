import { createServer, type IncomingMessage } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { ChatMessage } from '@tavern/shared'
import { RunStore } from './run-store.js'

type DialogueRequest = {
    runId: string
    message: string
}

const runStore = new RunStore()

const isDialogueRequest = (body: unknown): body is DialogueRequest => {
    return (
        body !== null &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        'runId' in body &&
        typeof body.runId === 'string' &&
        body.runId.trim().length > 0 &&
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
    if (req.method === 'POST' && req.url === '/api/dialogue') {
        let body: unknown

        try {
            body = await readJsonBody(req)
        } catch {
            res.statusCode = 400
            res.end('Invalid JSON')
            return
        }

        if (!isDialogueRequest(body)) {
            res.statusCode = 400
            res.end('Invalid dialogue request')
            return
        }

        const run = runStore.getRun(body.runId)
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