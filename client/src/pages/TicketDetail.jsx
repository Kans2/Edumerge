import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlinePaperClip,
  HiOutlineChatAlt2,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status update (staff/admin)
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const [ticketRes, activityRes] = await Promise.all([
        ticketAPI.getById(id),
        ticketAPI.getActivities(id),
      ]);
      setTicket(ticketRes.data.data);
      setActivities(activityRes.data.data);
      setNewStatus(ticketRes.data.data.status);
    } catch (error) {
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const [files, setFiles] = useState([]);
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() && files.length === 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('comment', comment);
      formData.append('isInternal', isInternal);
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      await ticketAPI.addComment(id, formData);
      setComment('');
      setFiles([]);
      toast.success('Comment added');
      loadTicket();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await ticketAPI.update(id, { status });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      loadTicket();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    const map = {
      open: 'status--open', in_progress: 'status--progress',
      pending_student: 'status--pending', pending_approval: 'status--pending',
      resolved: 'status--resolved', closed: 'status--closed', reopened: 'status--reopened',
    };
    return map[status] || '';
  };

  const getPriorityClass = (priority) => {
    const map = {
      low: 'priority--low', medium: 'priority--medium',
      high: 'priority--high', critical: 'priority--critical',
    };
    return map[priority] || '';
  };

  const getActivityIcon = (action) => {
    const map = {
      created: '🆕', status_changed: '🔄', priority_changed: '⚡',
      assigned: '👤', commented: '💬', attachment_added: '📎',
      escalated: '🔺', sla_breached: '⚠️', reopened: '🔃',
      resolved: '✅', closed: '🔒',
    };
    return map[action] || '📌';
  };

  const getActivityMessage = (activity) => {
    switch (activity.action) {
      case 'created': return 'created this ticket';
      case 'status_changed': return `changed status from ${activity.oldValue} → ${activity.newValue}`;
      case 'priority_changed': return `changed priority from ${activity.oldValue} → ${activity.newValue}`;
      case 'assigned': return 'assigned this ticket';
      case 'commented': return null; // Handled separately
      case 'resolved': return 'marked as resolved';
      case 'closed': return 'closed this ticket';
      case 'reopened': return 'reopened this ticket';
      default: return activity.action.replace('_', ' ');
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      fees: '💰 Fees', attendance: '📋 Attendance', id_card: '🪪 ID Card',
      documents: '📄 Documents', certificates: '🎓 Certificates', hostel: '🏠 Hostel',
      library: '📚 Library', exam: '📝 Exam', other: '📌 Other',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) return null;

  const isStaffOrAdmin = ['staff', 'admin', 'hod'].includes(user?.role);

  return (
    <div className="ticket-detail animate-fade-in">
      {/* Breadcrumb */}
      <Link to="/tickets" className="ticket-detail__back">
        <HiOutlineArrowLeft />
        Back to Tickets
      </Link>

      <div className="ticket-detail__layout">
        {/* Main Content */}
        <div className="ticket-detail__main">
          {/* Header */}
          <div className="ticket-detail__header">
            <div className="ticket-detail__header-top">
              <span className="ticket-card__number">{ticket.ticketNumber}</span>
              <div className="ticket-detail__badges">
                <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <h1 className="ticket-detail__title">{ticket.title}</h1>
            <div className="ticket-detail__meta">
              <span><HiOutlineUser /> {ticket.createdBy?.name}</span>
              <span><HiOutlineClock /> {formatDateTime(ticket.createdAt)}</span>
              <span><HiOutlineTag /> {getCategoryLabel(ticket.category)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="ticket-detail__section">
            <h3 className="ticket-detail__section-title">Description</h3>
            <div className="ticket-detail__description">
              {ticket.description}
            </div>
            {ticket.attachments?.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachments</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {ticket.attachments.map((file, idx) => (
                    <a key={idx} href={`http://localhost:5000${file.path}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--primary-400)', textDecoration: 'none', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                      <HiOutlinePaperClip style={{ fontSize: '1.2rem' }} /> {file.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SLA Warning */}
          {ticket.slaBreached && (
            <div className="ticket-detail__sla-alert">
              <HiOutlineExclamationCircle />
              <div>
                <strong>SLA Breached</strong>
                <p>This ticket has exceeded its SLA deadline. Immediate attention required.</p>
              </div>
            </div>
          )}

          {/* Status Actions (Staff/Admin) */}
          {isStaffOrAdmin && !['closed'].includes(ticket.status) && (
            <div className="ticket-detail__section">
              <h3 className="ticket-detail__section-title">Update Status</h3>
              <div className="status-actions">
                {ticket.status === 'open' && (
                  <button className="status-btn status-btn--progress" onClick={() => handleStatusChange('in_progress')}>
                    Start Working
                  </button>
                )}
                {['open', 'in_progress', 'reopened'].includes(ticket.status) && (
                  <>
                    <button className="status-btn status-btn--pending" onClick={() => handleStatusChange('pending_student')}>
                      Pending Student
                    </button>
                    <button className="status-btn status-btn--resolved" onClick={() => handleStatusChange('resolved')}>
                      Resolve
                    </button>
                  </>
                )}
                {ticket.status === 'resolved' && (
                  <button className="status-btn status-btn--closed" onClick={() => handleStatusChange('closed')}>
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Student Reopen */}
          {user?.role === 'student' && ticket.status === 'resolved' && (
            <div className="ticket-detail__section">
              <button className="status-btn status-btn--reopen" onClick={() => handleStatusChange('reopened')}>
                🔃 Reopen Ticket
              </button>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="ticket-detail__section">
            <h3 className="ticket-detail__section-title">
              <HiOutlineChatAlt2 /> Activity & Comments
            </h3>
            <div className="activity-timeline">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className={`activity-item ${activity.isInternal ? 'activity-item--internal' : ''}`}
                >
                  <div className="activity-item__icon">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="activity-item__content">
                    <div className="activity-item__header">
                      <span className="activity-item__user">{activity.performedBy?.name}</span>
                      {activity.isInternal && (
                        <span className="activity-item__internal-badge">Internal</span>
                      )}
                      <span className="activity-item__time">{formatDateTime(activity.createdAt)}</span>
                    </div>
                    {activity.action === 'commented' ? (
                      <div className="activity-item__comment">
                        {activity.comment}
                        {activity.attachments?.length > 0 && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activity.attachments.map((file, idx) => (
                              <a key={idx} href={`http://localhost:5000${file.path}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--primary-400)', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
                                <HiOutlinePaperClip /> {file.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="activity-item__text">{getActivityMessage(activity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea
                className="form-textarea"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div style={{ padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
              <div className="comment-form__actions">
                {isStaffOrAdmin && (
                  <label className="comment-form__internal">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    />
                    <span>Internal note (hidden from student)</span>
                  </label>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={(!comment.trim() && files.length === 0) || submitting}
                >
                  {submitting ? 'Sending...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="ticket-detail__sidebar">
          <div className="detail-card">
            <h4 className="detail-card__title">Details</h4>
            <div className="detail-card__rows">
              <div className="detail-card__row">
                <span className="detail-card__label">Status</span>
                <span className={`badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="detail-card__row">
                <span className="detail-card__label">Priority</span>
                <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="detail-card__row">
                <span className="detail-card__label">Category</span>
                <span className="detail-card__value">{getCategoryLabel(ticket.category)}</span>
              </div>
              <div className="detail-card__row">
                <span className="detail-card__label">Created</span>
                <span className="detail-card__value">{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="detail-card__row">
                  <span className="detail-card__label">Resolved</span>
                  <span className="detail-card__value">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              )}
              {ticket.slaDeadline && (
                <div className="detail-card__row">
                  <span className="detail-card__label">SLA Deadline</span>
                  <span className={`detail-card__value ${ticket.slaBreached ? 'text-danger' : ''}`}>
                    {formatDateTime(ticket.slaDeadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-card">
            <h4 className="detail-card__title">People</h4>
            <div className="detail-card__rows">
              <div className="detail-card__row">
                <span className="detail-card__label">Raised by</span>
                <div className="detail-card__person">
                  <div className="detail-card__avatar">
                    {ticket.createdBy?.name?.charAt(0)}
                  </div>
                  <div>
                    <span className="detail-card__person-name">{ticket.createdBy?.name}</span>
                    <span className="detail-card__person-email">{ticket.createdBy?.email}</span>
                  </div>
                </div>
              </div>
              <div className="detail-card__row">
                <span className="detail-card__label">Assigned to</span>
                {ticket.assignedTo ? (
                  <div className="detail-card__person">
                    <div className="detail-card__avatar detail-card__avatar--staff">
                      {ticket.assignedTo?.name?.charAt(0)}
                    </div>
                    <div>
                      <span className="detail-card__person-name">{ticket.assignedTo?.name}</span>
                      <span className="detail-card__person-email">{ticket.assignedTo?.email}</span>
                    </div>
                  </div>
                ) : (
                  <span className="detail-card__value detail-card__unassigned">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {ticket.tags?.length > 0 && (
            <div className="detail-card">
              <h4 className="detail-card__title">Tags</h4>
              <div className="detail-card__tags">
                {ticket.tags.map((tag, i) => (
                  <span key={i} className="detail-card__tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TicketDetail;
