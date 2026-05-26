'use client';

import React from 'react';
import { LiveTerminal } from '@/components/LiveTerminal';

export default function TerminalPage() {
  return (
    <div className="flex-1 bg-[#020202] min-h-screen">
      <LiveTerminal />
    </div>
  );
}
