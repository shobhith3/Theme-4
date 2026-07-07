"use client";

import { Bell, Check, X, Info, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function NotificationPopover() {
  const store = useStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = store.feedEvents.filter((e) => !e.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (id: string, type: string) => {
    store.markFeedEventRead(id);
    setIsOpen(false);
    
    // Simple routing based on type
    if (type === "critical" || type === "opportunity") {
      router.push("/recommendations");
    } else if (type === "warning") {
      router.push("/inventory");
    } else {
      router.push("/command-center");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertTriangle className="w-5 h-5 text-critical" />;
      case "warning": return <Package className="w-5 h-5 text-warning" />;
      case "opportunity": return <TrendingUp className="w-5 h-5 text-success" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-[6px] h-[6px] rounded-full bg-critical border border-surface" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-[14px] text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => store.markAllFeedEventsRead()}
                className="text-[12px] font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {store.feedEvents.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-text-muted">
                No notifications
              </div>
            ) : (
              <div className="flex flex-col">
                {store.feedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleNotificationClick(event.id, event.type)}
                    className={`flex items-start gap-3 p-4 text-left border-b border-border last:border-0 hover:bg-surface-hover transition-colors ${!event.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-medium text-text-primary truncate">{event.title}</span>
                        <span className="text-[11px] text-text-muted shrink-0 whitespace-nowrap ml-2">
                          {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="mt-2 text-[11px] font-medium text-text-muted flex gap-2">
                        <span>{event.itemName}</span>
                        <span>·</span>
                        <span>{event.branchName}</span>
                      </div>
                    </div>
                    {!event.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
