// src/lib/websocket/manager.ts
/**
 * Simple WebSocket manager for real-time updates
 * For production, consider using Socket.io or Pusher
 */

type Subscriber = (data: any) => void

class WebSocketManager {
  private subscribers: Map<string, Set<Subscriber>> = new Map()
  private static instance: WebSocketManager

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  subscribe(event: string, callback: Subscriber): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    
    this.subscribers.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.get(event)?.delete(callback)
    }
  }

  publish(event: string, data: any) {
    const subscribers = this.subscribers.get(event)
    if (!subscribers) return

    subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('[WebSocket] Subscriber error:', error)
      }
    })
  }

  // Broadcast to all subscribers
  broadcast(data: any) {
    this.subscribers.forEach((subscribers) => {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('[WebSocket] Broadcast error:', error)
        }
      })
    })
  }
}

export const wsManager = WebSocketManager.getInstance()

// Helper hook for React components
export function useWebSocket(event: string, callback: Subscriber) {
  // This would be implemented as a React hook in actual usage
  // For now, it's a placeholder for the concept
}