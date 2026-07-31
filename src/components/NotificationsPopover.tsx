import React from 'react';
import { Bell, CheckCheck, Tag, ShoppingBag, Info, X } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-amber-500" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-neutral-50 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Notifications</h4>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-zinc-850">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                item.unread
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-zinc-800 flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{item.title}</h5>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-zinc-400 leading-snug">{item.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400">No notifications</div>
        )}
      </div>
    </div>
  );
};
