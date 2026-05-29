import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  // Fetch the paper details to resolve the secure file URL
  const { data: paper, error } = await admin
    .from('Paper')
    .select('fileUrl, fileName')
    .eq('id', id)
    .single()

  if (error || !paper || !paper.fileUrl) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
  }

  try {
    const isHtml = paper.fileName?.toLowerCase().endsWith('.html') || 
                   paper.fileName?.toLowerCase().endsWith('.htm') || 
                   paper.fileUrl.toLowerCase().split('?')[0].endsWith('.html') || 
                   paper.fileUrl.toLowerCase().split('?')[0].endsWith('.htm')

    if (!isHtml) {
      return NextResponse.json({ error: 'Manuscript is not in HTML format' }, { status: 400 })
    }

    // Fetch the raw HTML content from Supabase public storage
    const fileRes = await fetch(paper.fileUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to retrieve manuscript source' }, { status: 500 })
    }

    const htmlText = await fileRes.text()

    // Serve raw HTML text directly with the correct inline headers
    return new Response(htmlText, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
        // Sandboxing headers for security, allowing scripting to render interactive charts
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:;"
      }
    })
  } catch (err: any) {
    console.error('HTML content fetch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
