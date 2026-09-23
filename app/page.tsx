'use client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navbar } from '@/components/Navbar'
import { Hero } from '../components/Hero'
import { Services } from '@/components/Services'
import { CarSlider } from '@/components/CarSlider'
import { Reviews } from '@/components/Reviews'
import { FAQ } from '@/components/FAQ'
import { FareCalculator } from '@/components/FareCalculator'
import { FloatingButtons } from '@/components/FloatingButtons'
import { StickyMobileBar } from '@/components/StickyMobileBar'
import { Contact } from '@/components/Contact'
import { Footer } from '../components/Footer'
import { TrustBar } from '@/components/TrustBar'
import { HowItWorks } from '@/components/HowItWorks'
import { FinalCTA } from '@/components/FinalCTA'

export default function Page() {
  return (
    <div className="min-h-screen bg-white pb-13 sm:pb-0">
      <Navbar />
      <Hero />
      <TrustBar />
      <CarSlider />
      <HowItWorks />
      <FareCalculator />
      <Reviews />
      <Services />
      <FAQ />
      <FinalCTA />
      <Contact />
      <Footer />
      <FloatingButtons />
      <StickyMobileBar />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}
