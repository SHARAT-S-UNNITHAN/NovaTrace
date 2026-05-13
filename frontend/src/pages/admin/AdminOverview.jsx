import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Link as LinkIcon, 
  MousePointer2, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const StatBox = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <p className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black">{value}</h3>
      <div className="flex items-center gap-1 text-xs text-green-500 mt-4">
        <ArrowUpRight className="w-3 h-3" />
        <span className="font-bold">+12.5%</span>
        <span className="text-muted-foreground">vs last week</span>
      </div>
    </div>
  </div>
);

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform-wide statistics and system health.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-500/20">
              <ShieldCheck className="w-4 h-4" /> System Online
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox 
          title="Total Users" 
          value={data?.stats?.totalUsers || 0} 
          icon={Users} 
          color="text-blue-500" 
        />
        <StatBox 
          title="Global URLs" 
          value={data?.stats?.totalUrls || 0} 
          icon={LinkIcon} 
          color="text-primary" 
        />
        <StatBox 
          title="Total Clicks" 
          value={data?.stats?.totalClicks || 0} 
          icon={MousePointer2} 
          color="text-orange-500" 
        />
        <StatBox 
          title="Active Users" 
          value={data?.stats?.activeUsers24h || 0} 
          icon={Activity} 
          color="text-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Recent Registrations</h3>
            <div className="space-y-4">
               {data?.recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                           {u.username[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="font-bold">{u.username}</p>
                           <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-medium">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{u.role}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass-card p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Server Status</h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">CPU Usage</span>
                     <span className="font-bold">12%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[12%]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">RAM Usage</span>
                     <span className="font-bold">45%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500 w-[45%]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Disk Space</span>
                     <span className="font-bold">8%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[8%]" />
                  </div>
               </div>
               <button className="w-full mt-4 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                  Full System Health
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
