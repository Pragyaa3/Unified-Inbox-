'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import ContactProfile from '@/components/contacts/ContactProfile'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface Contact {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  tags: string[]
  lastContactedAt?: Date | null
  createdAt: Date
  _count: {
    messages: number
  }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // New contact form
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
    tags: '',
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contacts?limit=100')
      const data = await response.json()
      setContacts(data.data || [])
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContact.name,
          phone: newContact.phone || undefined,
          email: newContact.email || undefined,
          whatsapp: newContact.whatsapp || undefined,
          tags: newContact.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setContacts([data.data, ...contacts])
        setShowAddModal(false)
        setNewContact({ name: '', phone: '', email: '', whatsapp: '', tags: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add contact')
      }
    } catch (error) {
      console.error('Add contact error:', error)
      alert('Failed to add contact')
    }
  }

  const handleUpdateContact = (updated: Contact) => {
    setContacts(contacts.map((c) => (c.id === updated.id ? updated : c)))
    setSelectedContact(null)
  }

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId))
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">{contacts.length} total contacts</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    <div className="space-y-1 mt-2">
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.whatsapp && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageSquare className="w-3 h-3" />
                          <span className="truncate">{contact.whatsapp}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {contact.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{contact.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {contact._count.messages} messages
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredContacts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            required
            placeholder="John Doe"
          />
          <Input
            label="Phone"
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            placeholder="+1234567890"
          />
          <Input
            label="Email"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            placeholder="john@example.com"
          />
          <Input
            label="WhatsApp"
            type="tel"
            value={newContact.whatsapp}
            onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
            placeholder="+1234567890"
          />
          <Input
            label="Tags"
            type="text"
            value={newContact.tags}
            onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
            placeholder="customer, vip (comma separated)"
            helperText="Separate tags with commas"
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Contact
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contact Profile Modal */}
      {selectedContact && (
        <ContactProfile
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={handleUpdateContact}
          onDelete={handleDeleteContact}
        />
      )}
    </div>
  )
}