import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Terminal,
  ExternalLink,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { format } from 'date-fns';

export default function Developer() {
  const [showKey, setShowKey] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await api.get('/keys');
      return data;
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      const { data } = await api.post('/keys', { name });
      return data;
    },
    onSuccess: (data) => {
      setNewKey(data.key);
      queryClient.invalidateQueries(['api-keys']);
      toast.success('API Key generated successfully!');
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['api-keys']);
      toast.success('API Key revoked.');
    },
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black">Developer Portal</h1>
        <p className="text-muted-foreground mt-1">Integrate NovaTrace into your own applications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Key Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> API Keys
            </h2>
            <button 
              onClick={() => {
                const name = prompt('Enter a name for this key:');
                if (name) createKeyMutation.mutate(name);
              }}
              className="px-4 py-2 bg-primary rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" /> Generate New Key
            </button>
          </div>

          {newKey && (
            <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="w-5 h-5" /> Save your API key
              </div>
              <p className="text-sm">For security, we only show this key once. Copy it now!</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={newKey} 
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
                />
                <button 
                  onClick={() => copyToClipboard(newKey, 'new')}
                  className="p-2 bg-primary rounded-lg"
                >
                  {copiedId === 'new' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setNewKey(null)}
                  className="px-4 py-2 glass rounded-lg text-sm font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ) : keys?.map((key) => (
              <div key={key.id} className="glass-card p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold">{key.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {key.keyPrefix}••••••••••••••••••••••••
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Requests</p>
                    <p className="font-bold">{key.requestCount}</p>
                  </div>
                  <button 
                    onClick={() => deleteKeyMutation.mutate(key.id)}
                    className="p-2 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation / Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" /> Documentation
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Learn how to use our REST API to shorten links programmatically.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary hover:underline cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Authentication
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> Shorten URL
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> Get Analytics
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> List URLs
              </li>
            </ul>
            <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
              Full API Reference
            </button>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 to-purple-600/10">
             <h3 className="font-bold mb-2">Need help?</h3>
             <p className="text-sm text-muted-foreground">
               Our developer community is here to help you build better links.
             </p>
             <button className="mt-4 text-sm font-bold text-primary hover:underline">
               Join Discord Community
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
