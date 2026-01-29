import { OpenAI } from 'openai';
import { SYSTEM_PROMPT } from '@/lib/ai-context';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        const { messages, context } = await req.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: `DADOS ATUAIS DO USUÁRIO:\n${context}` },
                ...messages,
            ],
            temperature: 0.7,
        });

        return new Response(JSON.stringify({
            role: 'assistant',
            content: response.choices[0].message.content
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
