import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Lock, Calendar, Loader2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function CreateUrlModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    originalUrl: '',
    slug: '',
    title: '',
    password: '',
    expiresAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/urls', formData);
      toast.success('Link created successfully!');
      onSuccess?.(data);
      onClose();
      setFormData({ originalUrl: '', slug: '', title: '', password: '', expiresAt: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create link');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">Create New Link</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1 text-muted-foreground">Original URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    required
                    type="url"
                    placeholder="https://very-long-link.com/with-many-params"
                    value={formData.originalUrl}
                    onChange={(e) => setFormData({...formData, originalUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1 text-muted-foreground">Custom Alias (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">nt.co/</span>
                    <input
                      type="text"
                      placeholder="my-promo"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1 text-muted-foreground">Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Spring Sale 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-2"
              >
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Password, Expiry)'}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1 text-muted-foreground">Password Protection</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="Secret123"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1 text-muted-foreground">Expiration Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="date"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={isLoading}
                className="w-full bg-primary py-5 rounded-2xl font-black text-xl shadow-xl hover:opacity-90 transition-all neon-border flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Shorten Link <LinkIcon className="w-6 h-6" /></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
