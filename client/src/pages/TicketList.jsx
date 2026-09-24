import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';
import {
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import './TicketList.css';

const TicketList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [searchParams]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      };
      const { data } = await ticketAPI.getAll(params);
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', category: '', search: '' });
    setSearchParams({});
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      fees: '💰 Fees', attendance: '📋 Attendance', id_card: '🪪 ID Card',
      documents: '📄 Documents', certificates: '🎓 Certificates', hostel: '🏠 Hostel',
      library: '📚 Library', exam: '📝 Exam', other: '📌 Other',
    };
    return labels[cat] || cat;
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="ticket-list-page">
      {/* Header */}
      <div className="ticket-list-page__header animate-fade-in">
        <div>
          <h2 className="ticket-list-page__title">
            {user?.role === 'student' ? 'My Requests' : 'All Tickets'}
          </h2>
          <p className="ticket-list-page__count">{pagination.total} ticket{pagination.total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="ticket-list-page__actions">
          <button
            className={`filter-toggle ${showFilters ? 'filter-toggle--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineFilter />
            Filters
            {hasActiveFilters && <span className="filter-toggle__badge"></span>}
          </button>
          {(user?.role === 'student' || user?.role === 'admin') && (
            <Link to="/tickets/new" className="btn-primary" id="create-ticket-btn">
              <HiOutlinePlusCircle />
              New Request
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="ticket-filters animate-fade-in">
          <div className="ticket-filters__search">
            <HiOutlineSearch className="ticket-filters__search-icon" />
            <input
              type="text"
              className="ticket-filters__search-input"
              placeholder="Search by title or ticket number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="ticket-filters__selects">
            <select
              className="form-select form-select--compact"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_student">Pending Student</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="form-select form-select--compact"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="form-select form-select--compact"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="fees">Fees</option>
              <option value="attendance">Attendance</option>
              <option value="id_card">ID Card</option>
              <option value="documents">Documents</option>
              <option value="certificates">Certificates</option>
              <option value="hostel">Hostel</option>
              <option value="library">Library</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
            {hasActiveFilters && (
              <button className="filter-clear" onClick={clearFilters}>Clear All</button>
            )}
          </div>
        </div>
      )}

      {/* Ticket Cards */}
      {loading ? (
        <div className="ticket-list-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ticket-card-skeleton">
              <div className="skeleton skeleton--title"></div>
              <div className="skeleton skeleton--text"></div>
              <div className="skeleton skeleton--badges"></div>
            </div>
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <>
          <div className="ticket-grid">
            {tickets.map((ticket, index) => {
              const statusBadge = getStatusBadge(ticket.status);
              const priorityBadge = getPriorityBadge(ticket.priority);
              return (
                <Link
                  to={`/tickets/${ticket._id}`}
                  key={ticket._id}
                  className={`ticket-card animate-fade-in-up stagger-${(index % 6) + 1}`}
                  style={{ opacity: 0 }}
                >
                  <div className="ticket-card__header">
                    <span className="ticket-card__number">{ticket.ticketNumber}</span>
                    <span className={`badge ${priorityBadge.className}`}>{priorityBadge.label}</span>
                  </div>
                  <h3 className="ticket-card__title">{ticket.title}</h3>
                  <p className="ticket-card__desc">{ticket.description}</p>
                  <div className="ticket-card__footer">
                    <div className="ticket-card__tags">
                      <span className="ticket-card__category">{getCategoryLabel(ticket.category)}</span>
                      <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
                    </div>
                    <span className="ticket-card__date">{formatDate(ticket.createdAt)}</span>
                  </div>
                  {ticket.slaBreached && (
                    <div className="ticket-card__sla-breach">⚠️ SLA Breached</div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <HiOutlineChevronLeft />
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`pagination__btn ${pagination.page === i + 1 ? 'pagination__btn--active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination__btn"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <HiOutlineChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="ticket-list-empty">
          <div className="ticket-list-empty__icon">📋</div>
          <h3>No tickets found</h3>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : user?.role === 'student'
              ? 'You haven\'t created any requests yet'
              : 'No tickets to display'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketList;
