import type { Run } from '@tavern/shared'

export const startRun = async (): Promise<Run> => {
    const response = await fetch('/api/runs', { method: 'POST' })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    const body = await response.json() as { run: Run }
    return body.run
}

export const sendMessage = async (
    runId: string,
    message: string,
): Promise<Run> => {
    const response = await fetch(`/api/runs/${encodeURIComponent(runId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    const body = await response.json() as { run: Run }
    return body.run
}
