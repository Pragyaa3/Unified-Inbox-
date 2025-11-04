import React, { useState } from 'react'
import { MessageSquare, Phone, Mail, Twitter, Facebook, Search, Filter } from 'lucide-react'

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
  FACEBOOK: Facebook,
  VOICE: Phone
}

const channelColors = {
  SMS: 'bg-blue-100 text-blue-600',
  WHATSAPP: 'bg-green-100 text-green-600',
  EMAIL: 'bg-purple-100 text-purple-600',
  TWITTER: 'bg-sky-100 text-sky-600',
  FACEBOOK: 'bg-indigo-100 text-indigo-600',
  VOICE: 'bg-orange-100 text-orange-600'
}

/**
 * Main Inbox View Component
 * Displays a list of contacts with their last messages in a thread view
 */
export default function InboxView({ 
  contacts, 
  onSelectContact, 
  selectedContactId 
}: InboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterChannel, setFilterChannel] = useState<string | null>(null)

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = !filterChannel || contact.lastMessage?.channel === filterChannel

    return matchesSearch && matchesFilter
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Inbox</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Channel Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <button
            onClick={() => setFilterChannel(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              !filterChannel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.keys(channelIcons).map((channel) => (
            <button
              key={channel}
              onClick={() => setFilterChannel(channel)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                filterChannel === channel
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map((contact) => {
              const Icon = contact.lastMessage?.channel 
                ? channelIcons[contact.lastMessage.channel as keyof typeof channelIcons]
                : MessageSquare
              const colorClass = contact.lastMessage?.channel
                ? channelColors[contact.lastMessage.channel as keyof typeof channelColors]
                : 'bg-gray-100 text-gray-600'

              return (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    selectedContactId === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(contact.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Channel Badge */}
                      {contact.lastMessage && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                          <Icon className="w-3 h-3" />
                          {contact.lastMessage.channel}
                        </span>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    {contact.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {contact.lastMessage.direction === 'OUTBOUND' ? 'You: ' : ''}
                        {contact.lastMessage.content}
                      </p>
                    )}

                    {/* Unread Badge */}
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full mt-1">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}