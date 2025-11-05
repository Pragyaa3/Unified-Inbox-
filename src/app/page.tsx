import Link from 'next/link'
import { MessageSquare, Phone, Mail, Zap, Users, BarChart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Unified Inbox</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            All Your Customer
            <span className="text-blue-600"> Conversations</span>
            <br />
            In One Place
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage SMS, WhatsApp, Email, and Social Media messages from a single unified inbox.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Channel</h3>
            <p className="text-gray-600">SMS, WhatsApp, Email, Twitter, Facebook in one place.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Share notes, assign contacts, work together.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">Track metrics, response times, conversions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}