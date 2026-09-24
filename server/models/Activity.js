import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'status_changed',
        'priority_changed',
        'assigned',
        'commented',
        'attachment_added',
        'escalated',
        'sla_breached',
        'reopened',
        'resolved',
        'closed',
      ],
    },
    oldValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      default: '',
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ ticketId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
