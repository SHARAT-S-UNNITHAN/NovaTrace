import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Globe2, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Search,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [urlId, setUrlId] = useState('');

  const { data: devices } = useQuery({
    queryKey: ['analytics-devices', urlId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/devices${urlId ? `?urlId=${urlId}` : ''}`);
      return data;
    },
  });

  const { data: clicks } = useQuery({
    queryKey: ['analytics-clicks-full', urlId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/clicks?period=30d${urlId ? `&urlId=${urlId}` : ''}`);
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gradient">Realtime Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your link performance and audience data.</p>
        </div>
        <div className="flex gap-4">
           <div className="glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last 30 Days</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Click Distribution Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5 h-[500px] flex flex-col">
           <h3 className="text-xl font-bold mb-8">Click Distribution</h3>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={clicks || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                 <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                 />
                 <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col h-[500px]">
           <h3 className="text-xl font-bold mb-8">Device Types</h3>
           <div className="flex-1 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={devices || []}
                   innerRadius={80}
                   outerRadius={120}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {devices?.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black">{devices?.reduce((acc, curr) => acc + curr.value, 0) || 0}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Total Clicks</span>
             </div>
           </div>
           <div className="mt-8 space-y-3">
              {devices?.map((d, i) => (
                 <div key={d.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                       <span className="capitalize">{d.name}</span>
                    </div>
                    <span className="font-bold">{d.value}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Referral Sources Table */}
      <div className="glass-card p-8 rounded-3xl border border-white/5">
         <h3 className="text-xl font-bold mb-8">Top Referral Sources</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-muted-foreground text-xs uppercase tracking-widest border-b border-white/5">
                     <th className="pb-4 font-medium">Source</th>
                     <th className="pb-4 font-medium">Clicks</th>
                     <th className="pb-4 font-medium">Growth</th>
                     <th className="pb-4 font-medium text-right">Activity</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Google', clicks: 2450, growth: '+12.5%', color: 'text-blue-400' },
                    { name: 'Twitter / X', clicks: 1200, growth: '+4.2%', color: 'text-sky-400' },
                    { name: 'LinkedIn', clicks: 890, growth: '+22.1%', color: 'text-indigo-400' },
                    { name: 'Direct / Email', clicks: 450, growth: '-2.4%', color: 'text-gray-400' },
                  ].map((source) => (
                    <tr key={source.name} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Globe2 className="w-4 h-4" />
                             </div>
                             <span className="font-bold">{source.name}</span>
                          </div>
                       </td>
                       <td className="py-4 font-medium">{source.clicks.toLocaleString()}</td>
                       <td className={`py-4 font-medium ${source.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {source.growth}
                       </td>
                       <td className="py-4 text-right">
                          <div className="inline-flex h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{width: '65%'}} />
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
