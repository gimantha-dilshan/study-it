import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getChatHistory, saveMessage } from './database.js';

dotenv.config();

// Initialize two separate clients for high availability
const primaryClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const backupClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY });

const PRIMARY_MODEL = 'gemini-2.5-flash';
const SECONDARY_MODEL = 'gemini-2.5-flash-lite';

export async function askGemini(jid, prompt, mimes = [], modelChoice = PRIMARY_MODEL, useBackupKey = false) {
    const activeClient = useBackupKey ? backupClient : primaryClient;

    try {
        const history = await getChatHistory(jid, 10);
        const currentParts = [{ text: prompt }];

        mimes.forEach(m => {
            currentParts.push({
                inlineData: {
                    mimeType: m.mimeType,
                    data: m.data 
                }
            });
        });

        const contents = [...history, { role: 'user', parts: currentParts }];

        console.log(`Asking Gemini [Model: ${modelChoice} | Key: ${useBackupKey ? 'BACKUP' : 'PRIMARY'}]...`);
        
        const result = await activeClient.models.generateContent({
            model: modelChoice,
            contents: contents,
            config: {
                systemInstruction: `You are 'Study-It', a friendly, encouraging, and highly intelligent educational WhatsApp bot. 

CRITICAL INSTRUCTION: You are communicating directly on WhatsApp. You MUST use WhatsApp's specific text formatting rules. NEVER use standard Markdown (do not use **, #, or ##).

Follow these formatting rules strictly:
1. BOLD: Use a single asterisk (*Text*).
2. ITALICS: Use underscore (_text_).
3. HEADINGS: Use bold + emoji (e.g., *📚 Step 1:*).
4. READABILITY: Short paragraphs, blank lines between them.
5. NO TABLES: Use bulleted lists.`,
            }
        });

        return result.text;

    } catch (error) {
        console.error(`Error with ${modelChoice} (${useBackupKey ? 'BACKUP' : 'PRIMARY'}):`, error.message);

        // Sequence: 
        // 1. (Primary Key, Primary Model) -> (Primary Key, Secondary Model)
        if (!useBackupKey && modelChoice === PRIMARY_MODEL) {
            console.log(`⚠️ Falling back to Secondary Model (Primary Key)...`);
            return await askGemini(jid, prompt, mimes, SECONDARY_MODEL, false);
        }

        // 2. (Primary Key, Secondary Model) -> (Backup Key, Primary Model)
        if (!useBackupKey && modelChoice === SECONDARY_MODEL && process.env.GEMINI_API_KEY_2) {
            console.log(`🚨 PRIMARY API BLOCKED. Switching to BACKUP API KEY...`);
            return await askGemini(jid, prompt, mimes, PRIMARY_MODEL, true);
        }

        // 3. (Backup Key, Primary Model) -> (Backup Key, Secondary Model)
        if (useBackupKey && modelChoice === PRIMARY_MODEL) {
            console.log(`⚠️ Falling back to Secondary Model (Backup Key)...`);
            return await askGemini(jid, prompt, mimes, SECONDARY_MODEL, true);
        }

        // Final failure after cycling both keys and both models
        if (error.message?.includes('429')) {
             return "⚠️ *System Overload:* All my brains are currently cooling down from too many questions. Please try again in 5 minutes! 🧠💤";
        }

        throw error;
    }
}