import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Mechanic from './models/Mechanic.js';
import Admin from './models/Admin.js';
import Vehicle from './models/Vehicle.js';
import ServiceRequest from './models/ServiceRequest.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://deepthinkmode_db_user:IRfGC1eMXQnhCbEZ@omshantiroad.8ny7gff.mongodb.net/omshantiROAD?retryWrites=true&w=majority');
    console.log('📡 Connected successfully.');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Mechanic.deleteMany({});
    await Admin.deleteMany({});
    await Vehicle.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('🧹 DB collections wiped clean.');

    // Pre-hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('roadrescue123', salt);

    // 1. Create Admins
    console.log('🌱 Seeding Admins...');
    const admin = await Admin.create({
      name: 'Elena Vance',
      email: 'admin@roadrescue.com',
      password: 'roadrescue123', // Will be auto-hashed by pre-save hooks in mongoose, or handled manually if hooks aren't fired, but they are fired during .create!
      role: 'admin'
    });
    console.log(`✅ Created Admin: ${admin.email}`);

    // 2. Create Users
    console.log('🌱 Seeding Users...');
    const user = await User.create({
      name: 'Alex Mercer',
      email: 'user@roadrescue.com',
      password: 'roadrescue123',
      phone: '+1 (555) 304-9982',
      profilePhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsh4C5iHWzKRxWfShZVM8eiZPzMc3kWhiM5zSVvj0-DX00SRwdrB7Z5JaWl1boPu-27zdJYJqPhMKCamr0tHZtxdAothXlGLbuCQaQhXAwfvi0BHd-JqukyDfSm_uO2tfYrddJJKONqbw8ss5DKjBQz0XCA6wB3xFhvBD8AEYpATSUB_3LlXs1jGgMpcCWUwq9wgwp2zHMLsw1XPjHf_l8sUGP5kenHyHymqAADctVFcT1HLdutUTLiwrvxumCiMPoGifpYxVB6pU',
      role: 'user'
    });
    console.log(`✅ Created User: ${user.email}`);

    // 3. Create Vehicles
    console.log('🌱 Seeding Vehicles...');
    const vehicle1 = await Vehicle.create({
      owner: user._id,
      make: 'Tesla',
      model: 'Model S Plaid',
      year: 2024,
      color: 'Solid Black',
      plateNumber: 'TSLA-S-P',
      vehicleType: 'EV'
    });
    console.log(`✅ Created Vehicle: ${vehicle1.make} ${vehicle1.model}`);

    // 4. Create Mechanics
    console.log('🌱 Seeding Mechanics...');
    const mechanic1 = await Mechanic.create({
      name: 'David R.',
      email: 'david@roadrescue.com',
      password: 'roadrescue123',
      phone: '+1 (555) 019-2834',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByN0gReMf2EVTRsGvzJIfQkt4dNkMtXxe95dlSRKbikVzLy0AcAOwpM8ZcNBrFQ_I1kRs1s2PtxHKbUJOYvRCsPXgsbIX6REt6qWqmgb_wcVrGeD5fgoT_mjpGjtNTGEKoxy9KYXCDW5Ox6kZjGV5MtsQWklnzS9LmIWqE6Cm6gyUOKmeVudbUAPl0iV_uBYpPci72bBQXJB0QeCEejv0N6T4A9vOMdgQ69sVufeLcbdn-9BSy4HrLTxe1RK7Sug46W8CnkJcD7f0',
      status: 'active',
      specialty: 'Heavy Towing & Flatbed',
      vehicle: {
        name: 'Heavy Tow • Unit #402',
        plate: 'RD-RESC-9'
      },
      location: {
        lat: 28.6304,
        lng: 77.2177,
        address: 'Connaught Place Hub, Delhi'
      },
      rating: 4.9,
      reviewsCount: 24
    });

    const mechanic2 = await Mechanic.create({
      name: 'Marcus T.',
      email: 'marcus@roadrescue.com',
      password: 'roadrescue123',
      phone: '+1 (555) 018-9982',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4',
      status: 'active',
      specialty: 'Roadside Recovery & Electrical',
      vehicle: {
        name: 'Flatbed Tow • Unit #442',
        plate: 'RD-FLAT-4'
      },
      location: {
        lat: 28.6415,
        lng: 77.1248,
        address: 'Rajouri Garden Sector, Delhi'
      },
      rating: 4.8,
      reviewsCount: 19
    });
    console.log(`✅ Created Mechanics: ${mechanic1.name}, ${mechanic2.name}`);

    // 5. Create ServiceRequests (Active and past ones)
    console.log('🌱 Seeding Service Requests...');
    
    // Active assigned request for Marcus
    const reqActive = await ServiceRequest.create({
      ticketId: 'RR-102',
      user: user._id,
      type: 'Towing Service',
      issue: 'tow',
      time: '12m ago',
      loc: 'Connaught Place, Central Delhi',
      location: { lat: 28.6304, lng: 77.2177 },
      req: 'Unit-Delta (ETA 5m)',
      status: 'Assigned',
      customerVehicle: '2024 Tesla Model S Plaid',
      assigned: true,
      eta: 5,
      mechanic: mechanic2._id,
      driverName: mechanic2.name,
      driverPhone: mechanic2.phone,
      driverAvatar: mechanic2.avatar,
      vehicle: mechanic2.vehicle.name,
      chatHistory: [
        {
          sender: 'system',
          text: '🚨 Emergency SOS broadcast received. GPS coordinates locked in by primary responder node.',
          time: '10:45 PM'
        },
        {
          sender: 'david', // Using david as default in client, let's keep it robust
          text: 'Hey! I am approaching downtown now, stay safe.',
          time: '10:48 PM'
        }
      ]
    });

    // Pending request
    const reqPending = await ServiceRequest.create({
      ticketId: 'RR-103',
      user: user._id,
      type: 'Lockout Support',
      issue: 'lockout',
      time: '15m ago',
      loc: 'Karol Bagh Shopping District',
      location: { lat: 28.6448, lng: 77.1887 },
      req: 'Standard Assistance',
      status: 'Pending',
      customerVehicle: '2024 Tesla Model S Plaid',
      assigned: false,
      driverName: '',
      driverPhone: '',
      driverAvatar: '',
      vehicle: '',
      chatHistory: [
        {
          sender: 'system',
          text: '🚨 Emergency Satellite Beacon activated. Frequencies locked. Awaiting logistics dispatcher assignment...',
          time: '10:50 PM'
        }
      ]
    });

    // Completed Requests
    const reqComp1 = await ServiceRequest.create({
      ticketId: 'RR-092',
      user: user._id,
      type: 'Towing Service',
      issue: 'tow',
      time: 'Oct 24, 2026',
      loc: 'I-5 Southbound Express',
      req: 'Heavy Flatbed',
      status: 'Completed',
      customerVehicle: '2024 Tesla Model S Plaid',
      assigned: true,
      driverName: 'David R.',
      driverPhone: '+1 (555) 019-2834',
      vehicle: 'Heavy Tow • Unit #402',
    });

    const reqComp2 = await ServiceRequest.create({
      ticketId: 'RR-091',
      user: user._id,
      type: 'Battery Jumpstart',
      issue: 'battery',
      time: 'Oct 12, 2026',
      loc: 'Lake Union Overlook',
      req: 'Mobile Battery Unit',
      status: 'Completed',
      customerVehicle: '2024 Tesla Model S Plaid',
      assigned: true,
      driverName: 'Marcus T.',
      driverPhone: '+1 (555) 018-9982',
      vehicle: 'Roadside Unit #301',
    });

    const reqComp3 = await ServiceRequest.create({
      ticketId: 'RR-090',
      user: user._id,
      type: 'Mud Rescue',
      issue: 'mud',
      time: 'Sep 05, 2026',
      loc: 'Cascade Foot Rail',
      req: 'Winch Rig',
      status: 'Cancelled',
      customerVehicle: '2024 Tesla Model S Plaid',
      assigned: false,
    });

    console.log('✅ Created Service Requests.');

    // 6. Create Payments
    console.log('🌱 Seeding Payments...');
    await Payment.create({
      user: user._id,
      serviceRequest: reqComp1._id,
      amount: 145.00,
      paymentMethod: 'Credit Card',
      transactionId: 'TX-9827341',
      status: 'Completed'
    });

    await Payment.create({
      user: user._id,
      serviceRequest: reqComp2._id,
      amount: 75.00,
      paymentMethod: 'Apple Pay',
      transactionId: 'TX-1092837',
      status: 'Completed'
    });

    await Payment.create({
      user: user._id,
      serviceRequest: reqComp3._id,
      amount: 0.00,
      paymentMethod: 'Credit Card',
      transactionId: 'TX-3029182',
      status: 'Failed'
    });
    console.log('✅ Created Payments.');

    // 7. Create Reviews
    console.log('🌱 Seeding Reviews...');
    await Review.create({
      user: user._id,
      mechanic: mechanic1._id,
      serviceRequest: reqComp1._id,
      rating: 5,
      comment: 'David is incredible! Rescued my Model S within 15 minutes. Highly premium service.'
    });
    console.log('✅ Created Reviews.');

    // 8. Create Notifications
    console.log('🌱 Seeding Notifications...');
    await Notification.create({
      recipient: user._id,
      recipientType: 'User',
      title: 'Welcome to RoadRescue',
      message: 'Your high-fidelity security protocols have been locked in. Welcome aboard!',
      type: 'success'
    });
    console.log('✅ Created Notifications.');

    console.log('🎉 Seeding successfully completed!');
    mongoose.disconnect();
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
