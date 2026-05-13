import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Lock, 
  QrCode, 
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import CreateUrlModal from '../../components/CreateUrlModal';

export default function UrlManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: urls, isLoading } = useQuery({
    queryKey: ['urls'],
    queryFn: async () => {
      const { data } = await api.get('/urls');
      return data.data;
    },
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black">Links</h1>
          <p className="text-muted-foreground mt-1">Manage and track your shortened URLs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all neon-border"
        >
          <Plus className="w-5 h-5" /> Create New
        </button>
      </div>

      <CreateUrlModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => queryClient.invalidateQueries(['urls'])}
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search links..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="p-3 glass rounded-xl border border-white/10 hover:bg-white/5">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
        ) : urls?.map((url) => (
          <div key={url.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group">
            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LinkIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg truncate flex items-center gap-2">
                  {url.title || url.slug}
                  {url.password && <Lock className="w-4 h-4 text-orange-500" />}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-primary font-medium text-sm truncate">{url.shortUrl}</p>
                   <p className="text-muted-foreground text-xs truncate max-w-[200px] hidden sm:block">{url.originalUrl}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 shrink-0 w-full md:w-auto justify-between md:justify-end">
              <div className="text-center">
                <p className="text-xl font-bold">{url._count?.clicks || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Clicks</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => copyToClipboard(url.shortUrl, url.id)}
                  className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {copiedId === url.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
                <button className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <QrCode className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => window.open(url.shortUrl, '_blank')}
                  className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
