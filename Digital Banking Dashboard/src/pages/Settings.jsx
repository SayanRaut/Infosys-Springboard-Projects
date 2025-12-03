// src/pages/Settings.jsx
import React from "react";
import { ShieldCheck, Smartphone, Globe2 } from "lucide-react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { DEMO_USER } from "../data/demoData";

const Settings = () => {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Settings & Security"
        subtitle="Manage your profile, devices, and security controls"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5 text-sm">
          <p className="text-xs font-semibold text-slate-600 mb-3">
            Profile
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Full name
              </label>
              <input
                defaultValue={DEMO_USER.name}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Email address
              </label>
              <input
                defaultValue={DEMO_USER.email}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Phone number
              </label>
              <input
                placeholder="+1 (555) 123-4567"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              />
            </div>
            <button className="mt-2 inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-800">
              Save changes
            </button>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 text-sm">
          <p className="text-xs font-semibold text-slate-600 mb-3">
            Security
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900">
                    Two-factor authentication
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Protect your account with an extra layer of security
                  </p>
                </div>
              </div>
              <button className="text-xs text-sky-600 hover:text-sky-700">
                Manage
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Smartphone className="w-4 h-4 text-sky-500" />
                <div>
                  <p className="font-medium text-slate-900">
                    Trusted devices
                  </p>
                  <p className="text-[11px] text-slate-500">
                    View and revoke access for signed-in devices
                  </p>
                </div>
              </div>
              <button className="text-xs text-sky-600 hover:text-sky-700">
                View
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Globe2 className="w-4 h-4 text-violet-500" />
                <div>
                  <p className="font-medium text-slate-900">
                    Login alerts
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Receive alerts for new logins and risky activity
                  </p>
                </div>
              </div>
              <button className="text-xs text-sky-600 hover:text-sky-700">
                Configure
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
