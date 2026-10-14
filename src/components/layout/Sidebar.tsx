import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessagesSquare, 
  Mic, 
  Hand, 
  Camera, 
  BookOpen, 
  Settings, 
  MessageSquareWarning, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layers,
  Volume2
} from 'lucide-react';
import { useAuthRole } from '../../context/AuthRoleContext';

export type NavTab = 
  | 'dashboard' 
  | 'session' 
  | 'speech-to-text' 
  | 'text-to-speech' 
  | 'text-to-sign' 
  | 'sign-to-text' 
  | 'vocabulary' 
  | 'library' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenFeedback: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenFeedback,
  isMobileOpen,
  onCloseMobile
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuthRole();

  const NAV_ITEMS = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'session' as NavTab,
      label: '2-Way Live Session',
      icon: MessagesSquare,
      badge: 'Dual View'
    },
    {
      id: 'speech-to-text' as NavTab,
      label: 'Speech to Text',
      icon: Mic,
      badge: 'Live Mic'
    },
    {
      id: 'text-to-speech' as NavTab,
      label: 'Text to Speech',
      icon: Volume2,
      badge: 'Voice TTS'
    },
    {
      id: 'text-to-sign' as NavTab,
      label: 'Text to Sign (ISL)',
      icon: Hand,
      badge: 'Verified'
    },
    {
      id: 'sign-to-text' as NavTab,
      label: 'Sign to Text',
      icon: Camera,
      badge: 'MediaPipe'
    },
    {
      id: 'vocabulary' as NavTab,
      label: 'Learn ISL',
      icon: Layers,
      badge: 'Library'
    },
    {
      id: 'library' as NavTab,
      label: 'Quick Phrase Library',
      icon: BookOpen,
      badge: 'Categories'
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Privacy',
      icon: Settings,
      badge: undefined
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-navy-900 text-white flex flex-col transition-all duration-300 ease-in-out border-r border-navy-800 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Hand className="w-5 h-5 text-teal-400" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                  SignBridge <span className="text-teal-400">AI</span>
                </span>
                <span className="text-[10px] text-navy-400 font-medium">
                  Inclusive Assistant
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold'
                    : 'text-navy-300 hover:text-white hover:bg-navy-800/80'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-navy-400 group-hover:text-teal-300'
                }`} />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-teal-700/80 text-teal-100'
                          : 'bg-navy-800 text-navy-400 group-hover:text-teal-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Floating tooltip when collapsed */}
                {collapsed && (
                  <div className="hidden group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-navy-950 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Feedback Banner */}
        <div className="p-3 border-t border-navy-800 space-y-2">
          <button
            onClick={() => {
              onOpenFeedback();
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Report Sign/Caption Issue"
          >
            <MessageSquareWarning className="w-4 h-4 text-rose-400 shrink-0" />
            {!collapsed && <span>Report Issue / Feedback</span>}
          </button>

          {!collapsed && (
            <div className="px-2 py-1 text-[10px] text-navy-400 flex items-center justify-between">
              <span>ISL Standard v2.4</span>
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" title="System operational" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
