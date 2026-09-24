/**
 * Seed script to create demo users for testing.
 * Run: node seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edumerge';

const users = [
  {
    name: 'Admin User',
    email: 'admin@edumerge.com',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    phone: '+91 9876543210',
    staffId: 'ADM001',
  },
  {
    name: 'Kannan S',
    email: 'kannan@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    phone: '+91 9876543211',
    studentId: 'CS2024001',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Electronics',
    phone: '+91 9876543212',
    studentId: 'EC2024002',
  },
  {
    name: 'Staff Member',
    email: 'staff@edumerge.com',
    password: 'staff123',
    role: 'staff',
    department: 'Computer Science',
    phone: '+91 9876543213',
    staffId: 'STF001',
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'hod@edumerge.com',
    password: 'hod123',
    role: 'hod',
    department: 'Computer Science',
    phone: '+91 9876543214',
    staffId: 'HOD001',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if users already exist
    const count = await usersCollection.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} users. Skipping seed.`);
      console.log('   To re-seed, drop the users collection first.');
      process.exit(0);
    }

    // Hash passwords and insert
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
        isActive: true,
        avatar: '',
        refreshToken: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await usersCollection.insertMany(hashedUsers);

    console.log('\n🌱 Seed data created successfully!\n');
    console.log('Demo accounts:');
    console.log('─────────────────────────────────────────');
    users.forEach((u) => {
      console.log(`  ${u.role.toUpperCase().padEnd(8)} │ ${u.email.padEnd(24)} │ ${u.password}`);
    });
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
