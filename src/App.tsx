import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import DailyPost from './components/DailyPost'
import Archive from './components/Archive'
import PostDetail from './components/PostDetail'
import Logo from './components/Logo'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: location.pathname })
    }
  }, [location])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-border px-8 py-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-foreground no-underline"
          >
            <Logo size={24} />
            <span className="text-base font-semibold">Edge Daily</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              render={<Link to="/archive" />}
              nativeButton={false}
            >
              Archive
            </Button>
            <ThemeToggle />
          </div>
        </nav>

        <RouteTracker />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<DailyPost />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/post/:slug" element={<PostDetail />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
