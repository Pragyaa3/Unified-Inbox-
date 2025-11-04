import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-12 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Unified Inbox</h1>
        <p className="text-gray-600 mb-6">Demo dashboard for multi-channel outreach</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded">Open Dashboard</Link>
        </div>
      </div>
    </main>
  )
}
