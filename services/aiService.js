const axios = require('axios');
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

/**
 * Generates a response using Llama 3 via Hugging Face Inference API.
 * @param {Array} history - Chat history [{role: 'user'|'assistant', content: '...'}]
 * @param {String} systemInstruction - Instructions for the AI persona.
 */
async function generateResponse(history, systemInstruction) {
    if (!HF_TOKEN) {
        console.warn('⚠️ No HUGGINGFACE_API_KEY found. Using fallback text.');
        return fallbackResponse(history);
    }

    try {
        const formattedPrompt = buildLlamaPrompt(history, systemInstruction);

        console.log('AI Prompt Size:', formattedPrompt.length);

        const r = await axios.post(
            'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
            {
                inputs: formattedPrompt,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false,
                    stop: ['<|eot_id|>']
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        let text = r.data?.[0]?.generated_text?.trim();
        // Cleanup if any artifacts remain
        text = text.replace(/^"|"$/g, '').replace(/<\|.*?\|>/g, '');
        return text || fallbackResponse(history);

    } catch (e) {
        console.error('AI Gen Failed:', e.response?.data || e.message);
        return fallbackResponse(history);
    }
}

function buildLlamaPrompt(history, system) {
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${system}<|eot_id|>`;

    history.forEach(msg => {
        prompt += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    });

    prompt += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
    return prompt;
}

function fallbackResponse(history) {
    const last = history[history.length - 1];
    if (last.role === 'assistant') return '...';
    // basic rotatory fallback
    const greetings = ['Hola! 👋', 'Hola, qué tal?', 'Buenas!', 'Hola, cómo vas?'];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

module.exports = { generateResponse };
