import { createServer } from "node:http";

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Hello Tavern Kitchen!");
})

server.listen(3000, () =>{
    console.log("Tavern Kitchen Started on http://localhost:3000")
});