"use client";

import { 
  LayoutDashboard, 
  Coins, 
  History, 
  Settings, 
  Users, 
  LogOut, 
  Shield,
  Menu as MenuIcon,
  X as CloseIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  onLogout: () => void;
  user: any;
}

export function AdminSidebar({ onLogout, user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Token Management", icon: Coins, path: "/admin/tokens" },
    { name: "Transactions", icon: History, path: "/admin/transactions" },
    { name: "Admin Settings", icon: Settings, path: "/admin/settings" },
    { name: "User Base", icon: Users, path: "/admin/users" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
      >
        {isOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-[var(--foreground)] leading-none text-lg">Admin</h2>
                <p className="text-[var(--muted)] text-xs mt-1">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-500 font-bold border border-blue-500/20 shadow-sm" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]/50 border border-transparent"
                  }`}
                >
                  <item.icon size={20} className={isActive ? "text-blue-500" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"} />
                  <span className="text-sm">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20">
                {user?.email?.[0].toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{user?.displayName || "Admin User"}</p>
                <p className="text-[10px] text-[var(--muted)] truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
