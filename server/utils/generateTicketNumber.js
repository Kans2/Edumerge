import Ticket from '../models/Ticket.js';

/**
 * Generates a unique ticket number in format: EDU-YYYY-NNNNN
 * e.g., EDU-2026-00001
 */
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `EDU-${year}-`;

  // Find the last ticket created this year
  const lastTicket = await Ticket.findOne({
    ticketNumber: { $regex: `^${prefix}` },
  })
    .sort({ ticketNumber: -1 })
    .lean();

  let nextNumber = 1;
  if (lastTicket) {
    const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
};

export default generateTicketNumber;
