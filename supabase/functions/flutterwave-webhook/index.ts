import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')!
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const secretHash = Deno.env.get('FLW_SECRET_HASH')

const supabase = createClient(url, key)

const toMethod = (raw?: string) => {
  const s = (raw || '').toLowerCase()
  if (s.includes('card')) return 'card'
  if (s.includes('mpesa')) return 'mpesa'
  if (s.includes('bank')) return 'banktransfer'
  if (s.includes('momo') || s.includes('mobile')) return 'mobilemoney'
  return 'flutterwave'
}

serve(async (req) => {
  try {
    if (!secretHash) {
      return new Response(JSON.stringify({ success: false, message: 'Webhook secret not configured' }), { status: 500 })
    }

    const verif = req.headers.get('verif-hash')
    if (!verif || verif !== secretHash) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid signature' }), { status: 401 })
    }

    const evt = await req.json()
    const data = evt?.data || {}
    const tx_ref = String(data?.tx_ref || '')
    const flwId = String(data?.id || '')
    const status = String(data?.status || '').toLowerCase()
    const method = toMethod(String(data?.payment_type || data?.channel || data?.source || ''))
    const amount = Number(data?.amount || 0)
    const currency = String(data?.currency || 'USD')

    let tx = null as null | { id: string; user_id?: string }

    // Prefer match by Flutterwave ID if present
    if (flwId) {
      const { data: foundByFlw } = await supabase
        .from('transactions')
        .select('id,user_id')
        .eq('flutterwave_id', flwId)
        .limit(1)
        .maybeSingle()
      if (foundByFlw) tx = foundByFlw
    }

    // Fallback: match by tx_ref stored in metadata
    if (!tx && tx_ref) {
      const { data: foundByRef } = await supabase
        .from('transactions')
        .select('id,user_id')
        .eq('metadata->>tx_ref', tx_ref)
        .limit(1)
        .maybeSingle()
      if (foundByRef) tx = foundByRef
    }

    // If not found, create minimal transaction row
    if (!tx) {
      const ins = await supabase
        .from('transactions')
        .insert({
          flutterwave_id: flwId || null,
          amount,
          currency,
          status: status === 'successful' ? 'successful' : status === 'failed' ? 'failed' : 'pending',
          payment_method: method,
          metadata: { tx_ref }
        })
        .select('id,user_id')
        .maybeSingle()
      tx = ins.data || null
    } else {
      await supabase
        .from('transactions')
        .update({
          flutterwave_id: flwId || null,
          status: status === 'successful' ? 'successful' : status === 'failed' ? 'failed' : 'pending',
          payment_method: method,
          amount,
          currency,
          metadata: { tx_ref, flw_status: status }
        })
        .eq('id', tx.id)
    }

    // Emit in-app notification for the owner if we have user_id
    if (tx?.user_id) {
      const title = status === 'successful' ? 'Payment Received' : (status === 'failed' ? 'Payment Failed' : 'Transaction Update')
      const message = `${title}: USD ${amount.toLocaleString()} (ref ${tx_ref || flwId})`
      await supabase.from('notifications').insert({
        user_id: tx.user_id,
        type: 'transaction_status',
        title,
        message,
        read: false
      })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), { status: 500 })
  }
})
