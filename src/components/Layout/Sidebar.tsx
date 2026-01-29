import React, { memo } from 'react';
import { Cpu, PlusCircle, Settings, MessageSquare, LogOut } from 'lucide-react';

interface SidebarProps {
  onNewTask: () => void;
  onOpenSettings: () => void;
}

const recentItems = ['Status Saver App', 'Meditation Guide', 'Finance Tracker Pro'];
const previousItems = ['Calorie Counter UI', 'Social Media Planner', 'RPG Game Icon'];

export const Sidebar: React.FC<SidebarProps> = memo(function Sidebar({
  onNewTask,
  onOpenSettings,
}) {
  return (
    <aside
      className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 shrink-0 shadow-[1px_0_0_rgba(0,0,0,0.05)] z-10"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Cpu className="text-gray-900" size={24} aria-hidden="true" />
        <span className="font-bold tracking-tight">Architect AI</span>
      </div>

      {/* Recent Items */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        <nav aria-label="Recently generated">
          <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Recently Generated
          </h4>
          <ul className="space-y-1">
            {recentItems.map((item) => (
              <li key={item}>
                <button
                  className="sidebar-item w-full text-left"
                  aria-label={`Open ${item}`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Previous 7 days">
          <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Previous 7 Days
          </h4>
          <ul className="space-y-1">
            {previousItems.map((item) => (
              <li key={item}>
                <button
                  className="sidebar-item w-full text-left"
                  aria-label={`Open ${item}`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
        <button
          onClick={onNewTask}
          className="sidebar-item w-full font-bold text-indigo-600 hover:bg-indigo-50"
          aria-label="Start new task"
        >
          <PlusCircle size={16} aria-hidden="true" /> New Task
        </button>

        <button
          onClick={onOpenSettings}
          className="sidebar-item w-full"
          aria-label="Open settings"
        >
          <Settings size={16} aria-hidden="true" /> Settings
        </button>

        <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full text-xs font-bold text-indigo-600 hover:text-indigo-700"
            aria-label="Join Discord community (opens in new tab)"
          >
            <MessageSquare size={14} aria-hidden="true" /> Join Discord
          </a>
        </div>

        <button
          className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
          aria-label="Sign out"
        >
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </div>
    </aside>
  );
});
