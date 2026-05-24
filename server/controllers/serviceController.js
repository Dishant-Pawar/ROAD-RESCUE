import ServiceRequest from '../models/ServiceRequest.js';
import Mechanic from '../models/Mechanic.js';
import Payment from '../models/Payment.js';
import EmergencyReport from '../models/EmergencyReport.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all service requests (Admin)
// @route   GET /api/incidents
// @access  Private/Admin
export const getRequests = async (req, res, next) => {
  try {
    let query = { status: { $in: ['Pending', 'Assigned'] } };
    
    if (req.query.all === 'true' || req.query.status === 'all') {
      query = {}; // Fetch all requests
    } else if (req.query.status) {
      query = { status: req.query.status };
    }

    const requests = await ServiceRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single active incident for user
// @route   GET /api/incidents/active
// @access  Public (or Private depending on user token)
export const getActiveRequest = async (req, res, next) => {
  try {
    // Find active tickets (status Pending or Assigned)
    // If user is authenticated, we filter by their user ID, otherwise return the latest active one
    let query = { status: { $in: ['Pending', 'Assigned'] } };
    if (req.user) {
      query.user = req.user._id;
    }
    
    const active = await ServiceRequest.findOne(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: active });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new emergency SOS beacon
// @route   POST /api/incidents
// @access  Private/Public (allow optional guest auth to keep it easy)
export const createRequest = async (req, res, next) => {
  try {
    const { type, issue, loc, reqType, latitude, longitude } = req.body;
    
    // Check if there is already an active request
    let activeQuery = { status: { $in: ['Pending', 'Assigned'] } };
    if (req.user) {
      activeQuery.user = req.user._id;
    }
    const existing = await ServiceRequest.findOne(activeQuery);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active emergency rescue beacon.', data: existing });
    }

    const ticketId = `RR-${Math.floor(Math.random() * 9000) + 1000}`;

    // Use actual client coordinates if provided, otherwise randomize around Connaught Place, India (28.6304, 77.2177)
    const isRealLat = (latitude !== undefined && latitude !== null && !isNaN(Number(latitude)));
    const isRealLng = (longitude !== undefined && longitude !== null && !isNaN(Number(longitude)));

    const randomLat = isRealLat ? Number(latitude) : (28.6304 + (Math.random() - 0.5) * 0.04);
    const randomLng = isRealLng ? Number(longitude) : (77.2177 + (Math.random() - 0.5) * 0.04);

    let customerVehicleStr = 'Tesla Model S Plaid';
    if (req.user) {
      const userVehicles = await Vehicle.find({ owner: req.user._id });
      if (userVehicles && userVehicles.length > 0) {
        const primary = userVehicles[0];
        customerVehicleStr = `${primary.year} ${primary.make} ${primary.model}`;
      }
    }

    const newTicket = await ServiceRequest.create({
      ticketId,
      user: req.user ? req.user._id : null,
      type,
      issue,
      loc: loc || 'Sector 4 - Downtown Grid',
      location: {
        lat: randomLat,
        lng: randomLng
      },
      req: reqType || 'Standard Rescue',
      status: 'Pending',
      customerVehicle: customerVehicleStr,
      chatHistory: [
        {
          sender: 'system',
          text: `🚨 Emergency Satellite Beacon activated. Frequencies locked. Awaiting logistics dispatcher assignment...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    });

    if (req.io) {
      req.io.emit('ticket_created', newTicket);
    }

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign request to mechanic (Admin)
// @route   PUT /api/incidents/:id/assign
// @access  Private/Admin
export const assignRequest = async (req, res, next) => {
  try {
    const { id } = req.params; // ticketId e.g. RR-1234
    
    const ticket = await ServiceRequest.findOne({ ticketId: id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const { mechanicId } = req.body;
    let mechanic;

    if (mechanicId) {
      const isAlreadyBusy = await ServiceRequest.findOne({ mechanic: mechanicId, status: 'Assigned' });
      if (isAlreadyBusy) {
        return res.status(400).json({ success: false, message: 'Technician is currently on duty rescuing another driver. Please dispatch an available responder.' });
      }
      mechanic = await Mechanic.findById(mechanicId);
    }

    if (!mechanic) {
      // Find active mechanics who are not currently busy
      const busyMechanicIds = await ServiceRequest.find({ status: 'Assigned' }).distinct('mechanic');
      mechanic = await Mechanic.findOne({ status: 'active', isApproved: true, _id: { $nin: busyMechanicIds } });
      if (!mechanic) {
        mechanic = await Mechanic.findOne({ status: 'active', isApproved: true });
      }
    }

    // Fallback if no mechanics exist in database at all
    if (!mechanic) {
      mechanic = {
        _id: null,
        name: 'David R.',
        phone: '+1 (555) 019-2834',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByN0gReMf2EVTRsGvzJIfQkt4dNkMtXxe95dlSRKbikVzLy0AcAOwpM8ZcNBrFQ_I1kRs1s2PtxHKbUJOYvRCsPXgsbIX6REt6qWqmgb_wcVrGeD5fgoT_mjpGjtNTGEKoxy9KYXCDW5Ox6kZjGV5MtsQWklnzS9LmIWqE6Cm6gyUOKmeVudbUAPl0iV_uBYpPci72bBQXJB0QeCEejv0N6T4A9vOMdgQ69sVufeLcbdn-9BSy4HrLTxe1RK7Sug46W8CnkJcD7f0',
        vehicle: { name: 'Heavy Tow • Unit #402', plate: 'RD-RESC-9' }
      };
    }

    ticket.status = 'Assigned';
    ticket.assigned = true;
    ticket.eta = mechanic.name === 'Marcus T.' ? 5 : 12; // Dynamic ETA based on dispatcher proximity
    ticket.mechanic = mechanic._id;
    ticket.driverName = mechanic.name;
    ticket.driverPhone = mechanic.phone;
    ticket.driverAvatar = mechanic.avatar || '';
    // Context-Aware Dynamic Dispatch Telemetry Proximity Rule
    const breakdownLat = ticket.location?.lat || 28.6304;
    const breakdownLng = ticket.location?.lng || 77.2177;
    
    // Classify remote/mountainous non-crowded areas vs. standard public/urban locations
    const isRemoteArea = 
      ticket.issue === 'mud' || 
      ticket.issue === 'flood' ||
      ticket.issue === 'terrain' ||
      (ticket.type && ticket.type.toLowerCase().includes('mud')) ||
      (ticket.type && ticket.type.toLowerCase().includes('flood')) ||
      (ticket.loc && (
        ticket.loc.toLowerCase().includes('mountain') ||
        ticket.loc.toLowerCase().includes('forest') ||
        ticket.loc.toLowerCase().includes('trail') ||
        ticket.loc.toLowerCase().includes('hills') ||
        ticket.loc.toLowerCase().includes('bypass')
      ));
      
    const angle = Math.random() * Math.PI * 2;
    let distanceDeg;
    
    if (isRemoteArea) {
      // Remote / non-crowded / mountainous area: No driver nearby, starts further away up to 30km-50km
      // 30 km to 50 km ~ 0.27 to 0.45 degrees offset
      distanceDeg = 0.27 + Math.random() * 0.18;
    } else {
      // Urban / Public location: Default to extremely close proximity of 1km to 3km
      // 1 km to 3 km ~ 0.009 to 0.027 degrees offset
      distanceDeg = 0.009 + Math.random() * 0.018;
    }
    
    const startLat = breakdownLat + Math.sin(angle) * distanceDeg;
    const startLng = breakdownLng + Math.cos(angle) * distanceDeg;
    
    ticket.driverLocation = {
      lat: startLat,
      lng: startLng
    };
    ticket.vehicle = mechanic.vehicle ? mechanic.vehicle.name : 'Heavy Tow • Unit #402';

    // Append greeting message
    ticket.chatHistory.push({
      sender: mechanic.name === 'Marcus T.' ? 'mechanic' : 'david',
      text: `This is ${mechanic.name} heavy duty specialist. I've locked on your rescue beacon and I'm deploying the flatbed unit now. ETA ${ticket.eta} minutes. Are you in a safe spot?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    await ticket.save();

    // Create a real notification for the user
    if (ticket.user) {
      await Notification.create({
        recipient: ticket.user,
        recipientType: 'User',
        title: 'Specialist Dispatched',
        message: `Rescue Unit ${mechanic.name} (${ticket.vehicle}) is en route. ETA ${ticket.eta} mins.`,
        type: 'info'
      });
    }

    if (req.io) {
      req.io.emit('ticket_assigned', ticket);
      req.io.emit('ticket_updated', ticket);
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete service request & generate payment
// @route   PUT /api/incidents/:id/complete
// @access  Private/Admin
export const completeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ticket = await ServiceRequest.findOne({ ticketId: id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'Completed';
    await ticket.save();

    // Create payment ledger record
    const amount = ticket.type.includes('Tow') ? 145.00 : 75.00;
    const txId = `TX-${Math.floor(Math.random() * 900000) + 100000}`;

    const payment = await Payment.create({
      user: ticket.user || null,
      serviceRequest: ticket._id,
      amount,
      paymentMethod: 'Credit Card',
      transactionId: txId,
      status: 'Completed'
    });

    // Create completion notification
    if (ticket.user) {
      await Notification.create({
        recipient: ticket.user,
        recipientType: 'User',
        title: 'Rescue Complete',
        message: `Your emergency SOS ticket #${ticket.ticketId} has been successfully completed. Payment of $${amount.toFixed(2)} processed.`,
        type: 'success'
      });
    }

    if (req.io) {
      req.io.emit('ticket_completed', ticket);
      req.io.emit('ticket_updated', ticket);
    }

    res.status(200).json({ success: true, data: ticket, payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request
// @route   PUT /api/incidents/:id/cancel
// @access  Private/Admin
export const cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ticket = await ServiceRequest.findOne({ ticketId: id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'Cancelled';
    await ticket.save();

    if (req.io) {
      req.io.emit('ticket_cancelled', ticket);
      req.io.emit('ticket_updated', ticket);
    }

    res.status(200).json({ success: true, message: 'Ticket cancelled successfully', data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a chat message & trigger operator auto-replies
// @route   POST /api/incidents/:id/chat
// @access  Private
export const addChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sender, text } = req.body;

    const ticket = await ServiceRequest.findOne({ ticketId: id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    ticket.chatHistory.push({
      sender,
      text,
      time
    });

    await ticket.save();

    if (req.io) {
      req.io.emit('ticket_updated', ticket);
    }

    // Trigger driver auto reply if user typed it
    if (sender === 'user') {
      setTimeout(async () => {
        let replyText = "Copy that. Preparing extraction protocols.";
        const lowercase = text.toLowerCase();
        
        if (lowercase.includes('safety') || lowercase.includes('safe')) {
          replyText = "Safety first. Stay inside the vehicle with your hazards blinking. I'm arriving shortly.";
        } else if (lowercase.includes('eta') || lowercase.includes('time') || lowercase.includes('where')) {
          replyText = "Just navigated past the main Downtown junction. Keeping an eye on active traffic, ETA is 8 minutes.";
        } else if (lowercase.includes('charger') || lowercase.includes('battery')) {
          replyText = "Affirmative, I have the mobile L3 DC fast charging generator fully prepped on my unit.";
        } else if (lowercase.includes('tire') || lowercase.includes('flat')) {
          replyText = "Understood. Bringing high-performance run-flat spares in your exact OEM dimension.";
        } else {
          const defaultReplies = [
            "Loud and clear. Keep your beacons blinking.",
            "Copy that, satellite mapping coordinates show zero obstructions. En route.",
            "Affirmative. Preparing tow tools on the flatbed bed.",
            "Understood. Maintain communications on this secure frequency."
          ];
          replyText = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
        }

        // Fetch ticket again to append reply asynchronously safely
        const refreshedTicket = await ServiceRequest.findOne({ ticketId: id });
        if (refreshedTicket) {
          refreshedTicket.chatHistory.push({
            sender: refreshedTicket.driverName === 'Marcus T.' ? 'mechanic' : 'david',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          await refreshedTicket.save();

          if (req.io) {
            req.io.emit('ticket_updated', refreshedTicket);
          }
        }
      }, 1500);
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit new emergency report with vehicle details / images
// @route   POST /api/emergency-reports
// @access  Private/Public
export const submitEmergencyReport = async (req, res, next) => {
  try {
    const { type, issue, address, lat, lng, phone, severity, photoUrl } = req.body;

    const report = await EmergencyReport.create({
      user: req.user ? req.user._id : null,
      type,
      issue,
      location: {
        address,
        lat: (lat !== undefined && lat !== null && !isNaN(Number(lat))) ? Number(lat) : 28.6304,
        lng: (lng !== undefined && lng !== null && !isNaN(Number(lng))) ? Number(lng) : 77.2177
      },
      contactPhone: phone || req.user?.phone || '+1 (555) 000-0000',
      severity: severity || 'Medium',
      photoUrl: photoUrl || ''
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all emergency reports
// @route   GET /api/emergency-reports
// @access  Private/Admin
export const getEmergencyReports = async (req, res, next) => {
  try {
    const reports = await EmergencyReport.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system logistics statistics (Admin)
// @route   GET /api/incidents/stats/admin
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Active rescues and critical alerts
    const activeRescues = await ServiceRequest.countDocuments({ status: 'Assigned' });
    const criticalAlerts = await ServiceRequest.countDocuments({ status: 'Pending' });

    // 2. Average response time
    const completed = await ServiceRequest.find({ status: 'Completed' });
    let avgResponse = 12; // fallback default
    if (completed.length > 0) {
      const totalEta = completed.reduce((sum, r) => sum + (r.eta || 10), 0);
      avgResponse = Math.round(totalEta / completed.length);
    }

    // 3. Available fleet and total fleet
    const totalFleet = await Mechanic.countDocuments({ status: 'active' });
    const busyMechanicIds = await ServiceRequest.find({ status: 'Assigned' }).distinct('mechanic');
    const busyCount = await Mechanic.countDocuments({ _id: { $in: busyMechanicIds }, status: 'active' });
    const availableFleet = Math.max(0, totalFleet - busyCount);

    // 4. Revenue Trend (last 7 days completed payments)
    const revenueDays = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayPayments = await Payment.find({
        status: 'Completed',
        createdAt: { $gte: d, $lt: nextD }
      });
      const daySum = dayPayments.reduce((sum, p) => sum + p.amount, 0);
      revenueDays[6 - i] = daySum; // populate from right to left (past to today)
    }

    // Adjust revenueDays so it looks visually nice for demo if there's no payment in DB yet
    const hasRevenue = revenueDays.some(r => r > 0);
    const finalRevenue = hasRevenue ? revenueDays : [120, 240, 180, 310, 220, 480, 350];

    // 5. Heatmap Zone Density
    const requests = await ServiceRequest.find({ status: { $in: ['Pending', 'Assigned'] } });
    const zones = {
      'North Sector': 0,
      'Downtown': 0,
      'East Side': 0,
      'West Hills': 0
    };
    requests.forEach(r => {
      const locLower = r.loc.toLowerCase();
      if (locLower.includes('north')) zones['North Sector']++;
      else if (locLower.includes('west')) zones['West Hills']++;
      else if (locLower.includes('east')) zones['East Side']++;
      else zones['Downtown']++; // default zone
    });

    res.status(200).json({
      success: true,
      data: {
        activeRescues,
        criticalAlerts,
        avgResponse,
        availableFleet,
        totalFleet,
        revenueDays: finalRevenue,
        zones
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client statistics & usage (Client)
// @route   GET /api/incidents/stats/client
// @access  Private
export const getClientStats = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    
    // 1. Active units count in sector (active mechanics in DB)
    const activeUnitsCount = await Mechanic.countDocuments({ status: 'active' });

    // 2. Usage analytics (count of user requests in last 5 weeks)
    const usageAnalytics = [0, 0, 0, 0, 0];
    if (userId) {
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);

        const count = await ServiceRequest.countDocuments({
          user: userId,
          createdAt: { $gte: start, $lt: end }
        });
        usageAnalytics[4 - i] = count;
      }
    } else {
      // Guest counts
      usageAnalytics[4] = await ServiceRequest.countDocuments({ status: { $in: ['Pending', 'Assigned'] } });
    }

    // Default usage values if user has no requests yet (for beautiful demo dashboard priming)
    const hasUsage = usageAnalytics.some(u => u > 0);
    const finalUsage = hasUsage ? usageAnalytics : [2, 4, 1, 3, 5];

    // 3. Average response time calculated from completed requests
    const completed = await ServiceRequest.find({ status: 'Completed' });
    let avgResponse = 12; // default fallback if no completed requests
    if (completed.length > 0) {
      const totalEta = completed.reduce((sum, r) => sum + (r.eta || 10), 0);
      avgResponse = Math.round(totalEta / completed.length);
    }

    res.status(200).json({
      success: true,
      data: {
        activeUnitsCount,
        usageAnalytics: finalUsage,
        avgResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active mechanics / technicians
// @route   GET /api/mechanics
// @access  Private/Admin
export const getMechanics = async (req, res, next) => {
  try {
    const filter = (req.user && req.user.role === 'admin') ? {} : { status: 'active', isApproved: true };
    const mechanics = await Mechanic.find(filter);
    
    // Find mechanics who currently have an active assigned request
    const busyMechanicIds = await ServiceRequest.find({ status: 'Assigned' }).distinct('mechanic');
    
    const mechanicsWithBusyState = mechanics.map(mech => {
      const isBusy = busyMechanicIds.some(id => id && id.toString() === mech._id.toString());
      return {
        ...mech.toObject(),
        isBusy
      };
    });

    res.status(200).json({ success: true, count: mechanicsWithBusyState.length, data: mechanicsWithBusyState });
  } catch (error) {
    next(error);
  }
};

