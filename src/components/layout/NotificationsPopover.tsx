import React, { useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/formatters';
import { ShoppingBag, AlertTriangle, Users, Bell, Check } from 'lucide-react';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAdmin();
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-[#18542a]" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-[#f96015]" />;
      case 'customer':
        return <Users className="w-4 h-4 text-[#9abc05]" />;
      default:
        return <Bell className="w-4 h-4 text-[#5a6e54]" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#dfd5bf] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#dfd5bf] bg-[#faf5ea]">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-[#103b1d]">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-[#18542a] text-[#ffc926] rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead()}
            className="text-xs text-[#18542a] hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#dfd5bf]/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#5a6e54]">
            No notifications at this time
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.link) {
                  navigate(item.link);
                  onClose();
                }
              }}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#faf5ea] transition-colors cursor-pointer text-left ${
                !item.read ? 'bg-[#f3e8cc]/40' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-[#dfd5bf] shrink-0 mt-0.5 shadow-2xs">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-[#103b1d] truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[#5a6e54] shrink-0">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-[#5a6e54] leading-snug line-clamp-2">
                  {item.message}
                </p>
              </div>
              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-[#d52518] shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 bg-[#faf5ea] border-t border-[#dfd5bf] text-center">
        <span className="text-[11px] text-[#5a6e54] font-medium">
          Simulated alerts for store operations
        </span>
      </div>
    </div>
  );
};
