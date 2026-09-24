import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'fees',
        'attendance',
        'id_card',
        'documents',
        'certificates',
        'hostel',
        'library',
        'exam',
        'other',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    
    // Attachments
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      }
    ],

    // Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },

    // Status & Priority
    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'pending_student',
        'pending_approval',
        'resolved',
        'closed',
        'reopened',
      ],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // SLA
    slaDeadline: {
      type: Date,
      default: null,
    },
    slaBreached: {
      type: Boolean,
      default: false,
    },
    slaBreachTime: {
      type: Date,
      default: null,
    },

    // Tracking
    firstResponseAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenedCount: {
      type: Number,
      default: 0,
    },

    // Attachments
    attachments: [attachmentSchema],

    // Tags
    tags: [{ type: String, trim: true }],

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ slaDeadline: 1, slaBreached: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
