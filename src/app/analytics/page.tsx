import React from 'react'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  )
}