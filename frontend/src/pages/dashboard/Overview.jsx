import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, 
  MousePointer2, 
  Link as LinkIcon, 
  Users,
  ArrowUpRight,
  ArrowDownRight
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
import api from '../../services/api';
import CreateUrlModal from '../../components/CreateUrlModal';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="glass-card p-6 rounded-2xl border border-white/5">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg bg-opacity-20", color)}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
      {change && (
        <div className={cn("flex items-center text-xs font-bold px-2 py-1 rounded-full", change > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
          {change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
    <p className="text-3xl font-black mt-1">{value}</p>
  </div>
);

// Helper for class merging
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Overview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data;
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['analytics-clicks'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/clicks?period=7d');
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your links.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all neon-border"
        >
          <LinkIcon className="w-5 h-5" /> Create New Link
        </button>
      </div>

      <CreateUrlModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          refetchSummary();
          queryClient.invalidateQueries(['urls']);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Links" 
          value={summary?.totalUrls || 0} 
          change={12} 
          icon={LinkIcon} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Clicks" 
          value={summary?.totalClicks || 0} 
          change={24} 
          icon={MousePointer2} 
          color="bg-primary" 
        />
        <StatCard 
          title="Clicks (24h)" 
          value={summary?.clicks24h || 0} 
          change={-5} 
          icon={TrendingUp} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Conversion Rate" 
          value="4.2%" 
          change={8} 
          icon={Users} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Traffic Overview</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-sm">New click from <span className="font-bold">United States</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">2 minutes ago on nt.co/promo</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
