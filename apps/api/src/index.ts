import { randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

type ChatRequestBody = {
    message: string
    conversationId: string
}

type NpcProfile = {
    id: string
    displayName: string
}

type Conversation = {
    npc: NpcProfile
}

type StartConversationBody = {
    npcId: string
}

const npcProfiles = new Map<string, NpcProfile>([
    ["innkeeper", { id: "innkeeper", displayName: "Karczmarz" }],
])
const conversations = new Map<string, Conversation>()

const brainPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../packages/brain/build/tavern_brain",
)

function sendError(res: ServerResponse, statusCode: number, message: string): void {
    res.statusCode = statusCode
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end(message)
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
    res.statusCode = statusCode
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.end(JSON.stringify(body))
}

function handleHealthRequest(_req: IncomingMessage, res: ServerResponse): void {
    res.statusCode = 200
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end("OK")
}

function handleNotFound(req: IncomingMessage, res: ServerResponse): void {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end(`Cannot ${req.method} ${req.url}`)
}

function hasValidChatRequest(body: unknown): body is ChatRequestBody {
    return (
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message.trim().length > 0 &&
        "conversationId" in body &&
        typeof body.conversationId === "string" &&
        body.conversationId.trim().length > 0
    )
}

function hasNpcId(body: unknown): body is StartConversationBody {
    return (
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        "npcId" in body &&
        typeof body.npcId === "string" &&
        body.npcId.trim().length > 0
    )
}

function handleStartConversation(req: IncomingMessage, res: ServerResponse): void {
    const chunks: Buffer[] = []

    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", () => {
        let body: unknown

        try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
        } catch {
            sendError(res, 400, "Invalid JSON")
            return
        }

        if (!hasNpcId(body)) {
            sendError(res, 400, "Invalid NPC")
            return
        }

        const npc = npcProfiles.get(body.npcId)
        if (!npc) {
            sendError(res, 400, "Unknown NPC")
            return
        }

        const conversationId = randomUUID()
        conversations.set(conversationId, { npc })

        sendJson(res, 200, { conversationId, npc })
    })
}

function runTavernBrain(npcId: string, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const brain = spawn(brainPath, [], {
            stdio: ["pipe", "pipe", "inherit"],
        })
        const chunks: Buffer[] = []

        brain.stdout.on("data", (chunk: Buffer) => chunks.push(chunk))
        brain.on("error", reject)
        brain.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Brain stopped with code ${code}`))
                return
            }

            resolve(Buffer.concat(chunks).toString("utf8"))
        })

        brain.stdin.end(`${npcId}\n${message}\n`)
    })
}

function handleChatRequest(req: IncomingMessage, res: ServerResponse): void {
    const chunks: Buffer[] = []

    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", async () => {
        let body: unknown

        try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
        } catch {
            sendError(res, 400, "Invalid JSON")
            return
        }

        if (!hasValidChatRequest(body)) {
            sendError(res, 400, "Invalid message")
            return
        }

        const conversation = conversations.get(body.conversationId)
        if (!conversation) {
            sendError(res, 404, "Conversation not found")
            return
        }

        try {
            const message = await runTavernBrain(conversation.npc.id, body.message)
            sendJson(res, 200, { message, npc: conversation.npc })
        } catch (error) {
            console.error("C++ Tavern Brain cannot handle message", error)
            sendError(res, 500, "Brain unavailable")
        }
    })
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
    if (req.method === "GET" && req.url === "/health") {
        handleHealthRequest(req, res)
        return
    }

    if (req.method === "POST" && req.url === "/api/chat") {
        handleChatRequest(req, res)
        return
    }

    if (req.method === "POST" && req.url === "/api/conversations") {
        handleStartConversation(req, res)
        return
    }

    handleNotFound(req, res)
}

const server = createServer(handleRequest)

server.listen(3000, () => {
  console.log("Tavern Kitchen Started on http://localhost:3000")
})