"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    registeredUsers: 0,
    totalMessages: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedAuth = localStorage.getItem("studyit_admin_auth");
    if (savedAuth === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
      setIsAuthorized(true);
      localStorage.setItem("studyit_admin_auth", passcode);
    } else {
      setError("Incorrect passcode. Access Denied.");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
    }
  }, [isAuthorized]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch Users
      const { data: usersData, count: totalCount } = await supabase
        .from("users")
        .select("*", { count: "exact" });
      
      const registeredCount = usersData?.filter(u => u.is_registered).length || 0;

      // Fetch Message Count
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: totalCount || 0,
        registeredUsers: registeredCount,
        totalMessages: messagesCount || 0,
      });
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#030303] overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-mesh" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-mesh animate-pulse-slow" />
        </div>

        <div className="relative z-10 w-full max-w-md glass p-10 rounded-[2.5rem] space-y-8 animate-float">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tighter">Admin Portal</h1>
            <p className="text-gray-400">Restricted Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 ml-1">Enter Passcode</label>
              <input
                type="password"
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white text-center text-2xl tracking-[1em]"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              Verify Identity
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#030303] text-white p-6 md:p-12 relative overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter glow-text">Dashboard</h1>
            <p className="text-gray-400 text-lg mt-1">Real-time bot performance metrics.</p>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={fetchStats}
                className="px-6 py-3 glass hover:bg-white/5 rounded-xl border border-white/10 transition-all text-sm font-semibold"
            >
              Refresh Stats
            </button>
            <button 
                onClick={() => {
                    localStorage.removeItem("studyit_admin_auth");
                    setIsAuthorized(false);
                }}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-3xl space-y-2 border border-white/10">
            <p className="text-gray-500 font-medium">Total Users</p>
            <h2 className="text-5xl font-bold text-indigo-400">{loading ? "..." : stats.totalUsers}</h2>
          </div>
          <div className="glass-card p-8 rounded-3xl space-y-2 border border-white/10">
            <p className="text-gray-500 font-medium">Pro Users</p>
            <h2 className="text-5xl font-bold text-purple-400">{loading ? "..." : stats.registeredUsers}</h2>
          </div>
          <div className="glass-card p-8 rounded-3xl space-y-2 border border-white/10">
            <p className="text-gray-500 font-medium">AI Inquiries</p>
            <h2 className="text-5xl font-bold text-blue-400">{loading ? "..." : stats.totalMessages}</h2>
          </div>
        </div>

        {/* User Table */}
        <div className="glass rounded-[2rem] overflow-hidden border border-white/10">
          <div className="p-8 border-b border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-bold">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-8 py-5">JID / ID</th>
                  <th className="px-8 py-5">Tier</th>
                  <th className="px-8 py-5">Usage</th>
                  <th className="px-8 py-5">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.jid} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-5">
                      <div className="font-semibold text-white">{user.phone || user.jid.split('@')[0]}</div>
                      <div className="text-xs text-gray-600">{user.jid}</div>
                    </td>
                    <td className="px-8 py-5">
                      {user.is_registered ? (
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                          PRO
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/10 text-gray-500 text-xs font-bold rounded-full border border-white/10">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-gray-400">{user.daily_usage} msgs</td>
                    <td className="px-8 py-5 text-gray-500 text-sm">{user.last_usage_date || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
