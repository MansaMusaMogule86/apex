"use client";

import { 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Webhook,
  Check,
  Moon,
  Sun,
  Layers,
  User,
} from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import { useCommandCenterShell } from "@/components/command-center/ShellContext";
import { useState } from "react";

export default function SettingsScreen() {
  const { theme, setTheme } = useCommandCenterShell();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  return (
    <PageShell>
      <div className="max-w-4xl">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workspace Settings */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-white/5">
                <User className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display text-lg text-warm-white">Workspace</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-mist mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="APEX Luxury Properties"
                  className="w-full bg-void border border-white/15 rounded-sm px-3 py-2 text-sm text-warm-white focus:border-gold/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-mist mb-2">
                  Default Market
                </label>
                <select className="w-full bg-void border border-white/15 rounded-sm px-3 py-2 text-sm text-warm-white focus:border-gold/40 focus:outline-none">
                  <option>Dubai, UAE</option>
                  <option>Abu Dhabi, UAE</option>
                  <option>Riyadh, KSA</option>
                </select>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-white/5">
                <Palette className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display text-lg text-warm-white">Appearance</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-mist mb-3">Select your preferred theme</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("obsidian")}
                  className={`flex-1 p-4 rounded-sm border transition-colors ${
                    theme === "obsidian"
                      ? "border-[rgba(110,140,255,0.5)] bg-[rgba(110,140,255,0.12)]"
                      : "border-white/15 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <Moon className="h-5 w-5 mx-auto mb-2" style={{ color: theme === "obsidian" ? "rgba(110,140,255,0.9)" : undefined }} />
                  <span className="text-xs text-titanium block">Obsidian</span>
                  <span className="text-[10px] text-mist/60 block mt-0.5 font-mono">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("carbon")}
                  className={`flex-1 p-4 rounded-sm border transition-colors ${
                    theme === "carbon"
                      ? "border-gold/50 bg-gold/10"
                      : "border-white/15 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <Layers className="h-5 w-5 mx-auto mb-2" style={{ color: theme === "carbon" ? "rgba(200,169,110,0.9)" : undefined }} />
                  <span className="text-xs text-titanium block">Carbon</span>
                  <span className="text-[10px] text-mist/60 block mt-0.5 font-mono">Warm Dark</span>
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 p-4 rounded-sm border transition-colors ${
                    theme === "light"
                      ? "border-gold/50 bg-gold/10"
                      : "border-white/15 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <Sun className="h-5 w-5 mx-auto mb-2" style={{ color: theme === "light" ? "rgba(200,169,110,0.9)" : undefined }} />
                  <span className="text-xs text-titanium block">Light</span>
                  <span className="text-[10px] text-mist/60 block mt-0.5 font-mono">Ivory</span>
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-white/5">
                <Bell className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display text-lg text-warm-white">Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: "email", label: "Email notifications", desc: "Receive daily summaries and alerts" },
                { key: "push", label: "Push notifications", desc: "Real-time alerts in browser" },
                { key: "sms", label: "SMS alerts", desc: "Critical alerts via text message" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-sm border border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/15 transition-colors"
                >
                  <div className={`
                    w-5 h-5 rounded-sm border flex items-center justify-center mt-0.5 transition-colors
                    ${notifications[item.key as keyof typeof notifications] 
                      ? "bg-gold border-gold" 
                      : "border-white/30"
                    }
                  `}>
                    {notifications[item.key as keyof typeof notifications] && (
                      <Check className="h-3 w-3 text-void" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications(prev => ({ 
                      ...prev, 
                      [item.key]: e.target.checked 
                    }))}
                  />
                  <div>
                    <p className="text-sm text-warm-white">{item.label}</p>
                    <p className="text-xs text-mist">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Integrations */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-white/5">
                <Webhook className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display text-lg text-warm-white">Integrations</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "CRM (Salesforce)", status: "Connected", icon: Database },
                { name: "Email (SendGrid)", status: "Connected", icon: Webhook },
                { name: "Analytics (Mixpanel)", status: "Pending", icon: Database },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/8 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <integration.icon className="h-4 w-4 text-mist" />
                    <span className="text-sm text-warm-white">{integration.name}</span>
                  </div>
                  <span className={`
                    text-[10px] uppercase px-2 py-0.5 rounded-sm
                    ${integration.status === "Connected" ? "bg-emerald-400/20 text-emerald-400" : ""}
                    ${integration.status === "Pending" ? "bg-risk-amber/20 text-risk-amber" : ""}
                  `}>
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-white/5">
                <Shield className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display text-lg text-warm-white">Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-mist mb-2">
                  Two-Factor Authentication
                </label>
                <div className="flex items-center justify-between p-3 rounded-sm border border-emerald-400/30 bg-emerald-400/10">
                  <span className="text-sm text-emerald-400">Enabled</span>
                  <button className="text-xs text-titanium hover:text-warm-white transition-colors">
                    Configure
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-mist mb-2">
                  API Keys
                </label>
                <div className="flex items-center justify-between p-3 rounded-sm border border-white/15 bg-void">
                  <span className="text-sm text-titanium font-mono">••••••••••••sk_live</span>
                  <button className="text-xs text-gold hover:text-gold-light transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2.5 rounded-sm bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </PageShell>
  );
}
