import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';
import { emitNotification } from './socket.js';

export const startCronJobs = () => {
  // Run every 15 minutes to check for SLA breaches
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏳ Running SLA Breach Check...');
    try {
      const now = new Date();
      
      // Find tickets that are not resolved/closed, have a deadline, and aren't marked breached yet
      // but their deadline has passed
      const breachedTickets = await Ticket.find({
        status: { $nin: ['resolved', 'closed'] },
        slaDeadline: { $lt: now },
        slaBreached: false
      }).populate('assignedTo createdBy');

      if (breachedTickets.length === 0) return;

      console.log(`⚠️ Found ${breachedTickets.length} newly breached tickets.`);

      for (const ticket of breachedTickets) {
        // Mark as breached
        ticket.slaBreached = true;
        await ticket.save();

        // 1. Log Activity
        await Activity.create({
          ticketId: ticket._id,
          action: 'sla_breached',
          systemGenerated: true,
          oldValue: 'Active',
          newValue: 'Breached'
        });

        // 2. Notify assigned staff (if any)
        if (ticket.assignedTo) {
          const notif = await Notification.create({
            userId: ticket.assignedTo._id,
            ticketId: ticket._id,
            type: 'sla_breach',
            message: `SLA Breached for Ticket ${ticket.ticketNumber}`,
          });
          emitNotification(ticket.assignedTo._id, notif);
          
          // Send Email to Staff
          await sendEmail({
            email: ticket.assignedTo.email,
            subject: `[SLA Breach] Ticket ${ticket.ticketNumber}`,
            message: `Ticket ${ticket.ticketNumber} (${ticket.title}) has breached its SLA deadline.`
          });
        }

        // 3. Auto-Escalation: Notify HODs
        const hods = await User.find({ role: 'hod' });
        for (const hod of hods) {
          const hodNotif = await Notification.create({
            userId: hod._id,
            ticketId: ticket._id,
            type: 'escalation',
            message: `Escalation: Ticket ${ticket.ticketNumber} breached SLA.`,
          });
          emitNotification(hod._id, hodNotif);
        }
      }
    } catch (error) {
      console.error('Error in SLA Cron Job:', error);
    }
  });
  
  console.log('⏱️  SLA Cron Jobs initialized');
};
