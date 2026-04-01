import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.16'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatNumber(n: number): string {
  return n.toLocaleString('el-GR')
}

function buildReportHtml(
  partnerName: string,
  month: string,
  year: number,
  listings: Array<{
    business_name: string
    views: number
    phone_clicks: number
    email_clicks: number
  }>,
  totals: { views: number; phone_clicks: number; email_clicks: number }
): string {
  const listingRows = listings
    .map(
      (l) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a2e;">${l.business_name}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(l.views)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(l.phone_clicks)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(l.email_clicks)}</td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0891b2, #1e3a5f); padding: 32px 40px; text-align: center;">
            <img src="https://naauctowmzoltqtpwsqd.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="About Traveller" style="height: 80px; margin-bottom: 12px;" />
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">Μηνιαία Αναφορά Στατιστικών</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding: 32px 40px 16px;">
            <p style="font-size: 16px; color: #1a1a2e; margin: 0 0 8px 0;">Γεια σας${partnerName ? ` ${partnerName}` : ''},</p>
            <p style="font-size: 14px; color: #4a5568; margin: 0; line-height: 1.6;">
              Ακολουθεί η αναφορά απόδοσης των καταχωρίσεών σας για τον μήνα <strong>${month} ${year}</strong>.
            </p>
          </td>
        </tr>

        <!-- Summary Cards -->
        <tr>
          <td style="padding: 16px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="text-align: center; padding: 16px 8px;">
                  <div style="background-color: #f0f9ff; border-radius: 8px; padding: 16px;">
                    <p style="font-size: 28px; font-weight: bold; color: #0891b2; margin: 0;">${formatNumber(totals.views)}</p>
                    <p style="font-size: 12px; color: #4a5568; margin: 4px 0 0;">Προβολές</p>
                  </div>
                </td>
                <td width="33%" style="text-align: center; padding: 16px 8px;">
                  <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px;">
                    <p style="font-size: 28px; font-weight: bold; color: #16a34a; margin: 0;">${formatNumber(totals.phone_clicks)}</p>
                    <p style="font-size: 12px; color: #4a5568; margin: 4px 0 0;">Κλικ Τηλεφώνου</p>
                  </div>
                </td>
                <td width="33%" style="text-align: center; padding: 16px 8px;">
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px;">
                    <p style="font-size: 28px; font-weight: bold; color: #d97706; margin: 0;">${formatNumber(totals.email_clicks)}</p>
                    <p style="font-size: 12px; color: #4a5568; margin: 4px 0 0;">Κλικ Email</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Listings Table -->
        <tr>
          <td style="padding: 16px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">ΚΑΤΑΧΩΡΗΣΗ</th>
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">ΠΡΟΒΟΛΕΣ</th>
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">ΤΗΛΕΦΩΝΟ</th>
                  <th style="padding: 12px 16px; font-size: 12px; color: #6b7280; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">EMAIL</th>
                </tr>
              </thead>
              <tbody>
                ${listingRows}
                <tr style="background-color: #f8fafc; font-weight: bold;">
                  <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e;">Σύνολο</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(totals.views)}</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(totals.phone_clicks)}</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e; text-align: center;">${formatNumber(totals.email_clicks)}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Αυτό το email στάλθηκε αυτόματα από το About Traveller.<br>
              Για απορίες, επικοινωνήστε μαζί μας στο info@aboutraveller.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const greekMonths = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
  'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
  'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]

function buildReportText(
  partnerName: string,
  month: string,
  year: number,
  totals: { views: number; phone_clicks: number; email_clicks: number }
): string {
  return [
    `Γεια σας${partnerName ? ` ${partnerName}` : ''},`,
    '',
    `Μηνιαία αναφορά για ${month} ${year}:`,
    `- Προβολές: ${formatNumber(totals.views)}`,
    `- Κλικ Τηλεφώνου: ${formatNumber(totals.phone_clicks)}`,
    `- Κλικ Email: ${formatNumber(totals.email_clicks)}`,
    '',
    'Για απορίες, επικοινωνήστε μαζί μας στο info@aboutraveller.com',
  ].join('\n')
}

async function sendViaSMTP(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = Deno.env.get('SMTP_PORT')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')

  if (!smtpHost || !smtpUser || !smtpPass) {
    return { success: false, error: 'SMTP credentials not configured' }
  }

  try {
    const port = parseInt(smtpPort || '465', 10)

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: `About Traveller <${smtpUser}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('SMTP email sent to:', to)
    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('SMTP error:', errorMsg)
    return { success: false, error: errorMsg }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Missing config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Calculate previous month date range
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startDate = prevMonth.toISOString().split('T')[0]
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  const monthName = greekMonths[prevMonth.getMonth()]
  const year = prevMonth.getFullYear()

  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
  const testEmail = typeof body?.test_email === 'string' ? body.test_email.trim() : ''

  // --- DEMO MODE ---
  if (testEmail) {
    const demoListings = [
      { business_name: 'Demo Listing A', views: 685, phone_clicks: 52, email_clicks: 23 },
      { business_name: 'Demo Listing B', views: 562, phone_clicks: 37, email_clicks: 19 },
    ]
    const demoTotals = { views: 1247, phone_clicks: 89, email_clicks: 42 }

    const html = buildReportHtml('Μάριος', monthName, year, demoListings, demoTotals)
    const text = buildReportText('Μάριος', monthName, year, demoTotals)
    const subject = `Μηνιαία Αναφορά - ${monthName} ${year} (Demo)`

    const result = await sendViaSMTP(testEmail, subject, html, text)

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log to email_send_log
    await supabase.from('email_send_log').insert({
      message_id: `demo-report-${crypto.randomUUID()}`,
      template_name: 'monthly_report_demo',
      recipient_email: testEmail,
      status: 'sent',
    })

    return new Response(JSON.stringify({ sent: 1, mode: 'demo', to: testEmail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // --- PRODUCTION MODE ---
  const { data: partnerRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'partner')

  if (rolesError || !partnerRoles?.length) {
    console.log('No partners found or error:', rolesError)
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let totalSent = 0

  for (const partner of partnerRoles) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('user_id', partner.user_id)
      .single()

    if (!profile?.email) {
      console.warn('No email for partner:', partner.user_id)
      continue
    }

    const { data: listings } = await supabase
      .from('listings')
      .select('id, business_name')
      .eq('user_id', partner.user_id)

    if (!listings?.length) continue

    const listingIds = listings.map((l) => l.id)

    const { data: analytics } = await supabase
      .from('listing_analytics')
      .select('listing_id, views, phone_clicks, email_clicks')
      .in('listing_id', listingIds)
      .gte('date', startDate)
      .lte('date', endDate)

    const statsMap: Record<string, { views: number; phone_clicks: number; email_clicks: number }> = {}
    for (const a of analytics || []) {
      if (!statsMap[a.listing_id]) {
        statsMap[a.listing_id] = { views: 0, phone_clicks: 0, email_clicks: 0 }
      }
      statsMap[a.listing_id].views += a.views
      statsMap[a.listing_id].phone_clicks += a.phone_clicks
      statsMap[a.listing_id].email_clicks += a.email_clicks
    }

    const listingStats = listings.map((l) => ({
      business_name: l.business_name,
      views: statsMap[l.id]?.views || 0,
      phone_clicks: statsMap[l.id]?.phone_clicks || 0,
      email_clicks: statsMap[l.id]?.email_clicks || 0,
    }))

    const totals = listingStats.reduce(
      (acc, l) => ({
        views: acc.views + l.views,
        phone_clicks: acc.phone_clicks + l.phone_clicks,
        email_clicks: acc.email_clicks + l.email_clicks,
      }),
      { views: 0, phone_clicks: 0, email_clicks: 0 }
    )

    if (totals.views === 0 && totals.phone_clicks === 0 && totals.email_clicks === 0) {
      continue
    }

    const html = buildReportHtml(profile.display_name || '', monthName, year, listingStats, totals)
    const text = buildReportText(profile.display_name || '', monthName, year, totals)
    const subject = `Μηνιαία Αναφορά - ${monthName} ${year}`

    const result = await sendViaSMTP(profile.email, subject, html, text)

    if (!result.success) {
      console.error('Failed to send report to', profile.email, result.error)
      await supabase.from('email_send_log').insert({
        message_id: `report-${partner.user_id}-${startDate}`,
        template_name: 'monthly_report',
        recipient_email: profile.email,
        status: 'failed',
        error_message: result.error || null,
      })
    } else {
      await supabase.from('email_send_log').insert({
        message_id: `report-${partner.user_id}-${startDate}`,
        template_name: 'monthly_report',
        recipient_email: profile.email,
        status: 'sent',
      })
      totalSent++
    }
  }

  console.log(`Monthly reports sent via SMTP: ${totalSent}`)

  return new Response(JSON.stringify({ sent: totalSent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
