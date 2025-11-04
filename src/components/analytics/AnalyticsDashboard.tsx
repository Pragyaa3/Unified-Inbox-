'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface AnalyticsData {
  data: Array<{
    id: string
    date: string
    channel: string
    messagesSent: number
    messagesReceived: number
    messagesFailed: number
    avgResponseTime: number
    uniqueContacts: number
    conversions: number
  }>
  totals: {
    messagesSent: number
    messagesReceived: number
    messagesFailed: number
    uniqueContacts: number
    conversions: number
    avgResponseTime: number
  }
  period: {
    start: string
    end: string
    days: number
  }
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?days=${days}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-center text-gray-500 py-8">No analytics data available</div>
  }

  const stats = [
    {
      label: 'Messages Sent',
      value: analytics.totals.messagesSent,
      icon: MessageSquare,
      color: 'blue',
      trend: '+12%',
    },
    {
      label: 'Messages Received',
      value: analytics.totals.messagesReceived,
      icon: TrendingUp,
      color: 'green',
      trend: '+8%',
    },
    {
      label: 'Unique Contacts',
      value: analytics.totals.uniqueContacts,
      icon: Users,
      color: 'purple',
      trend: '+15%',
    },
    {
      label: 'Avg Response Time',
      value: `${analytics.totals.avgResponseTime}s`,
      icon: Clock,
      color: 'orange',
      trend: '-5%',
    },
    {
      label: 'Conversions',
      value: analytics.totals.conversions,
      icon: CheckCircle,
      color: 'teal',
      trend: '+20%',
    },
    {
      label: 'Failed Messages',
      value: analytics.totals.messagesFailed,
      icon: XCircle,
      color: 'red',
      trend: '-2%',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((period) => (
            <button
              key={period}
              onClick={() => setDays(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClass = colorClasses[stat.color as keyof typeof colorClasses]
          const isPositive = stat.trend.startsWith('+')

          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Channel Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages by Channel</h3>
        <div className="space-y-4">
          {analytics.data.reduce((acc, record) => {
            const existing = acc.find((item) => item.channel === record.channel)
            if (existing) {
              existing.sent += record.messagesSent
              existing.received += record.messagesReceived
            } else {
              acc.push({
                channel: record.channel,
                sent: record.messagesSent,
                received: record.messagesReceived,
              })
            }
            return acc
          }, [] as Array<{ channel: string; sent: number; received: number }>).map((channel) => (
            <div key={channel.channel}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{channel.channel}</span>
                <span className="text-sm text-gray-500">
                  {channel.sent + channel.received} total
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(channel.sent / (channel.sent + channel.received)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{channel.sent} sent</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(channel.received / (channel.sent + channel.received)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{channel.received} received</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Channel</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Sent</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Received</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {analytics.data.slice(0, 10).map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {record.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {record.messagesSent}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {record.messagesReceived}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {Math.round(record.avgResponseTime)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}