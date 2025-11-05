// src/components/dashboard/ChannelStatus.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Phone, MessageSquare, Mail, Twitter, Facebook } from 'lucide-react'

export default function ChannelStatus() {
  const [status, setStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status')
      const data = await response.json()
      setStatus(data.status || {})
    } catch (error) {
      console.error('Failed to fetch channel status:', error)
    } finally {
      setLoading(false)
    }
  }

  const channels = [
    { key: 'SMS', name: 'SMS', icon: Phone, color: 'blue' },
    { key: 'WHATSAPP', name: 'WhatsApp', icon: MessageSquare, color: 'green' },
    { key: 'EMAIL', name: 'Email', icon: Mail, color: 'purple' },
    { key: 'TWITTER', name: 'Twitter', icon: Twitter, color: 'sky' },
    { key: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'indigo' }
  ]

  if (loading) {
    return <div className="text-sm text-gray-500">Loading channels...</div>
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-3">Channel Status</h3>
      <div className="space-y-2">
        {channels.map(channel => {
          const Icon = channel.icon
          const isConfigured = status[channel.key]

          return (
            <div key={channel.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 text-${channel.color}-600`} />
                <span className="text-sm">{channel.name}</span>
              </div>
              {isConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}