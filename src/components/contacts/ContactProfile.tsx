'use client'

import React, { useState, useEffect } from 'react'
import { X, Phone, Mail, MessageSquare, Edit, Trash2, Plus } from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  twitterHandle?: string | null
  facebookId?: string | null
  tags: string[]
  lastContactedAt?: Date | null
  createdAt: Date
}

interface Note {
  id: string
  content: string
  isPrivate: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

interface ContactProfileProps {
  contact: Contact
  onClose: () => void
  onUpdate: (contact: Contact) => void
  onDelete: (contactId: string) => void
}

export default function ContactProfile({
  contact,
  onClose,
  onUpdate,
  onDelete,
}: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContact, setEditedContact] = useState(contact)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [contact.id])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?contactId=${contact.id}`)
      const data = await response.json()
      setNotes(data.data || [])
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContact),
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate(data)
        setIsEditing(false)
      } else {
        alert('Failed to update contact')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update contact')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(contact.id)
        onClose()
      } else {
        alert('Failed to delete contact')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete contact')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          content: newNote,
          isPrivate: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data.data, ...notes])
        setNewNote('')
      }
    } catch (error) {
      console.error('Add note error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedContact.name}
                  onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                  className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
              )}
              <p className="text-sm text-gray-500">
                Added {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditedContact(contact)
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Contact Information</h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editedContact.phone || ''}
                    onChange={(e) =>
                      setEditedContact({ ...editedContact, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedContact.email || ''}
                    onChange={(e) =>
                      setEditedContact({ ...editedContact, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editedContact.whatsapp || ''}
                    onChange={(e) =>
                      setEditedContact({ ...editedContact, whatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.whatsapp && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MessageSquare className="w-4 h-4" />
                    <span>{contact.whatsapp}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length === 0 && (
                <span className="text-sm text-gray-500">No tags</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
            
            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {note.author.name || note.author.email} •{' '}
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    {note.isPrivate && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}