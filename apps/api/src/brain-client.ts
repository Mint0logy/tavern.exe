import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const brainPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/brain/build/tavern_brain',)

export const runTavernBrain = (npcId: string, message: string,): Promise<string> => {
    return new Promise((resolvePromise, reject) => {
        const brain = spawn(brainPath, [], {stdio: ['pipe', 'pipe', 'inherit'],})

        const chunks: Buffer[] = []

        brain.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
        brain.on('error', reject)
        brain.on('close', code => {
            if (code !== 0) {
                reject(new Error(`Brain stopped woring with code ${code}`))
                return
            }
            resolvePromise(Buffer.concat(chunks).toString('utf8').trim())
        })
        brain.stdin.end(`${npcId}\n${message}\n`)
    })
}