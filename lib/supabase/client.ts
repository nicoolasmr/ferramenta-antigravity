import { createBrowserClient } from '@supabase/ssr'
import { logger } from '@/lib/logger';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const isPlaceholder = !url || !key || url.includes('placeholder') || key === 'placeholder';

    if (isPlaceholder) {
        logger.critical('Supabase credentials missing or invalid in client-side environment!');
        // Throwing error as per PLAN.md to ensure early failure instead of silent placeholder bugs
        throw new Error('SUPABASE_CREDENTIALS_MISSING');
    }

    return createBrowserClient(url!, key!)
}
