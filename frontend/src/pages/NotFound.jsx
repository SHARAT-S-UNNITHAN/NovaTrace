import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 className="text-9xl font-black text-white/10 select-none">404</h1>
        <div className="-mt-16">
          <h2 className="text-4xl font-bold mb-4">Lost in Space?</h2>
          <p className="text-muted-foreground text-xl mb-12 max-w-md mx-auto">
            The page you're looking for has been moved to another galaxy or never existed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto px-8 py-4 bg-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all neon-border">
              <Home className="w-5 h-5" /> Go Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-4 glass rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
