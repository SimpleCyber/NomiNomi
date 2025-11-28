"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Layout,
  Tv,
  BarChart2,
  PlusCircle,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  Coins,
  CirclePoundSterling,
  BitcoinIcon,
  Home,
  Sun,
  Moon,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebarCollapsed");
    const collapsed = savedState === "true";

    if (savedState !== null) {
      setIsCollapsed(collapsed);
    }

    // Set initial CSS variable
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "4rem" : "16rem",
    );
    setIsLoaded(true);
  }, []);

  // Update CSS variable when state changes
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "4rem" : "16rem",
      );
    }
  }, [isCollapsed, isLoaded]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Live stream", icon: Tv, href: "/livestream" },
    { name: "Chat Friends", icon: MessageCircle, href: "#" },
    { name: "Swap Coins", icon: RefreshCcw, href: "/swap" },
    { name: "My Profile", icon: User, href: "#" },
    { name: "Create coin", icon: PlusCircle, href: "#" },
  ];

  const bottomItems = [
    { name: "Support", icon: HelpCircle, href: "/support" },
    // { name: "Profile", icon: User, href: "/profile" },
  ];

  // Prevent hydration mismatch by only rendering after client-side load
  if (!isLoaded || !mounted) {
    return null;
  }

  return (
    <div
      className={`
        hidden md:flex flex-col fixed top-0 left-0 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header / Toggle */}
      <div
        className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} p-4 h-16 border-b border-[var(--sidebar-border)]`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <img src="/image.png" alt="" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)] whitespace-nowrap overflow-hidden">
              NomiNomi
            </span>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            onClick={toggleSidebar}
          >
            <img
              src="/image.png"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-4 flex flex-col gap-2 px-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 p-2 rounded-lg transition-colors relative
                ${
                  isActive
                    ? "bg-blue-500/10 text-blue-500"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }
              `}
            >
              <div className="min-w-[24px] flex justify-center">
                <item.icon size={20} />
              </div>

              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden text-sm font-medium">
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-2 border-t border-[var(--sidebar-border)] flex flex-col gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative w-full"
        >
          <div className="min-w-[24px] flex justify-center">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </div>

          {!isCollapsed && (
            <span className="whitespace-nowrap overflow-hidden text-sm font-medium">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </div>
          )}
        </button>

        {bottomItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative"
          >
            <div className="min-w-[24px] flex justify-center">
              <item.icon size={20} />
            </div>

            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden text-sm font-medium">
                {item.name}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
