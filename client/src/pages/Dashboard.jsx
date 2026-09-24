import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, ticketAPI } from '../services/api';
import {
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineFire,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        dashboardAPI.getStats(),
        ticketAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setStats(statsRes.data.data);
      setRecentTickets(ticketsRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      label: 'Open Tickets',
      value: stats.openTickets,
      icon: HiOutlineTicket,
      color: 'blue',
      trend: null,
    },
    {
      label: 'In Progress',
      value: stats.inProgressTickets,
      icon: HiOutlineClock,
      color: 'yellow',
      trend: null,
    },
    {
      label: 'Resolved',
      value: stats.resolvedTickets,
      icon: HiOutlineCheckCircle,
      color: 'green',
      trend: null,
    },
    {
      label: 'SLA Breached',
      value: stats.slaBreachedTickets,
      icon: HiOutlineExclamation,
      color: 'red',
      trend: null,
    },
    {
      label: 'Critical',
      value: stats.criticalTickets,
      icon: HiOutlineFire,
      color: 'orange',
      trend: null,
    },
    {
      label: 'Avg Resolution',
      value: `${stats.avgResolutionHours}h`,
      icon: HiOutlineTrendingUp,
      color: 'purple',
      trend: null,
    },
  ] : [];

  const getStatusBadge = (status) => {
    const map = {
      open: { label: 'Open', className: 'status--open' },
      in_progress: { label: 'In Progress', className: 'status--progress' },
      pending_student: { label: 'Pending', className: 'status--pending' },
      pending_approval: { label: 'Approval', className: 'status--pending' },
      resolved: { label: 'Resolved', className: 'status--resolved' },
      closed: { label: 'Closed', className: 'status--closed' },
      reopened: { label: 'Reopened', className: 'status--reopened' },
    };
    return map[status] || { label: status, className: '' };
  };

  const getPriorityBadge = (priority) => {
    const map = {
      low: { label: 'Low', className: 'priority--low' },
      medium: { label: 'Medium', className: 'priority--medium' },
      high: { label: 'High', className: 'priority--high' },
      critical: { label: 'Critical', className: 'priority--critical' },
    };
    return map[priority] || { label: priority, className: '' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      fees: '💰 Fees',
      attendance: '📋 Attendance',
      id_card: '🪪 ID Card',
      documents: '📄 Documents',
      certificates: '🎓 Certificates',
      hostel: '🏠 Hostel',
      library: '📚 Library',
      exam: '📝 Exam',
      other: '📌 Other',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome animate-fade-in">
        <div>
          <h2 className="dashboard__greeting">
            Welcome back, <span className="dashboard__name">{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="dashboard__welcome-text">
            Here's an overview of your {user?.role === 'student' ? 'requests' : 'tickets'} today
          </p>
        </div>
        {(user?.role === 'student' || user?.role === 'admin') && (
          <Link to="/tickets/new" className="dashboard__cta" id="new-ticket-cta">
            <HiOutlinePlusCircle />
            New Request
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`stat-card stat-card--${card.color} animate-fade-in-up stagger-${index + 1}`}
          >
            <div className="stat-card__icon-wrap">
              <card.icon className="stat-card__icon" />
            </div>
            <div className="stat-card__info">
              <p className="stat-card__value">{card.value}</p>
              <p className="stat-card__label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="dashboard__section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="dashboard__section-header">
          <h3 className="dashboard__section-title">Recent Tickets</h3>
          <Link to="/tickets" className="dashboard__section-link">
            View All <HiOutlineArrowRight />
          </Link>
        </div>

        {recentTickets.length > 0 ? (
          <div className="dashboard__ticket-list">
            {recentTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const priorityBadge = getPriorityBadge(ticket.priority);
              return (
                <Link
                  to={`/tickets/${ticket._id}`}
                  key={ticket._id}
                  className="ticket-row"
                >
                  <div className="ticket-row__main">
                    <span className="ticket-row__number">{ticket.ticketNumber}</span>
                    <span className="ticket-row__title">{ticket.title}</span>
                  </div>
                  <div className="ticket-row__meta">
                    <span className="ticket-row__category">{getCategoryLabel(ticket.category)}</span>
                    <span className={`badge ${priorityBadge.className}`}>{priorityBadge.label}</span>
                    <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
                    <span className="ticket-row__date">{formatDate(ticket.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="dashboard__empty">
            <HiOutlineTicket className="dashboard__empty-icon" />
            <p>No tickets yet</p>
            {user?.role === 'student' && (
              <Link to="/tickets/new" className="dashboard__empty-link">
                Create your first request
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
