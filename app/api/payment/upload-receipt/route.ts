import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('receipt') as File
    const referenceNumber = formData.get('reference_number') as string

    if (!file || !referenceNumber) {
      return NextResponse.json({ error: 'Missing file or reference' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const filename = `${user.id}/${Date.now()}-receipt.jpg`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('payment-receipts')
      .upload(filename, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('payment-receipts')
      .getPublicUrl(filename)

    // Validate with Claude Vision
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { 
              type: 'url', 
              url: publicUrl 
            }
          },
          {
            type: 'text',
            text: `Analyze this GCash receipt. Extract and validate:
- Amount (must be ₱299)
- Reference number (format: GCxxxxxx)
- Date (must be within 7 days)
- Recipient name

Return ONLY JSON:
{
  "valid": boolean,
  "amount": "string",
  "reference": "string", 
  "date": "string",
  "recipient": "string",
  "reason": "string if invalid"
}`
          }
        ]
      }]
    })

    const analysisText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '{}'
    
    const analysis = JSON.parse(analysisText.replace(/```json|```/g, '').trim())

    // Save receipt record
    await supabaseAdmin
      .from('payment_receipts')
      .insert({
        user_id: user.id,
        receipt_image_url: publicUrl,
        claude_analysis: analysis,
        validation_status: analysis.valid ? 'approved' : 'rejected',
        gcash_reference_number: referenceNumber
      })

    // If valid, activate subscription
    if (analysis.valid) {
      const subscriptionEnd = new Date()
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          payment_method: 'gcash',
          tier: 'premium',
          subscription_start: new Date().toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          trial_messages_remaining: null,
          limit_reached: false,
          amount_paid: 299,
          gcash_reference_number: referenceNumber
        })
        .eq('user_id', user.id)

      await supabaseAdmin
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type: 'payment_approved',
          title: 'Payment Approved',
          message: 'Your Premium subscription is now active!',
          is_read: false
        })
    }

    return NextResponse.json({ 
      success: true,
      valid: analysis.valid,
      message: analysis.valid 
        ? 'Payment approved! Premium activated.' 
        : `Payment rejected: ${analysis.reason}`
    })

  } catch (error) {
    console.error('Upload receipt error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}