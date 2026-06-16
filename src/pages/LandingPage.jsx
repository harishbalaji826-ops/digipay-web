import React from 'react';
import { Smartphone, Compass, Shield, ArrowRight, Wallet, Activity } from 'lucide-react';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-blue/10 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[150px] pointer-events-none"></div>

      {/* TOP HEADER / NAV BAR */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-brand-blue/20">
              D
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DIGIPAY
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onGoToLogin}
              data-testid="login-nav-button"
              className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:border-brand-blue/30 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md"
            >
              Sign In
            </button>
            <button
              onClick={onGoToLogin}
              data-testid="login-nav-admin"
              className="px-5 py-2.5 bg-gradient-to-r from-brand-blue to-brand-cyan text-white hover:brightness-110 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-blue/20 flex items-center gap-2"
            >
              Go to Console <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/15 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping"></span>
            Next-Gen QR-less Payment System
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-6">
            UPI Payments,{' '}
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              Without Scanning
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            DIGIPAY identifies nearby stores using location telemetry, motion direction, and speed context, giving you seamless instant payments directly through secure UPI deep links.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={onGoToLogin}
              data-testid="login-button"
              className="px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-base font-bold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/30 flex items-center justify-center gap-2"
            >
              Open Web Portal
            </button>
            <a
              href="digipay://"
              data-testid="open-app-link"
              className="px-8 py-4 bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-slate-800 text-slate-200 rounded-2xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <Smartphone className="w-5 h-5 text-brand-cyan" /> Launch iOS App
            </a>
          </div>
        </div>

        {/* Hero Interactive UI Card Display */}
        <div className="md:col-span-5 relative w-full flex justify-center">
          <div className="glass-panel w-full max-w-sm relative p-8 select-none hover:shadow-2xl hover:shadow-brand-blue/10 duration-500">
            <div className="absolute top-4 right-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>

            <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/25 flex items-center justify-center text-brand-blue">
                <Compass className="w-6 h-6 text-brand-cyan" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">Intelligent Pairing</h4>
                <p className="text-xs text-slate-500">Active Sensor Discovery</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                  <span className="text-xs font-semibold text-slate-300">McDonalds Store #209</span>
                </div>
                <span className="text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full">
                  98.6% match
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/20 border border-white/5 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  <span className="text-xs font-semibold text-slate-400">Coffee Day Retail</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">84.1% match</span>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex gap-3 items-center">
              <Activity className="w-5 h-5 text-brand-blue shrink-0 animate-pulse" />
              <p className="text-xs leading-normal text-brand-blue/90 font-medium">
                Using <strong>DIGIPIN cells</strong> for location resolution and geo-fenced transactions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CORE FEATURES SECTION */}
      <section className="py-20 border-t border-white/5 bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
              Intelligent Context Engine
            </h2>
            <p className="text-slate-400">
              A comprehensive system utilizing phone orientation, velocity vectors, and digital addressing grids.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel hover:border-brand-blue/30 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-3">DIGIPIN Address Translation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connects directly to India's National Digital Address system, enabling physical spaces to resolve into highly localized alphanumeric codes.
              </p>
            </div>

            <div className="glass-panel hover:border-brand-blue/30 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Heading & Speed Scoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Matches coordinates dynamically based on the direction the customer is moving. Prompts payment prompts for stores you are actively facing.
              </p>
            </div>

            <div className="glass-panel hover:border-brand-blue/30 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Autonomous Categorization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sorts transactions into logical categories (Food, Bills, Shopping, Medical) and outputs savings plans on a regular basis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD BANNER */}
      <section className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left max-w-md">
              <h3 className="text-2xl font-bold mb-4">Install Digipay Application</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Get context-aware payment suggestions, locate nearest merchants on our real-time Map, and set up your personal wallet.
              </p>
              <div className="flex gap-4">
                <a
                  href="digipay://"
                  className="flex items-center gap-3 px-5 py-3 bg-black hover:bg-black/80 text-white rounded-xl border border-white/10 transition-all text-left"
                >
                  <Smartphone className="w-6 h-6 text-brand-cyan" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Download on</div>
                    <div className="text-sm font-bold leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Premium QR Graphic */}
            <div className="flex flex-col items-center gap-3 bg-slate-950/80 p-6 rounded-2xl border border-white/5">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-100">
                <path d="M5 5h30v30H5V5zm4 4v22h22V9H9zM65 5h30v30H65V5zm4 4v22h22V9H69zM5 65h30v30H5V65zm4 4v22h22V69H9z" fill="currentColor"/>
                <path d="M15 15h10v10H15V15zm60 0h10v10H75V15zm-60 60h10v10H15V75z" fill="currentColor"/>
                <path d="M45 10h10v10H45V10zm10 20h10v10H55V30zm-10 15h15v10H45V45zm25 10h10v15H70V55zm-15 15h10v10H55V70zm15 10h15v10H70V80zm-15-50h10v10H55V30zM40 70h10v15H40V70zm25-15h5v5h-5v-5z" fill="currentColor" opacity="0.8"/>
              </svg>
              <span className="text-xs text-slate-500 font-medium">Scan to launch app</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/5 text-slate-500 text-xs text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 DIGIPAY Systems Inc. Academic Prototype Implementation.</p>
        </div>
      </footer>
    </div>
  );
}
