import { createClient } from '@supabase/supabase-js'

const url = process.env.REACT_APP_SUPABASE_URL
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY

let supabase = null
try {
  if (url && anon) {
    supabase = createClient(url, anon)
  }
} catch (_) {
  supabase = null
}

export { supabase }
