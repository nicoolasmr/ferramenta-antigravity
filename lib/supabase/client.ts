import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder') || key === 'placeholder') {
        console.error('Supabase credentials missing or invalid in client-side environment!')
    }

    return createBrowserClient(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder'
    )
}
