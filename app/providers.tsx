'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #eaecf0',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: '500',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,.12)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
