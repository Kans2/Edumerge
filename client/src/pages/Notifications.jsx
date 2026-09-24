import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineTicket,
  HiOutlineChatAlt,
  HiOutlineExclamationCircle,
  HiOutlineLightningBolt,
  HiOutlineUserAdd,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();

    const handleNewNotification = (e) => {
      const newNotif = e.detail;
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener('new_notification', handleNewNotification);

    return () => {
      window.removeEventListener('new_notification', handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClick = (notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
    if (notification.ticketId) {
      navigate(`/tickets/${notification.ticketId._id || notification.ticketId}`);
    }
  };

  const getIcon = (type) => {
    const map = {
      assignment: <HiOutlineUserAdd className="notif-icon notif-icon--assignment" />,
      status_update: <HiOutlineLightningBolt className="notif-icon notif-icon--status" />,
      comment: <HiOutlineChatAlt className="notif-icon notif-icon--comment" />,
      sla_warning: <HiOutlineExclamationCircle className="notif-icon notif-icon--warning" />,
      sla_breach: <HiOutlineExclamationCircle className="notif-icon notif-icon--breach" />,
      escalation: <HiOutlineLightningBolt className="notif-icon notif-icon--escalation" />,
    };
    return map[type] || <HiOutlineBell className="notif-icon" />;
  };

  const formatTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = (now - d) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page animate-fade-in">
      <div className="notifications-page__header">
        <div>
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <p className="notifications-page__unread">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            <HiOutlineCheckCircle />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notif, index) => (
            <div
              key={notif._id}
              className={`notif-item ${!notif.isRead ? 'notif-item--unread' : ''} animate-fade-in stagger-${(index % 6) + 1}`}
              onClick={() => handleClick(notif)}
              style={{ opacity: 0 }}
            >
              <div className="notif-item__icon-wrap">{getIcon(notif.type)}</div>
              <div className="notif-item__content">
                <p className="notif-item__message">{notif.message}</p>
                {notif.ticketId?.ticketNumber && (
                  <span className="notif-item__ticket">
                    <HiOutlineTicket /> {notif.ticketId.ticketNumber}
                  </span>
                )}
              </div>
              <div className="notif-item__meta">
                <span className="notif-item__time">{formatTime(notif.createdAt)}</span>
                {!notif.isRead && <span className="notif-item__dot"></span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="notifications-empty">
          <HiOutlineBell className="notifications-empty__icon" />
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
