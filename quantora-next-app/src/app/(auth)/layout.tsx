// (auth) route group — no PlatformShell wrapper
// Login/Signup pages render standalone without the sidebar layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
