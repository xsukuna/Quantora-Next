'use client';

import React from 'react';
import { ProfessionalPages } from '@/components/ProfessionalPages';

export const dynamic = 'force-dynamic'

export default function InstitutionalPage() {
  return (
    <div className="flex-1 bg-[#020202] min-h-screen">
      <ProfessionalPages />
    </div>
  );
}
