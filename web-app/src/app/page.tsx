"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  Lock as LockIcon,
  Zap,
  Target,
  Award,
  Globe,
  Cpu
} from "lucide-react";
import {
  GlassCard,
  PremiumButton,
  NeonBadge,
  SectionHighlight
} from "@/components/ui/PremiumUI";
import AISupportAgent from "@/components/support/AISupportAgent";
import { RegulatoryDisclaimer } from "@/components/compliance/RegulatoryDisclaimer";

export default function Home() {
  const [stats, setStats] = React.useState({
    aum: "₹2,480Cr+",
    advisors: "1,240+",
    users: "15,000+",
    trustScore: "4.9/5"
  });

  React.useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats({
            aum: data.aum,
            advisors: data.advisors,
            users: data.users,
            trustScore: data.trustScore
          });
        }
      })
      .catch((e) => console.error("Stats Fetch Error:", e));
  }, []);
  return (
    <div className="min-h-screen bg-[#0B0B12] text-white overflow-x-hidden selection:bg-accent-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-primary/10 rounded-full blur-[150px] animate-premium-float opacity-30" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] animate-premium-float opacity-20 delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 md:px-16 backdrop-blur-xl border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-neon-glow group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">ECOSYSTEM</span>
            <span className="text-[10px] font-bold text-accent-cyan tracking-[0.2em] uppercase">Smart Investing</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <NavLink label="Investor" href="/dashboard" />
          <NavLink label="Advisor" href="/advisor/dashboard" />
          <NavLink label="Training" href="/training" />
          <NavLink label="Trust Center" href="/trust-center" />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-text-secondary hover:text-white transition-colors mr-4">Login</button>
          <PremiumButton variant="primary" onClick={() => window.location.href = '/auth/login'}>Launch App</PremiumButton>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-24 pb-40 md:px-12 flex flex-col items-center text-center">
          <SectionHighlight />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <NeonBadge color="accent-primary">Institutional Grade WealthTech</NeonBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter"
          >
            THE NEW STANDARD OF <br />
            <span className="text-transparent bg-clip-text bg-premium-gradient">TRUSTED ADVISORY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl text-xl text-text-secondary mb-12 font-medium leading-relaxed"
          >
            India's premier ecosystem connecting audited SEBI advisors with sophisticated investors.
            Real-time verification. Institutional-grade analytics. Zero compromise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 mb-24"
          >
            <PremiumButton variant="primary" icon={ArrowRight} onClick={() => window.location.href = '/auth/register'}>Start Your Journey</PremiumButton>
            <PremiumButton variant="secondary">View Verified Leaderboard</PremiumButton>
          </motion.div>

          {/* KPI Ribbon */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <KPICard label="Total Assets Monitored" value={stats.aum} sub="Live Ecosystem Data" />
            <KPICard label="Verified Advisors" value={stats.advisors} sub="SEBI Registered Only" />
            <KPICard label="Investor Trust" value={stats.trustScore} sub="Certified Reviews" />
            <KPICard label="Active Investors" value={stats.users} sub="Institutional Scale" />
          </div>
        </section>

        {/* ECOSYSTEM CAPABILITIES */}
        <section className="px-6 py-32 bg-background-secondary/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black mb-6">UNRIVALED PLATFORM <br /><span className="text-accent-cyan">CAPABILITIES</span></h2>
              <div className="w-24 h-1 bg-accent-cyan mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CapabilityCard
                icon={Cpu}
                title="AI Risk Engine"
                desc="Proprietary 95% Confidence VaR calculations and stress testing simulations for every portfolio."
              />
              <CapabilityCard
                icon={Target}
                title="Fiduciary Matching"
                desc="Scientific advisor discovery based on risk-matching algorithms, not commission structures."
                neon
              />
              <CapabilityCard
                icon={Globe}
                title="The 90-Day Journey"
                desc="Comprehensive certification and infrastructure roadmap for aspiring high-net-worth advisors."
              />
            </div>
          </div>
        </section>

        {/* FRAUD RADAR - VISUAL SHOWCASE */}
        <section className="px-6 py-32 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <NeonBadge color="danger">Live Integrity Shield</NeonBadge>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-8 leading-tight">
                WE ELIMINATE <br />
                <span className="text-danger">BAD ACTORS.</span>
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-10">
                Our AI Fraud Radar actively scans the ecosystem 24/7, cross-referencing trade logs with SEBI registration statuses to ensure you never interact with unverified 'gurus'.
              </p>

              <div className="space-y-6">
                <HighlightItem text="Direct Broker API P&L Verification" />
                <HighlightItem text="Real-time Telegram & Whatsapp Scam Protection" />
                <HighlightItem text="Institutional-Grade Fund Security" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-danger/10 rounded-full blur-[100px] glow-animation" />
              <GlassCard className="p-8 border-danger/30 relative z-10" neon>
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                      <Shield size={24} />
                    </div>
                    <span className="font-bold tracking-tight uppercase">AI Fraud Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold text-danger animate-pulse">● LIVE STATUS</span>
                </div>

                <div className="space-y-6">
                  <RadarItem name="FinGuru 'Alpha' Rahul" risk={98} type="FAKE RETURNS" status="BLOCKED" />
                  <RadarItem name="MarketKing Signals" risk={92} type="UNLICENSED" status="REJECTED" />
                  <RadarItem name="Arvind Singh, CFA" risk={4} type="SEBI REGISTERED" status="SAFE" success />
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-32 bg-black/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16">HOW THE <span className="text-accent-primary">ECOSYSTEM</span> WORKS</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StepItem number="01" title="Register" desc="Onboard as an Investor or Advisor with SEBI verification." />
              <StepItem number="02" title="Verify" desc="Our engine audits performance logs directly from the broker." />
              <StepItem number="03" title="Matches" desc="AI Risk Engine connects you with the ideal strategy." />
              <StepItem number="04" title="Prosper" desc="Invest with confidence backed by transparent data." />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 py-40 md:px-12">
          <GlassCard className="max-w-6xl mx-auto p-12 md:p-24 text-center relative overflow-hidden group" neon>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-premium-gradient opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity" />
            <h2 className="text-5xl md:text-7xl font-black mb-8">READY TO DEFY THE <br /><span className="text-transparent bg-clip-text bg-premium-gradient">STATUS QUO?</span></h2>
            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto font-medium">
              Join the ecosystem that is reshaping the future of Indian wealth management. Secure. Audited. Professional.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <PremiumButton variant="primary" onClick={() => window.location.href = '/auth/register'}>Become an Advisor</PremiumButton>
              <PremiumButton variant="secondary" onClick={() => window.location.href = '/auth/register'}>Join as an Investor</PremiumButton>
            </div>
          </GlassCard>
        </section>
      </main>

      {/* AI SUPPORT AGENT */}
      <AISupportAgent />

      {/* FOOTER */}
      <footer className="px-12 py-20 border-t border-white/5 bg-background-primary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">ECOSYSTEM</span>
            </div>
            <p className="text-text-muted max-w-sm mb-8 leading-relaxed">
              The premium institutional framework for WealthTech in India. Verifying the past to secure your future.
            </p>
            <RegulatoryDisclaimer type="platform" className="mb-8" />
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="/support" className="hover:text-accent-primary transition-colors">Help Center</a></li>
              <li><a href="/rules" className="hover:text-accent-primary transition-colors">Platform Rules</a></li>
              <li><a href="/trust-center" className="hover:text-accent-primary transition-colors">Trust & Verification</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="/rules" className="hover:text-accent-primary transition-colors">Risk Disclaimer</a></li>
              <li><a href="/rules" className="hover:text-accent-primary transition-colors">Terms of Engagement</a></li>
              <li><a href="/rules" className="hover:text-accent-primary transition-colors">Privacy Framework</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <GlassCard className="p-8 flex flex-col items-start gap-4" hoverEffect={true}>
      <div className="text-4xl font-black text-white/10 group-hover:text-accent-primary/30 transition-colors">{number}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </GlassCard>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="text-sm font-bold text-text-secondary hover:text-white transition-all relative group">
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-primary group-hover:w-full transition-all" />
    </a>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <GlassCard className="p-6 text-left" hoverEffect={false}>
      <p className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black mb-1">{value}</h3>
      <p className="text-[10px] text-text-muted font-medium">{sub}</p>
    </GlassCard>
  );
}

function CapabilityCard({ icon: Icon, title, desc, neon }: { icon: any; title: string; desc: string; neon?: boolean }) {
  return (
    <GlassCard className="p-10 flex flex-col items-start gap-6" neon={neon}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${neon ? 'bg-accent-cyan/10 text-accent-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'bg-accent-primary/10 text-accent-primary'}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-text-muted leading-relaxed font-medium">{desc}</p>
    </GlassCard>
  );
}

function HighlightItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/30">
        <CheckCircle2 size={12} />
      </div>
      <span className="text-sm font-bold text-text-secondary">{text}</span>
    </div>
  );
}

function RadarItem({ name, risk, type, status, success }: { name: string; risk: number; type: string; status: string; success?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {name[0]}
          </div>
          <div>
            <span className="text-sm font-bold block">{name}</span>
            <span className="text-[10px] text-text-muted font-bold tracking-wider">{type}</span>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {status}
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${risk}%` }}
          transition={{ duration: 1.5 }}
          className={`h-full ${success ? 'bg-success shadow-[0_0_10px_rgba(0,230,118,0.5)]' : 'bg-danger shadow-[0_0_10px_rgba(255,82,82,0.5)]'}`}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-text-muted font-bold">Anomaly Score</span>
        <span className="text-[10px] font-black">{risk}%</span>
      </div>
    </div>
  );
}
