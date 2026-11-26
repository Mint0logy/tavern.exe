import type { Run } from '@tavern/shared'

export const startRun = async (): Promise<Run> => {
    const response = await fetch('/api/runs', { method: 'POST' })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    const body = await response.json() as { run: Run }
    return body.run
}

export const sendDialogue = async (
    runId: string,
    message: string,
): Promise<Run> => {
    const response = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, message }),
    })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    const body = await response.json() as { run: Run }
    return body.run
}
