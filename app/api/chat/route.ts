import { OpenAI } from 'openai';
import { SYSTEM_PROMPT } from '@/lib/ai-context';
import { logger } from '@/lib/logger';
import { errorResponse, successResponse, ApiErrorType } from '@/lib/api-utils';
import { ChatRequestSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            logger.critical('OpenAI API Key not configured');
            return errorResponse(ApiErrorType.SERVER, 'OpenAI API Key not configured', null, 500);
        }

        const body = await req.json();
        const validation = ChatRequestSchema.safeParse(body);

        if (!validation.success) {
            logger.warn('Chat API validation failed', { errors: validation.error.format() });
            return errorResponse(ApiErrorType.VALIDATION, 'Dados de entrada inválidos', validation.error.format());
        }

        const { messages, context } = validation.data;
        const openai = new OpenAI({ apiKey });

        logger.info('Sending request to OpenAI', {
            messageCount: messages.length,
            hasContext: !!context
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: `DADOS ATUAIS DO USUÁRIO:\n${context || ''}` },
                ...messages as any,
            ],
            temperature: 0.7,
        });

        logger.info('OpenAI response received successfully');

        return successResponse({
            role: 'assistant',
            content: response.choices[0].message.content
        });
    } catch (error: any) {
        logger.error('Chat API Error', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        // Specific error handling for OpenAI
        if (error.status === 401) {
            return errorResponse(ApiErrorType.AUTH, 'Chave de API do OpenAI inválida');
        }
        if (error.status === 429) {
            return errorResponse(ApiErrorType.RATE_LIMIT, 'Limite de requisições do OpenAI excedido');
        }

        return errorResponse(
            ApiErrorType.EXTERNAL_API,
            'O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.',
            error instanceof Error ? error.message : String(error)
        );
    }
}
