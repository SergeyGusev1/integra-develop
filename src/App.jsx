import { SiteProvider, useSite } from './context/SiteContext'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Services from './components/Services'
import About from './components/About'
import Process from './components/Process'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminPanel from './components/Admin/AdminPanel'
import AdminLogin from './components/Admin/AdminLogin'

function SiteContent() {
  const { adminOpen, adminAuthed } = useSite()
  return (
    <>
      {adminOpen && !adminAuthed && <AdminLogin />}
      {adminOpen && adminAuthed && <AdminPanel />}
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <About />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <SiteProvider>
      <SiteContent />
    </SiteProvider>
  )
}
