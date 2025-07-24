import { NextRequest, NextResponse } from 'next/server'
import { getUserSubscription } from '@/lib/polar/subscription-helpers'
import { createCustomerSession } from '@/lib/polar/polar'
import { createClient } from '@/lib/supabase/server'



export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await  supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Get the user's Polar customer ID
    const userSubData = await getUserSubscription(user.id);

    if (!userSubData) {
      return NextResponse.json(
        { error: 'No subscription data found for user' },
        { status: 404 }
      )
    }
    
    const customerId = userSubData.polar_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer portal access available' }, 
        { status: 404 }
      )
    }

    // Create authenticated portal session
    const portalUrl = await createCustomerSession(customerId)
    
    // Return the portal URL for client-side redirect
    return NextResponse.json({ portalUrl })
    
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

