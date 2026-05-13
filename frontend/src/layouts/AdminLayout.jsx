import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Link as LinkIcon, 
  ShieldAlert, 
  Settings,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link
    to={path}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'text-muted-foreground hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </Link>
);

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 fixed h-full bg-background/50 backdrop-blur-xl z-50">
        <Link to="/admin" className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-xl">N</span>
          </div>
          <span className="font-black text-2xl tracking-tighter">NovaAdmin</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-4">Menu</div>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            path="/admin" 
            active={location.pathname === '/admin'} 
          />
          <SidebarItem 
            icon={Users} 
            label="User Management" 
            path="/admin/users" 
            active={location.pathname === '/admin/users'} 
          />
          <SidebarItem 
            icon={LinkIcon} 
            label="Global URLs" 
            path="/admin/urls" 
            active={location.pathname === '/admin/urls'} 
          />
          <SidebarItem 
            icon={ShieldAlert} 
            label="Abuse Reports" 
            path="/admin/reports" 
            active={location.pathname === '/admin/reports'} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
           <SidebarItem 
            icon={Settings} 
            label="System Settings" 
            path="/admin/settings" 
            active={location.pathname === '/admin/settings'} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-background/30 backdrop-blur-md sticky top-0 z-40">
           <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Admin Panel</div>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="relative p-2 text-muted-foreground hover:text-white transition-colors">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                 <div className="text-right">
                    <p className="text-sm font-bold">{user?.displayName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role}</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 border border-white/10" />
              </div>
           </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
