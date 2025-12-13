// services/variationService.js
import axios from 'axios';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

/**
 * generateVariation: Usa HF (Llama), OpenAI o Fallback
 */
export async function generateVariation(message, context = '') {
    if (!message) return message;

    // 1. Hugging Face (Llama-3) - PREFERRED
    if (HF_TOKEN) {
        try {
            const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\nGenera una variación de este mensaje de WhatsApp manteniendo el mismo significado pero cambiando palabras para evitar spam. Solo devuelve el mensaje.\n\nMensaje Original: "${message}"<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

            const r = await axios.post('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
                { inputs: prompt, parameters: { max_new_tokens: 200, temperature: 0.9, return_full_text: false } },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` } });

            const text = r.data?.[0]?.generated_text?.trim();
            if (text) return text.replace(/"/g, '');
        } catch (e) {
            console.warn('HF variation failed:', e.message);
        }
    }

    // 2. OpenAI (Legacy)
    if (OPENAI_KEY) {
        try {
            // ... (keep existing openai logic structure if needed, or simplified)
            const r = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Reescribe este mensaje para WhatsApp evitando spam: "${message}"` }],
            }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });

            const text = r.data?.choices?.[0]?.message?.content?.trim();
            if (text) return text;
        } catch (e) { console.warn('OpenAI failed:', e.message); }
    }

    // Simple fallback: reemplazos básicos
    const synonyms = {
        'hola': ['hola', 'buenas', 'buen día'],
        'oferta': ['promoción', 'oportunidad', 'descuento'],
        'contacto': ['mensaje', 'comunicación', 'aviso'],
        'gracias': ['gracias', 'mil gracias', 'te lo agradezco'],
        'agenda': ['calendario', 'hora', 'cita']
    };

    let out = message;
    Object.keys(synonyms).forEach(key => {
        const re = new RegExp(`\\b${key}\\b`, 'ig');
        const choices = synonyms[key];
        out = out.replace(re, () => choices[Math.floor(Math.random() * choices.length)]);
    });

    // small shuffle: move a clause to the end sometimes
    if (Math.random() > 0.7) {
        const parts = out.split(',');
        if (parts.length > 1) {
            const p = parts.shift();
            parts.push(p);
            out = parts.join(',').trim();
        }
    }

    return out;
}
