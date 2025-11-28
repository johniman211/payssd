import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!supabase || !user) { setLoading(false); return }
    const userId = user?._id || user?.id
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setItems(data || [])
    setLoading(false)
  }

  const markRead = async (id) => {
    if (!supabase) return
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  useEffect(() => { fetchNotifications() }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={fetchNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No notifications yet</div>
      ) : (
        <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
          {items.map((n) => (
            <div key={n.id} className="p-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                <div className="font-medium text-gray-900">{n.title}</div>
                {n.message && <div className="text-gray-700">{n.message}</div>}
              </div>
              <div className="flex items-center gap-3">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
