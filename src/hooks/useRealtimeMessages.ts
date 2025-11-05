// src/hooks/useRealtimeMessages.ts
'use client'

import { useEffect, useState } from 'react'

export function useRealtimeMessages(contactId: string | undefined) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contactId) return

    fetchMessages()

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)

    return () => clearInterval(interval)
  }, [contactId])

  const fetchMessages = async () => {
    if (!contactId) return

    try {
      const response = await fetch(`/api/messages?contactId=${contactId}&limit=100`)
      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMessage = (message: any) => {
    setMessages(prev => [...prev, message])
  }

  return { messages, loading, addMessage, refetch: fetchMessages }
}