import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Mail,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/50 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const PriceCard = ({ title, price, features, recommended = false }) => (
  <div className={`glass-card p-10 rounded-[3rem] border ${recommended ? 'border-primary/50 scale-105 z-10' : 'border-white/5'}`}>
    {recommended && <span className="bg-primary px-4 py-1 rounded-full text-xs font-bold mb-4 inline-block">MOST POPULAR</span>}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-5xl font-black">${price}</span>
      <span className="text-muted-foreground">/mo</span>
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${recommended ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10'}`}>
      Get Started
    </button>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left"
      >
        <span className="font-bold text-lg">{question}</span>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="pb-6 text-muted-foreground"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            V2.0 is now live with Advanced Analytics
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            The Future of <span className="text-gradient">Short Links</span> is Here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            NovaTrace provides enterprise-grade URL shortening, realtime tracking, and developer tools to power your brand's digital presence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto glass p-2 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <input 
              type="url" 
              placeholder="Paste your long link here..." 
              className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-lg"
            />
            <button className="bg-primary px-10 py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
              Shorten Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Enterprise Features</h2>
          <p className="text-muted-foreground text-lg">Everything you need to manage your links at scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Zap}
            title="Instant Shortening"
            description="Our globally distributed network ensures your links redirect with sub-millisecond latency."
            delay={0.1}
          />
          <FeatureCard 
            icon={BarChart3}
            title="Realtime Analytics"
            description="Track every click, location, and device in realtime with our advanced dashboard."
            delay={0.2}
          />
          <FeatureCard 
            icon={Shield}
            title="Brand Security"
            description="Protect your links with passwords, expiration dates, and custom domains."
            delay={0.3}
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, Scalable Pricing</h2>
            <p className="text-muted-foreground text-lg">Start for free, upgrade as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PriceCard 
              title="Starter"
              price="0"
              features={["50 Short Links/mo", "Basic Analytics", "QR Codes", "Standard Support"]}
            />
            <PriceCard 
              title="Professional"
              price="29"
              recommended={true}
              features={["Unlimited Links", "Advanced Analytics", "Custom Domains", "Password Protection", "Priority Support"]}
            />
            <PriceCard 
              title="Enterprise"
              price="99"
              features={["SLA Guarantee", "Team Management", "Full API Access", "Dedicated Account Manager", "White-label Solution"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4 flex items-center justify-center gap-4">
            <HelpCircle className="w-10 h-10 text-primary" /> FAQ
          </h2>
        </div>
        <div className="space-y-2">
          <FAQItem 
            question="Is NovaTrace free to use?"
            answer="Yes! Our Starter plan is free forever and includes basic link shortening and analytics features."
          />
          <FAQItem 
            question="Can I use my own domain?"
            answer="Absolutely. Professional and Enterprise plans allow you to connect your custom domains for branded links."
          />
          <FAQItem 
            question="How accurate are the analytics?"
            answer="Our analytics are updated in realtime and include detailed information about location, device, and referrer."
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="glass-card p-12 rounded-[3rem] border border-white/10 flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1">
             <h2 className="text-4xl font-black mb-6">Need custom features?</h2>
             <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
               Our team is here to help you build the perfect link management solution for your enterprise.
             </p>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                   </div>
                   <span className="font-medium">support@novatrace.io</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                   </div>
                   <span className="font-medium">Live Chat Available 24/7</span>
                </div>
             </div>
           </div>
           <form className="flex-1 space-y-4 w-full">
              <input type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none" />
              <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none" />
              <textarea placeholder="How can we help?" rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none"></textarea>
              <button className="w-full bg-primary py-4 rounded-2xl font-bold shadow-lg">Send Message</button>
           </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
