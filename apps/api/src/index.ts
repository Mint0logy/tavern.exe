import { spawn } from "node:child_process"
import { createServer } from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

type ChatRequestBody = {
    message: string
}

const brainPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../packages/brain/build/tavern_brain",
)

function sendError(res: ServerResponse, statusCode: number, message: string): void {
    res.statusCode = statusCode
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end(message)
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

function hasValidMessage(body: unknown): body is ChatRequestBody {
    return (
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message.trim().length > 0
    )
}

function runTavernBrain(message: string): Promise<string> {
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

        brain.stdin.end(`${message}\n`)
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

        if (!hasValidMessage(body)) {
            sendError(res, 400, "Invalid message")
            return
        }

        try {
            const response = await runTavernBrain(body.message)
            res.statusCode = 200
            res.setHeader("Content-Type", "text/plain; charset=utf-8")
            res.end(response)
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

    handleNotFound(req, res)
}

const server = createServer(handleRequest)

server.listen(3000, () => {
  console.log("Tavern Kitchen Started on http://localhost:3000")
})