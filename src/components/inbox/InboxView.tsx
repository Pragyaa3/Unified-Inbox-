'use client'
import React, { useState } from 'react'
import { MessageSquare, Phone, Mail, Twitter, Facebook, Search } from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
  whatsapp?: string
  lastMessage?: {
    content: string
    channel: string
    createdAt: string
    direction: string
  }
  unreadCount?: number
}

interface InboxViewProps {
  contacts: Contact[]
  onSelectContact: (contactId: string) => void
  selectedContactId?: string
}

const channelIcons = {
  SMS: Phone,
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  TWITTER: Twitter,
  FACEBOOK: Facebook
}

const channelColors = {
  SMS: 'text-blue-500',
  WHATSAPP: 'text-green-500',
  EMAIL: 'text-purple-500',
  TWITTER: 'text-sky-500',
  FACEBOOK: 'text-indigo-500'
}

export default function InboxView({
  contacts,
  onSelectContact,
  selectedContactId
}: InboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContacts = contacts.filter(contact => {
    const q = searchQuery.toLowerCase()
    return (
      contact.name.toLowerCase().includes(q) ||
      contact.phone?.includes(q) ||
      contact.email?.toLowerCase().includes(q)
    )
  })

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Inbox</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => {
              const active = selectedContactId === contact.id
              const last = contact.lastMessage
              const Icon =
                last?.channel && channelIcons[last.channel as keyof typeof channelIcons]
                  ? channelIcons[last.channel as keyof typeof channelIcons]
                  : MessageSquare
              const color =
                last?.channel && channelColors[last.channel as keyof typeof channelColors]
                  ? channelColors[last.channel as keyof typeof channelColors]
                  : 'text-gray-400'

              return (
                <li key={contact.id}>
                  <button
                    onClick={() => onSelectContact(contact.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all ${
                      active
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3
                          className={`font-semibold truncate ${
                            contact.unreadCount ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {contact.name}
                        </h3>
                        {last?.createdAt && (
                          <span className="text-xs text-gray-500">
                            {formatTime(last.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Channel + message */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {last
                            ? `${last.direction === 'OUTBOUND' ? 'You: ' : ''}${last.content}`
                            : 'No messages yet'}
                        </p>
                      </div>

                      {contact.unreadCount && contact.unreadCount > 0 && (
                        <span className="inline-flex mt-1 px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
