import { createBrowserClient } from '@supabase/ssr'

export function anonCreateClient(){
    return createBrowserClient(import.meta.env.VITE_SUPABASE_CLIENT_URL, import.meta.env.VITE_SUPABASE_CLIENT_ANONKEY, 
    {
        cookieOptions: 
        {
            secure: process.env.NODE_ENV === 'production',
            //domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost',
            //httpOnly: true,
        }
    })
}
