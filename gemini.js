import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Using a more stable model by default. 
// gemini-2.0-flash is fast, free-tier friendly, and very stable.
const MODEL_NAME = 'gemini-2.5-flash-lite';

// Simple in-memory storage for conversation history
// In a production app, you'd use a database.
const historyMap = new Map();

/**
 * Gets or initializes the history for a specific user
 * @param {string} jid WhatsApp ID
 * @returns {Array} Array of message objects
 */
function getHistory(jid) {
    if (!historyMap.has(jid)) {
        historyMap.set(jid, []);
    }
    return historyMap.get(jid);
}

/**
 * Adds a message to the history and trims it to keep context short
 */
function addToHistory(jid, role, text) {
    const history = getHistory(jid);
    history.push({ role, parts: [{ text }] });

    // Keep only the last 10 messages to avoid hitting token limits
    if (history.length > 10) {
        history.shift();
    }
}

export async function askGemini(jid, prompt, mimes = []) {
    try {
        const history = getHistory(jid);

        // Prepare parts for the current message
        const currentParts = [{ text: prompt }];

        // Add images if any
        mimes.forEach(m => {
            currentParts.push({
                inlineData: {
                    mimeType: m.mimeType,
                    data: m.data // base64 string
                }
            });
        });

        // The @google/genai SDK uses client.models.generateContent
        // We pass the history + the current user message
        const contents = [
            ...history,
            {
                role: 'user',
                parts: currentParts
            }
        ];

        const result = await client.models.generateContent({
            model: MODEL_NAME,
            contents,
            config: {
                systemInstruction: "You are 'Study-It', a helpful and encouraging educational WhatsApp bot. Your goal is to help students with their homework and questions. Explain concepts clearly and step-by-step. If an image is provided, analyze it carefully to solve the problem or explain the content.",
                maxOutputTokens: 2048,
            }
        });

        const responseText = result.text;

        // Save to history after successful response
        addToHistory(jid, 'user', prompt);
        addToHistory(jid, 'model', responseText);

        return responseText;
    } catch (error) {
        console.error('Error in askGemini:', error);

        if (error.message?.includes('503')) {
            return "The AI is currently overloaded. Please try again in a few seconds!";
        }

        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return "System Error: The AI model name might be incorrect. Please check gemini.js.";
        }

        return "I'm sorry, I'm having trouble thinking right now. Please try again later!";
    }
}
