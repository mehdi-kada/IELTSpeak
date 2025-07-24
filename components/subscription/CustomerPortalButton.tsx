'use client'

import { useAuth } from '@/hooks/sessions/useAuth'
import { useState } from 'react'


export function CustomerPortalButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePortalAccess = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Make request to your API route
      const response = await fetch('/api/customer-portal', {
        method: 'GET',
        credentials: 'include', // Include cookies for auth
      })

      if (response.ok) {
        const data = await response.json()
        if (data.portalUrl) {
          window.location.href = data.portalUrl
        }
      } else {
        // Handle error responses
        const errorData = await response.json()
        
        if (response.status === 401) {
          setError('Please sign in to access the portal')
        } else if (response.status === 404) {
          setError('No customer portal access available. Please contact support.')
        } else {
          setError(errorData.error || 'Failed to access portal')
        }
      }
    } catch (err) {
      console.error('Portal access error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <button 
        onClick={() => window.location.href = '/login'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Sign In to Access Portal
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePortalAccess}
        disabled={loading}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening Portal...' : 'Access Customer Portal'}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}