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

export default function TemplateSelector({ channel, onSelect