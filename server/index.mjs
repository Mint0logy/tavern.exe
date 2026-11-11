import { createServer } from "node:http"

function sendError(res, statusCode, message) {
            res.statusCode = statusCode
            res.setHeader("Content-Type", "text/plain; charset=utf-8")
            res.end(message)
}

function handleHealthRequest(_req, res) {
    res.statusCode = 200
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end("OK")
}

function handleNotFound(req, res) {
    res.statusCode = 404
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.end(`Cannot ${req.method} ${req.url}`)
}

function hasValidMessage(body){
    return (
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        typeof body.message === "string" &&
        body.message.trim().length > 0)
}

function handleChatRequest(req, res) {  
    const chunks = []
    req.on("data", (chunk) => { chunks.push(chunk) })
    req.on("end", () => {
        let body
        try {
            body = JSON.parse(Buffer.concat(chunks).toString())
        } catch {
            sendError(res, 400, "Invalid JSON")
            return
        }

        if (!hasValidMessage(body)) {
            sendError(res, 400, "Invalid message")
            return
        }
        
        res.statusCode = 200
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end(`Received: ${body.message}`)
    })
}

function handleRequest(req, res) {
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

server.listen(3000, () =>{
    console.log("Tavern Kitchen Started on http://localhost:3000")
})