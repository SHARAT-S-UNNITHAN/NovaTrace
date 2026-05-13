import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-4xl font-black">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'billing', label: 'Billing', icon: CreditCard },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                item.id === 'profile' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-8">
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <button
                disabled={isLoading}
                className="bg-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all neon-border"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </form>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/5 border-destructive/20 bg-destructive/5">
            <h3 className="text-xl font-bold mb-2 text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-6 py-3 bg-destructive rounded-xl font-bold hover:bg-destructive/80 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
