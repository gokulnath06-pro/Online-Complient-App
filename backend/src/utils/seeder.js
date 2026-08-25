import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Message from '../models/Message.js';
import Feedback from '../models/Feedback.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding process...');

    // Clear existing data
    await User.deleteMany();
    await Complaint.deleteMany();
    await Message.deleteMany();
    await Feedback.deleteMany();

    console.log('🧹 Purged existing collections.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Alex Vance (Admin)',
      email: 'admin@complaint.com',
      password: 'admin123',
      role: 'ADMIN',
      department: 'System Administration',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    });

    const agentTech = await User.create({
      name: 'David Miller (Senior Tech Agent)',
      email: 'agent.tech@complaint.com',
      password: 'agent123',
      role: 'AGENT',
      department: 'Technical Support',
      phone: '+1 (555) 482-9102',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    });

    const agentBilling = await User.create({
      name: 'Elena Rostova (Billing Specialist)',
      email: 'agent.billing@complaint.com',
      password: 'agent123',
      role: 'AGENT',
      department: 'Billing & Finance',
      phone: '+1 (555) 739-1144',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    });

    const userJohn = await User.create({
      name: 'John Doe',
      email: 'john@user.com',
      password: 'user123',
      role: 'USER',
      department: 'Product Operations',
      phone: '+1 (555) 602-8391',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    });

    const userSarah = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@user.com',
      password: 'user123',
      role: 'USER',
      department: 'Engineering Dept',
      phone: '+1 (555) 234-8899',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    });

    console.log('👤 Created demo accounts (Admin, 2 Agents, 2 Users).');

    // 2. Create Complaints
    const complaint1 = await Complaint.create({
      ticketId: 'TKT-1024',
      title: 'Database connection timeouts on production EU cluster',
      description:
        'Since this morning 08:30 UTC, our API microservices have been encountering intermittent 504 gateway timeout errors when querying the European MongoDB cluster replica set.',
      category: 'Technical',
      priority: 'Urgent',
      status: 'Resolved',
      user: userJohn._id,
      assignedAgent: agentTech._id,
      resolutionNotes:
        'Identified a memory threshold bottleneck on secondary replica node. Re-indexed heavy queries, auto-scaled memory pool by 4GB, and stabilized latency under 12ms.',
      resolvedAt: new Date(Date.now() - 3600000 * 4),
      timeline: [
        {
          status: 'Pending',
          note: 'Ticket registered by user.',
          updatedBy: userJohn._id,
          timestamp: new Date(Date.now() - 3600000 * 24),
        },
        {
          status: 'Assigned',
          note: `Assigned to ${agentTech.name}.`,
          updatedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 20),
        },
        {
          status: 'In Progress',
          note: 'Investigating cluster telemetry and connection pool logs.',
          updatedBy: agentTech._id,
          timestamp: new Date(Date.now() - 3600000 * 12),
        },
        {
          status: 'Resolved',
          note: 'Index optimization deployed and verified stable.',
          updatedBy: agentTech._id,
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
      ],
    });

    const complaint2 = await Complaint.create({
      ticketId: 'TKT-2048',
      title: 'Discrepancy and double deduction on Invoice #INV-9284',
      description:
        'Our monthly enterprise subscription charged twice on August 20th. We noticed two identical transactions of $499.00 on the linked corporate MasterCard.',
      category: 'Billing',
      priority: 'High',
      status: 'In Progress',
      user: userSarah._id,
      assignedAgent: agentBilling._id,
      timeline: [
        {
          status: 'Pending',
          note: 'Billing dispute submitted.',
          updatedBy: userSarah._id,
          timestamp: new Date(Date.now() - 3600000 * 18),
        },
        {
          status: 'Assigned',
          note: `Assigned to ${agentBilling.name}.`,
          updatedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 16),
        },
        {
          status: 'In Progress',
          note: 'Payment gateway transaction IDs pulled. Initiating refund sequence with merchant bank.',
          updatedBy: agentBilling._id,
          timestamp: new Date(Date.now() - 3600000 * 6),
        },
      ],
    });

    const complaint3 = await Complaint.create({
      ticketId: 'TKT-3096',
      title: 'Ergonomic display monitor power adapter failure',
      description:
        'The USB-C power delivery adapter on the external 4K Dell display in workstation #4B stopped functioning after a brief power surge.',
      category: 'Hardware',
      priority: 'Medium',
      status: 'Assigned',
      user: userJohn._id,
      assignedAgent: agentTech._id,
      timeline: [
        {
          status: 'Pending',
          note: 'Hardware incident reported.',
          updatedBy: userJohn._id,
          timestamp: new Date(Date.now() - 3600000 * 8),
        },
        {
          status: 'Assigned',
          note: `Assigned to ${agentTech.name}.`,
          updatedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
      ],
    });

    const complaint4 = await Complaint.create({
      ticketId: 'TKT-4120',
      title: 'SSO SAML Authentication fails for new domain team members',
      description:
        'New team members with the @corp-engineering domain are receiving an "Invalid Audience Restriction" error when attempting to sign in via Okta SSO.',
      category: 'Technical',
      priority: 'High',
      status: 'Pending',
      user: userSarah._id,
      timeline: [
        {
          status: 'Pending',
          note: 'Complaint registered in the system.',
          updatedBy: userSarah._id,
          timestamp: new Date(Date.now() - 3600000 * 2),
        },
      ],
    });

    const complaint5 = await Complaint.create({
      ticketId: 'TKT-5580',
      title: 'Automated CSV report export format requested for accounting',
      description:
        'Requesting monthly export summary in CSV/Excel format compatible with QuickBooks integration.',
      category: 'Service',
      priority: 'Low',
      status: 'Resolved',
      user: userJohn._id,
      assignedAgent: agentBilling._id,
      resolutionNotes:
        'Enabled automatic scheduled CSV webhook reports under organization billing settings.',
      resolvedAt: new Date(Date.now() - 3600000 * 48),
      timeline: [
        {
          status: 'Pending',
          note: 'Feature service request opened.',
          updatedBy: userJohn._id,
          timestamp: new Date(Date.now() - 3600000 * 60),
        },
        {
          status: 'Resolved',
          note: 'Webhook export enabled for user account.',
          updatedBy: agentBilling._id,
          timestamp: new Date(Date.now() - 3600000 * 48),
        },
      ],
    });

    // 3. Create Messages / Chat History
    await Message.create([
      {
        complaintId: complaint1._id,
        sender: userJohn._id,
        senderRole: 'USER',
        message: 'Hi David, our monitoring alerted us that latency spiked above 1500ms on the EU cluster.',
        createdAt: new Date(Date.now() - 3600000 * 10),
      },
      {
        complaintId: complaint1._id,
        sender: agentTech._id,
        senderRole: 'AGENT',
        message: 'Hello John! I have isolated the query causing table scans. Running an index patch now.',
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
      {
        complaintId: complaint1._id,
        sender: agentTech._id,
        senderRole: 'AGENT',
        message: 'The index is active and cluster memory utilization is back down to 34%. Could you please verify from your dashboard?',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        complaintId: complaint1._id,
        sender: userJohn._id,
        senderRole: 'USER',
        message: 'Verified! All requests are responding under 15ms now. Excellent work!',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        complaintId: complaint2._id,
        sender: userSarah._id,
        senderRole: 'USER',
        message: 'Hello Elena, I have attached our bank statement showing both $499 charges.',
        createdAt: new Date(Date.now() - 3600000 * 14),
      },
      {
        complaintId: complaint2._id,
        sender: agentBilling._id,
        senderRole: 'AGENT',
        message: 'Thank you Sarah, I see the duplicate webhook callback from Stripe. Processing the refund right away.',
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
    ]);

    // 4. Create Feedback for resolved tickets
    await Feedback.create({
      complaint: complaint1._id,
      user: userJohn._id,
      agent: agentTech._id,
      rating: 5,
      speedRating: 5,
      serviceRating: 5,
      comment: 'Incredible speed and technical precision. Resolved our production cluster incident within hours!',
      tags: ['Super Fast', 'Knowledgeable', 'Friendly'],
    });

    await Feedback.create({
      complaint: complaint5._id,
      user: userJohn._id,
      agent: agentBilling._id,
      rating: 5,
      speedRating: 4,
      serviceRating: 5,
      comment: 'Very helpful, CSV reports working seamlessly.',
      tags: ['Helpful', 'Accurate'],
    });

    console.log('⭐ Seeded complaints, chat logs, timeline history, and feedback ratings successfully.');
  } catch (err) {
    console.error('❌ Error while seeding database:', err);
  }
};

// Run directly if invoked from CLI
if (process.argv[1]?.endsWith('seeder.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
