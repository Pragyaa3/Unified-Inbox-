'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Users, TrendingUp, Clock, Phone, Mail } from 'lucide-react'
import InboxView from '@/components/inbox/InboxView'
import MessageComposer from '@/components/composer/MessageComposer'

interface DashboardStats {
  totalMessages: number
  totalContacts: number
  avgResponseTime: number
  todayMessages: number
}

/**
 * Main Dashboard Page
 * Displays inbox, message thread, and composer in a unified interface
 */
export default function DashboardPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>()
  const [messages, setMessages] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalContacts: 0,
    avgResponseTime: 0,
    todayMessages: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch contacts and stats
  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [])

  // Fetch messages for selected contact
  useEffect(() => {
    if (selectedContactId) {
      fetchMessages(selectedContactId)
    }
  }, [selectedContactId])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts?limit=50', {
        method: 'GET',
        credentials: 'include', // ✅ send cookies for auth
      })

      const data = await response.json()
      console.log('Contacts API response:', data)

      if (!response.ok) {
        console.error('Failed to fetch contacts:', data?.error)
        return
      }

      // Safely handle both possible response shapes
      const contactsArray = data?.data || data?.contacts || []

      const transformedContacts = contactsArray.map((contact: any) => ({
        ...contact,
        lastMessage: contact.messages?.[0] || undefined,
        unreadCount: 0,
      }))

      setContacts(transformedContacts)

      // Auto-select first contact
      if (transformedContacts.length > 0 && !selectedContactId) {
        setSelectedContactId(transformedContacts[0].id)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`/api/messages?contactId=${contactId}&limit=100`, {
        credentials: 'include',
      })
      const data = await response.json()
      const messagesArray = data?.data || []
      setMessages(messagesArray.reverse()) // show oldest first
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/summary', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSendMessage = async (data: {
    contactId: string
    channel: string
    content: string
    mediaUrls?: string[]
    scheduledFor?: string
  }) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      const result = await response.json()

      // Add message to local state for immediate feedback
      if (result.data) {
        setMessages((prev) => [...prev, result.data])
      }

      // Refresh contacts to update last message
      fetchContacts()
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }

  const selectedContact = contacts.find((c) => c.id === selectedContactId)
  const availableChannels =
    selectedContact
      ? [
          selectedContact.phone && 'SMS',
          selectedContact.whatsapp && 'WHATSAPP',
          selectedContact.email && 'EMAIL',
          selectedContact.twitterHandle && 'TWITTER',
          selectedContact.facebookId && 'FACEBOOK',
        ].filter(Boolean) as string[]
      : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Unified Inbox</h1>

          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{stats.totalMessages}</span>
              <span className="text-gray-600">messages</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-semibold">{stats.totalContacts}</span>
              <span className="text-gray-600">contacts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-semibold">{Math.round(stats.avgResponseTime)}s</span>
              <span className="text-gray-600">avg response</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Inbox Sidebar */}
        <div className="w-96 flex-shrink-0 overflow-hidden">
          <InboxView
            contacts={contacts}
            onSelectContact={setSelectedContactId}
            selectedContactId={selectedContactId}
          />
        </div>

        {/* Message Thread & Composer */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedContact.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      {selectedContact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedContact.phone}
                        </div>
                      )}
                      {selectedContact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedContact.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {availableChannels.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation below</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.direction === 'OUTBOUND'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          message.direction === 'OUTBOUND'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                          <span>{message.channel}</span>
                          <span>•</span>
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                          {message.status && (
                            <>
                              <span>•</span>
                              <span>{message.status}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <MessageComposer
                contactId={selectedContact.id}
                contactName={selectedContact.name}
                availableChannels={availableChannels}
                onSend={handleSendMessage}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">
                  Choose a contact from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
