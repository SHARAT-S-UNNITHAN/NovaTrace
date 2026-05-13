import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  Trash2, 
  Key, 
  Shield, 
  Mail,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { format } from 'date-fns';

export default function UserManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&search=${search}`);
      return data;
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ id, isBanned }) => {
      await api.patch(`/admin/users/${id}/ban`, { isBanned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User status updated');
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all accounts across the platform.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search users by email or username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="p-3 glass rounded-xl border border-white/10">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="text-muted-foreground text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="p-6 font-medium">User</th>
                  <th className="p-6 font-medium">Plan</th>
                  <th className="p-6 font-medium">URLs</th>
                  <th className="p-6 font-medium">Joined</th>
                  <th className="p-6 font-medium">Status</th>
                  <th className="p-6 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse h-16 bg-white/5" />)
               ) : data?.data?.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                     <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {user.username[0].toUpperCase()}
                           </div>
                           <div>
                              <p className="font-bold">{user.displayName || user.username}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                           </div>
                        </div>
                     </td>
                     <td className="p-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                           user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' : 
                           user.plan === 'pro' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                        }`}>
                           {user.plan}
                        </span>
                     </td>
                     <td className="p-6 font-medium">{user._count?.urls || 0}</td>
                     <td className="p-6 text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                     </td>
                     <td className="p-6">
                        {user.isBanned ? (
                           <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase">
                              <XCircle className="w-4 h-4" /> Banned
                           </div>
                        ) : (
                           <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Active
                           </div>
                        )}
                     </td>
                     <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => banMutation.mutate({ id: user.id, isBanned: !user.isBanned })}
                             className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'}`}
                             title={user.isBanned ? "Unban User" : "Ban User"}
                           >
                              <Ban className="w-4 h-4" />
                           </button>
                           <button className="p-2 glass rounded-lg border border-white/10 hover:bg-white/10">
                              <Key className="w-4 h-4" />
                           </button>
                           <button className="p-2 glass rounded-lg border border-white/10 hover:bg-white/10 text-destructive">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         
         <div className="p-6 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
            <p className="text-sm text-muted-foreground">Showing {(page-1)*10+1} to {Math.min(page*10, data?.meta?.total || 0)} of {data?.meta?.total || 0} users</p>
            <div className="flex gap-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="px-4 py-2 glass rounded-xl border border-white/10 disabled:opacity-50"
               >
                 Previous
               </button>
               <button 
                 disabled={page >= (data?.meta?.lastPage || 1)}
                 onClick={() => setPage(p => p + 1)}
                 className="px-4 py-2 glass rounded-xl border border-white/10 disabled:opacity-50"
               >
                 Next
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
