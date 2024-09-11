import { createClient } from '@supabase/supabase-js'
import Cookies from 'js-cookie';

export function anonCreateClient(){
    return createClient(import.meta.env.VITE_SUPABASE_CLIENT_URL, import.meta.env.VITE_SUPABASE_CLIENT_ANONKEY,  
    {
        auth: {
            //detectSessionInUrl: true,
            storage:  {
                getItem: (key) => {
                    //console.log('getItem:' + key)
                    return Cookies.get(key)
                },
                setItem: (key, value) => {
                    //console.log('setItem:' + key)
                    //console.log(value)
                    return Cookies.set(key, value)
                },
                removeItem: (key) => {
                    //console.log('removeItem:' + key)
                    return Cookies.remove(key)
                },
            }
        }
    })
}
