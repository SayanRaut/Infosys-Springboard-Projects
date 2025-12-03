import React, { useState } from 'react';
import { User, Mail, Smartphone, Settings, ShieldCheck, Bell } from 'lucide-react';
import { Button, Input, SpotlightCard } from '../components/UI';
import { api } from '../utils/mockApi';

const Profile = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await api.updateProfile(form);
    onUpdateUser(res.user);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
      
      <SpotlightCard>
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={user.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" alt="Avatar" />
              <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                <Settings size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                Premium Member
              </span>
            </div>
          </div>
          <Button variant={isEditing ? "secondary" : "primary"} onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            value={form.name} 
            icon={User}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <Input 
            label="Email Address" 
            value={form.email} 
            icon={Mail}
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            value={form.phone || ''} 
            icon={Smartphone}
            onChange={e => setForm({...form, phone: e.target.value})}
          />
        </div>

        {isEditing && (
          <div className="mt-8 flex justify-end">
             <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
          </div>
        )}
      </SpotlightCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpotlightCard>
          <div className="flex items-center gap-3 mb-4 text-slate-900">
             <ShieldCheck className="text-indigo-600" />
             <h3 className="font-bold">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Two-Factor Auth</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
               <span className="text-sm font-medium">Change Password</span>
               <button className="text-xs font-bold text-indigo-600 uppercase">Update</button>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <div className="flex items-center gap-3 mb-4 text-slate-900">
             <Bell className="text-indigo-600" />
             <h3 className="font-bold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Email Alerts</span>
              <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Push Notifications</span>
              <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Monthly Reports</span>
              <input type="checkbox" className="accent-indigo-600 w-4 h-4" />
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default Profile;