import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

/**
 * POST: a new post is made in the group
 * LIKE: someone like your post
 * COMMENT: someone comments on your post
 */

interface INotificationService {

}


class NotificationImpl{
    constructor() {

    }

    subscribe() {
        const supabase = createClient(config.supabase, SUPABASE_ANON_KEY)

        // Create a function to handle inserts
        const handleInserts = (payload) => {
        console.log('Change received!', payload)
        }

        // Listen to inserts
        supabase
        .channel('todos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, handleInserts)
        .subscribe()

    }
}






