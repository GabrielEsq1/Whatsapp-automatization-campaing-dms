const axios = require('axios');

// Support both naming conventions
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
// Use a specific Space URL if provided (e.g., https://my-space.hf.space/v1), otherwise default to Router
const ROUTER_URL = process.env.HF_SPACE_URL || "https://router.huggingface.co/v1";

// Models
const TEXT_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"; // Or "moonshotai/Kimi-K2-Instruct-0905" if preferred
const IMAGE_MODEL = "black-forest-labs/FLUX.1-dev";

/**
 * Generates text response using HF Inference Router (OpenAI Compatible Endpoint)
 */
async function generateResponse(history, systemInstruction) {
    if (!HF_TOKEN) {
        console.warn('⚠️ No HF_TOKEN found. Using fallback text.');
        return fallbackResponse(history);
    }

    try {
        // Prepare messages in OpenAI format
        const messages = [
            { role: "system", content: systemInstruction },
            ...history
        ];

        console.log(`🤖 AI Request to ${TEXT_MODEL}`);

        const r = await axios.post(
            `${ROUTER_URL}/chat/completions`,
            {
                model: TEXT_MODEL,
                messages: messages,
                max_tokens: 200, // equivalent to max_new_tokens
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return r.data?.choices?.[0]?.message?.content?.trim() || fallbackResponse(history);

    } catch (e) {
        console.error('AI Gen Failed:', e.response?.data || e.message);
        return fallbackResponse(history);
    }
}

/**
 * Generates an image using HF Inference Router
 * Returns a base64 string or URL (depending on API response, usually blob)
 * Note: Node.js axios responseType: 'arraybuffer' needed for images.
 */
async function generateImage(prompt) {
    if (!HF_TOKEN) return null;

    try {
        console.log(`🎨 Generating Image with ${IMAGE_MODEL}`);
        const r = await axios.post(
            `https://api-inference.huggingface.co/models/${IMAGE_MODEL}`,
            { inputs: prompt },
            {
                headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
                responseType: 'arraybuffer'
            }
        );

        // Convert buffer to base64 for easy usage/saving
        const base64 = Buffer.from(r.data, 'binary').toString('base64');
        return `data:image/jpeg;base64,${base64}`;

    } catch (e) {
        console.error('Image Gen Failed:', e.message);
        return null;
    }
}

function fallbackResponse(history) {
    const last = history[history.length - 1];
    if (last?.role === 'assistant') return '...';
    const greetings = ['Hola! 👋', 'Hola, qué tal?', 'Buenas!', 'Hola, cómo vas?'];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

module.exports = { generateResponse, generateImage };
