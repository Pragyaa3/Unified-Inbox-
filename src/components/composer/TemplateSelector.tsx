'use client'

import React, { useState, useEffect } from 'react'
import { FileText, X } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  channel: string
  variables: string[]
}

interface TemplateSelectorProps {
  channel: string
  onSelect: (content: string) => void
}

export default function TemplateSelector({ channel, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (showModal) {
      fetchTemplates()
    }
  }, [showModal, channel])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/templates?channel=${channel}`)
      const data = await response.json()
      setTemplates(data.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    
    // Initialize variable values
    const initialValues: Record<string, string> = {}
    template.variables.forEach(variable => {
      initialValues[variable] = ''
    })
    setVariableValues(initialValues)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    let content = selectedTemplate.content

    // Replace variables with values
    Object.entries(variableValues).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g')
      content = content.replace(regex, value)
    })

    onSelect(content)
    setShowModal(false)
    setSelectedTemplate(null)
    setVariableValues({})
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FileText className="w-4 h-4" />
        Use Template
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Select Template</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedTemplate(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedTemplate ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedTemplate.name}</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTemplate.content}</p>
                    </div>
                  </div>

                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Fill in variables:</h4>
                      <div className="space-y-3">
                        {selectedTemplate.variables.map(variable => (
                          <div key={variable}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {variable}
                            </label>
                            <input
                              type="text"
                              value={variableValues[variable] || ''}
                              onChange={(e) =>
                                setVariableValues({
                                  ...variableValues,
                                  [variable]: e.target.value
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Enter ${variable}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleApplyTemplate}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply Template
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No templates found for {channel}</p>
                    </div>
                  ) : (
                    templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {template.channel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {template.content}
                        </p>
                        {template.variables.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {template.variables.map(variable => (
                              <span
                                key={variable}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {variable}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}