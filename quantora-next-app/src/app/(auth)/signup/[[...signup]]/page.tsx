'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login?tab=signup')
  }, [router])

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#0062FF]" />
    </div>
  )
}
