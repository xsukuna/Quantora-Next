import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/research/upload — Upload PDF to Supabase Storage
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB max)
  if (file.size > 52428800) {
    return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 })
  }

  // Validate allowed MIME types (PDF or HTML) or extensions
  const allowedMimeTypes = ['application/pdf', 'text/html']
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isValidType = allowedMimeTypes.includes(file.type) || ext === 'pdf' || ext === 'html' || ext === 'htm'
  if (!isValidType) {
    return NextResponse.json({ error: 'Unsupported file type. Only PDF and HTML are allowed.' }, { status: 400 })
  }



    const adminClient = createAdminClient()
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${user.id}/${timestamp}_${sanitizedName}`

    // Determine the most accurate content type
    let contentType = file.type
    if (ext === 'html' || ext === 'htm') {
      contentType = 'text/html'
    } else if (ext === 'pdf') {
      contentType = 'application/pdf'
    }

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('research-papers')
      .upload(path, arrayBuffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('research-papers')
      .getPublicUrl(path)

    return NextResponse.json({
      url: publicUrl,
      path,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
