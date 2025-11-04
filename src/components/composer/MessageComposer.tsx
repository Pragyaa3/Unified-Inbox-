'use client'
import React, { useState } from 'react'

type Props = {
  contactId: string
  contactName: string
  availableChannels: string[]
  onSend: (payload: { contactId: string; channel: string; content: string; mediaUrls?: string[]; scheduledFor?: string }) => Promise<void>
}

export default function MessageComposer({ contactId, contactName, availableChannels, onSend }: Props) {
  const [channel, setChannel] = useState<string>(availableChannels?.[0] || 'SMS')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [scheduledFor, setScheduledFor] = useState<string | undefined>()

  React.useEffect(() => {
    if (availableChannels?.length) setChannel(availableChannels[0])
  }, [availableChannels])

  const handleSend = async () => {
    if (!content.trim()) return
    setSending(true)
    try {
      await onSend({ contactId, channel, content, scheduledFor })
      setContent('')
      setScheduledFor(undefined)
    } catch (e: any) {
      alert('Send failed: ' + (e.message || 'error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border-t p-4">
      <div className="flex items-center gap-3 mb-2">
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="border px-2 py-1 rounded">
          {availableChannels.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-600">To: {contactName}</div>
        <input type="datetime-local" value={scheduledFor || ''} onChange={(e) => setScheduledFor(e.target.value || undefined)} className="ml-auto border px-2 py-1 rounded text-sm" />
      </div>

      <div className="flex gap-2">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 border rounded p-2" placeholder="Write a message..." rows={3} />
        <div className="flex flex-col gap-2">
          <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-blue-600 text-white rounded">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
