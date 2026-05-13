import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  MousePointer2, 
  Globe2, 
  Link as LinkIcon,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function PublicAnalytics() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['public-analytics', slug],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/public/${slug}`);
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-widest text-xs">
               <Activity className="w-4 h-4" /> Public Analytics Preview
            </div>
            <h1 className="text-4xl font-black mb-2">nt.co/{slug}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
               <LinkIcon className="w-4 h-4" /> {data?.originalUrl}
            </p>
          </div>
          <div className="flex gap-4">
             <div className="glass px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                <p className="text-3xl font-black">{data?.totalClicks}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Clicks</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 h-[400px]">
              <h3 className="text-xl font-bold mb-8">Click Timeline</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.timeline || []}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-3xl border border-white/5">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-primary" /> Top Locations
                 </h3>
                 <div className="space-y-4">
                    {data?.countries?.map((c, i) => (
                       <div key={i} className="flex justify-between items-center">
                          <span className="font-medium">{c.name}</span>
                          <span className="font-bold">{c.value}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Recent Clicks
                 </h3>
                 <div className="space-y-4">
                    {data?.recentClicks?.map((c, i) => (
                       <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{format(new Date(c.clickedAt), 'MMM dd, HH:mm')}</span>
                          <span className="font-bold">{c.country}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Activity(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
