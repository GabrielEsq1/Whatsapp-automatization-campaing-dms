// services/variationService.js
import axios from 'axios';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

/**
 * generateVariation: si hay OPENAI_API_KEY usa la API para reescribir el mensaje;
 * si no, hace un reemplazo simple de sinónimos (fallback).
 */
export async function generateVariation(message, context = '') {
    if (!message) return message;

    if (OPENAI_KEY) {
        try {
            const prompt = `Reescribe el siguiente mensaje manteniendo el mismo sentido, usando sinónimos y variando la estructura para que parezca un mensaje humano distinto. Devuelve solamente el mensaje final en español.\n\nMensaje: """${message}"""\n\nContexto: ${context}\n\nVersión:`;
            const r = await axios.post('https://api.openai.com/v1/completions', {
                model: "text-davinci-003",
                prompt,
                max_tokens: 180,
                temperature: 0.8,
                n: 1,
                stop: null
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const text = r.data?.choices?.[0]?.text?.trim();
            if (text) return text;
        } catch (e) {
            console.warn('OpenAI variation failed, falling back:', e.message);
            // fallback below
        }
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
