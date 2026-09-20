'use client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Services } from '@/components/Services'
import { CarSlider } from '@/components/CarSlider'
import { Reviews } from '@/components/Reviews'
import { FAQ } from '@/components/FAQ'
import { FareCalculator } from '@/components/FareCalculator'
import { FloatingButtons } from '@/components/FloatingButtons'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <CarSlider />
      <FareCalculator />
      <Reviews />
      <Services />
      <FAQ />
      <Contact />
     
      <FloatingButtons />
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
