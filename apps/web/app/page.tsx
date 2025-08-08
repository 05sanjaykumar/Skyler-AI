'use client'

import { useSpring, animated } from '@react-spring/web'


export default function LandingPage() {
  const fadeIn = useSpring({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, delay: 300 })
  const fadeInDelay = (delay: number) => useSpring({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, delay })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-white to-gray-50">
      <animated.h1 style={fadeIn} className="text-5xl font-extrabold text-gray-900 mb-6 text-center">
        Skyler AI
      </animated.h1>
      <animated.p style={fadeInDelay(500)} className="max-w-3xl text-center text-gray-700 mb-8 text-lg">
        Skyler AI helps you organize, prioritize, and reply to your inbox using customizable AI-powered prompt workflows. Manage your email smarter, faster, and stress-free.
      </animated.p>
      
      <animated.div style={fadeInDelay(800)} className="flex gap-6 mb-12">
        <a
          href="/login"
          className="px-6 py-3 hover:shadow-lg transition bg-primary text-white rounded-md font-medium text-base flex items-center justify-center"
        >
          Login
        </a>
        <a
          href="/signin"
          className="px-6 py-3 hover:bg-black hover:text-white transition border border-gray-300 rounded-md text-gray-900 bg-white font-medium text-base flex items-center justify-center"
        >
          Sign Up
        </a>
      </animated.div>

      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-800">
        <animated.div style={fadeInDelay(1100)}>
          <h2 className="text-2xl font-semibold mb-3">Custom Prompt Workflows</h2>
          <p>Create your own AI-powered workflows that organize your inbox and craft replies tailored to your style.</p>
        </animated.div>
        <animated.div style={fadeInDelay(1300)}>
          <h2 className="text-2xl font-semibold mb-3">Batch Reply Eaiser With AI helping to Organise</h2>
          <p>Save time by sending bulk, smart replies easier as AI helps to filter out noise — no more copy-pasting or repetitive typing.</p>
        </animated.div>
        <animated.div style={fadeInDelay(1500)}>
          <h2 className="text-2xl font-semibold mb-3">Multi-instance Management</h2>
          <p>Handle multiple email inboxes or workflows in one place — ideal for freelancers, teams, or busy pros.</p>
        </animated.div>
        <animated.div style={fadeInDelay(1700)}>
          <h2 className="text-2xl font-semibold mb-3">Edit & Usage Control</h2>
          <p>Track your AI usage and editing limits clearly to stay on top of your plan and avoid surprises.</p>
        </animated.div>
      </section>

    </main>
  )
}
