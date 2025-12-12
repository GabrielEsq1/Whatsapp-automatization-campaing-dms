// lib/queue.js
import PQueue from 'p-queue';

const concurrency = parseInt(process.env.CONCURRENCY || '1', 10);
const defaultDelay = parseInt(process.env.SEND_DELAY_MS || '1500', 10);

const queue = new PQueue({ concurrency });

let paused = false;

export function enqueue(fn, delayMs = defaultDelay) {
    // add a small pause between executions to mimic human rhythm
    return queue.add(async () => {
        if (paused) {
            // espera hasta que se reanude
            await new Promise((resolve) => {
                const id = setInterval(() => {
                    if (!paused) {
                        clearInterval(id);
                        resolve();
                    }
                }, 500);
            });
        }

        // Execute task
        const result = await fn();

        // Dynamic delay after task
        await new Promise(r => setTimeout(r, delayMs));
        return result;
    });
}

export function pauseQueue() {
    paused = true;
}

export function resumeQueue() {
    paused = false;
}

export function getQueueSize() {
    return {
        size: queue.size,
        pending: queue.pending,
    };
}
