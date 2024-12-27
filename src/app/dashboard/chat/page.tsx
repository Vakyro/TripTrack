'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from "../../../../utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number
  senderid: string
  receiverid: string
  message: string
  createdat: string
}

interface User {
  id: string
  auth_user_id: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState<User[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        console.log('no user')
      } else {
        setUser(data.user)
      }
    }
    getUser()

    async function getUsers() {
      const supabase = createClient()
      const { data: users, error: usersError } = await supabase.from("users").select()
      if (usersError) {
        console.log('error fetching users', usersError)
      } else {
        setUsers(users)
      }
    }
    getUsers()
  }, [])

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find(u => u.auth_user_id === user.id)
      if (currentUser) {
        fetchMessages(currentUser.id)
      }
    }
  }, [user, users])

  const fetchMessages = async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`senderid.eq.${userId},receiverid.eq.${userId}`)
      .order('createdat', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) {
      console.error('Error: Message or user is missing')
      return
    }

    const currentUser = users.find(u => u.auth_user_id === user.id)
    if (!currentUser) {
      console.error('Error: Current user not found')
      return
    }

    const newMessage = {
      senderid: currentUser.id,
      receiverid: '15', // ID del administrador
      message: inputMessage,
      createdat: new Date().toISOString(),
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select()

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setMessages([...messages, ...data])
      setInputMessage('')
      scrollToBottom()
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <ScrollArea className="h-[calc(100vh-16rem)] mb-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderid === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-2 rounded-lg ${msg.senderid === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  )
}