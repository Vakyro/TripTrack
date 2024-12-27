// /app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, 
      message, 
      createdat,
      senderid,
      receiverid,
      sender:senderid(firstname, lastname, role),
      receiver:receiverid(firstname, lastname, role)
    `)
    .order('createdat', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
