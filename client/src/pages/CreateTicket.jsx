import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './CreateTicket.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'medium',
    department: '',
    tags: '',
  });

  const categories = [
    { value: 'fees', label: '💰 Fees', desc: 'Fee payment, refund, scholarship queries' },
    { value: 'attendance', label: '📋 Attendance', desc: 'Attendance corrections, shortage issues' },
    { value: 'id_card', label: '🪪 ID Card', desc: 'New ID, replacement, corrections' },
    { value: 'documents', label: '📄 Documents', desc: 'Bonafide, TC, migration certificates' },
    { value: 'certificates', label: '🎓 Certificates', desc: 'Degree, provisional, course certificates' },
    { value: 'hostel', label: '🏠 Hostel', desc: 'Accommodation, mess, facility issues' },
    { value: 'library', label: '📚 Library', desc: 'Book issues, fines, access problems' },
    { value: 'exam', label: '📝 Exam', desc: 'Hall ticket, revaluation, results' },
    { value: 'other', label: '📌 Other', desc: 'Any other administrative request' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', desc: 'Non-urgent, can wait', color: 'var(--gray-400)' },
    { value: 'medium', label: 'Medium', desc: 'Standard request', color: 'var(--info-500)' },
    { value: 'high', label: 'High', desc: 'Needs attention soon', color: '#f97316' },
    { value: 'critical', label: 'Critical', desc: 'Urgent, time-sensitive', color: 'var(--danger-500)' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags' && formData[key]) {
          const tags = formData[key].split(',').map((t) => t.trim()).filter(Boolean);
          tags.forEach(t => data.append('tags[]', t)); // Backend expects array, but multer stringifies. 
          // Actually, our backend controller takes `req.body.tags` which might be strings or arrays depending on how we send it.
          // Let's just send it as a string and the backend handles it.
          data.append('tags', tags.join(','));
        } else {
          data.append(key, formData[key]);
        }
      });
      
      files.forEach(file => {
        data.append('attachments', file);
      });

      const res = await ticketAPI.create(data);
      toast.success(`Ticket ${res.data.data.ticketNumber} created successfully!`);
      navigate(`/tickets/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket animate-fade-in">
      <div className="create-ticket__header">
        <h2>Raise a New Request</h2>
        <p>Fill in the details below. Our team will review and respond within the SLA timeline.</p>
      </div>

      <form className="create-ticket__form" onSubmit={handleSubmit}>
        {/* Category Selection */}
        <div className="form-section">
          <label className="form-section__label">Category *</label>
          <div className="category-grid">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                className={`category-card ${formData.category === cat.value ? 'category-card--active' : ''}`}
                onClick={() => setFormData({ ...formData, category: cat.value })}
              >
                <span className="category-card__icon">{cat.label.split(' ')[0]}</span>
                <span className="category-card__name">{cat.label.split(' ').slice(1).join(' ')}</span>
                <span className="category-card__desc">{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="form-section">
          <label htmlFor="ticket-title" className="form-label">Subject / Title *</label>
          <input
            type="text"
            id="ticket-title"
            name="title"
            className="form-input form-input--full"
            placeholder="Brief summary of your request..."
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            required
          />
          <span className="form-hint">{formData.title.length}/200 characters</span>
        </div>

        {/* Description */}
        <div className="form-section">
          <label htmlFor="ticket-description" className="form-label">Description *</label>
          <textarea
            id="ticket-description"
            name="description"
            className="form-textarea"
            placeholder="Provide detailed information about your request. Include relevant dates, amounts, document references, etc."
            value={formData.description}
            onChange={handleChange}
            maxLength={5000}
            rows={6}
            required
          />
          <span className="form-hint">{formData.description.length}/5000 characters</span>
        </div>

        {/* Priority */}
        <div className="form-section">
          <label className="form-section__label">Priority Level</label>
          <div className="priority-grid">
            {priorities.map((p) => (
              <button
                type="button"
                key={p.value}
                className={`priority-card ${formData.priority === p.value ? 'priority-card--active' : ''}`}
                onClick={() => setFormData({ ...formData, priority: p.value })}
                style={{ '--priority-color': p.color }}
              >
                <span className="priority-card__dot"></span>
                <div>
                  <span className="priority-card__name">{p.label}</span>
                  <span className="priority-card__desc">{p.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="form-row">
          <div className="form-section">
            <label htmlFor="subcategory" className="form-label">Subcategory</label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              className="form-input form-input--full"
              placeholder="e.g. Fee Refund"
              value={formData.subcategory}
              onChange={handleChange}
            />
          </div>
          <div className="form-section">
            <label htmlFor="tags" className="form-label">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="form-input form-input--full"
              placeholder="Comma-separated, e.g. urgent, semester-6"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="form-section">
          <label htmlFor="attachments" className="form-label">Attachments</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            className="form-input form-input--full"
            multiple
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          />
          <span className="form-hint">Max 5MB each. Allowed types: JPG, PNG, PDF, DOC</span>
          {files.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {files.length} file(s) selected
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="create-ticket__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/tickets')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary btn-primary--lg"
            disabled={loading}
            id="submit-ticket"
          >
            {loading ? (
              <span className="auth-form__spinner"></span>
            ) : (
              <>
                <HiOutlinePaperAirplane />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
