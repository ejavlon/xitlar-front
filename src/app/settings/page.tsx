"use client";

import { useState, useEffect } from "react";
import { User as UserType } from "@/types/user";
import { userService } from "@/services/user.service";
import { Settings, User, Music, Bell, Palette, Moon, Sun, Save, Loader2, CheckCircle } from "lucide-react";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Account
    displayName: "",
    email: "",
    // Playback
    audioQuality: "HQ" as "MQ" | "HQ",
    crossfade: false,
    gaplessPlayback: true,
    autoPlay: true,
    normalizeVolume: false,
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    newReleases: true,
    playlistUpdates: true,
    socialActivity: false,
    // Appearance
    theme: "system" as "light" | "dark" | "system",
    compactMode: false,
    showLyrics: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        setSettings(prev => ({ ...prev, displayName: user.name }));
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-100 rounded-lg border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const sections: SettingsSection[] = [
    {
      id: "account",
      title: "Account",
      icon: <User className="w-5 h-5" />,
      children: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="displayName" className="block text-xs font-medium text-slate-500 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={settings.displayName}
                onChange={e => handleSettingChange("displayName", e.target.value)}
                className="w-full bg-white text-slate-800 text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={settings.email}
              onChange={e => handleSettingChange("email", e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all cursor-not-allowed"
              placeholder="user@example.com"
              disabled
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed from here</p>
          </div>
        </div>
      ),
    },
    {
      id: "playback",
      title: "Playback",
      icon: <Music className="w-5 h-5" />,
      children: (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Audio Quality</label>
            <div className="flex gap-3">
              {["MQ", "HQ"].map(quality => (
                <button
                  key={quality}
                  type="button"
                  onClick={() => handleSettingChange("audioQuality", quality)}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    settings.audioQuality === quality
                      ? "bg-[#365377] text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  {quality === "HQ" ? "High Quality (320 kbps)" : "Medium Quality (128 kbps)"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {[
              { key: "crossfade", label: "Crossfade", description: "Smoothly transition between tracks" },
              { key: "gaplessPlayback", label: "Gapless Playback", description: "Play tracks without silence between them" },
              { key: "autoPlay", label: "Autoplay", description: "Automatically play similar music when queue ends" },
              { key: "normalizeVolume", label: "Normalize Volume", description: "Keep volume consistent across tracks" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={e => handleSettingChange(item.key, e.target.checked)}
                  className="w-5 h-5 text-[#f59e0b] border-slate-300 rounded focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 transition-colors"
                />
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      children: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
              { key: "pushNotifications", label: "Push Notifications", description: "Receive browser notifications" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={e => handleSettingChange(item.key, e.target.checked)}
                  className="w-5 h-5 text-[#f59e0b] border-slate-300 rounded focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 transition-colors"
                />
              </label>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Notification Preferences</p>
            <div className="space-y-3">
              {[
                { key: "newReleases", label: "New Releases", description: "Notifications for new music from followed artists" },
                { key: "playlistUpdates", label: "Playlist Updates", description: "When your playlists are updated" },
                { key: "socialActivity", label: "Social Activity", description: "Likes, comments, and follows" },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={e => handleSettingChange(item.key, e.target.checked)}
                    disabled={!settings.emailNotifications && !settings.pushNotifications}
                    className="w-5 h-5 text-[#f59e0b] border-slate-300 rounded focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <Palette className="w-5 h-5" />,
      children: (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
                { value: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
                { value: "system", label: "System", icon: <Settings className="w-5 h-5" /> },
              ].map(theme => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleSettingChange("theme", theme.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme.value
                      ? "border-[#f59e0b] bg-amber-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600">
                      {theme.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{theme.label}</span>
                  </div>
                  {settings.theme === theme.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#f59e0b] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {[
              { key: "compactMode", label: "Compact Mode", description: "Reduce spacing for more content on screen" },
              { key: "showLyrics", label: "Show Lyrics", description: "Display lyrics when available" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={e => handleSettingChange(item.key, e.target.checked)}
                  className="w-5 h-5 text-[#f59e0b] border-slate-300 rounded focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 transition-colors"
                />
              </label>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#365377] hover:bg-[#2d4665] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#365377] focus:ring-offset-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-5">
        {sections.map(section => (
          <section
            key={section.id}
            id={section.id}
            className="bg-white rounded-lg border border-slate-200/80 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-[#365377]/10 flex items-center justify-center text-[#365377] shrink-0">
                {section.icon}
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">{section.title}</h2>
            </div>
            {section.children}
          </section>
        ))}
      </div>

      {/* Danger Zone */}
      <section className="bg-white rounded-lg border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Delete Account</p>
            <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all data</p>
          </div>
          <button
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-sm font-medium rounded-md transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}