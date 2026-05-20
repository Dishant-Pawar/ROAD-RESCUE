import ServiceRequest from '../models/ServiceRequest.js';
import Mechanic from '../models/Mechanic.js';
import Payment from '../models/Payment.js';
import EmergencyReport from '../models/EmergencyReport.js';
import User from '../models/User.js';

// @desc    Get all service requests (Admin)
// @route   GET /api/incidents
// @access  Private/Admin
export const getRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
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
    const { type, issue, loc, reqType } = req.body;
    
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

    const newTicket = await ServiceRequest.create({
      ticketId,
      user: req.user ? req.user._id : null,
      type,
      issue,
      loc: loc || 'Sector 4 - Downtown Grid',
      req: reqType || 'Standard Rescue',
      status: 'Pending',
      chatHistory: [
        {
          sender: 'system',
          text: `🚨 Emergency Satellite Beacon activated. Frequencies locked. Awaiting logistics dispatcher assignment...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    });

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

    // Get an active mechanic from database or use the fallback default
    const mechanic = await Mechanic.findOne({ status: 'active' }) || {
      _id: null,
      name: 'David R.',
      phone: '+1 (555) 019-2834',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByN0gReMf2EVTRsGvzJIfQkt4dNkMtXxe95dlSRKbikVzLy0AcAOwpM8ZcNBrFQ_I1kRs1s2PtxHKbUJOYvRCsPXgsbIX6REt6qWqmgb_wcVrGeD5fgoT_mjpGjtNTGEKoxy9KYXCDW5Ox6kZjGV5MtsQWklnzS9LmIWqE6Cm6gyUOKmeVudbUAPl0iV_uBYpPci72bBQXJB0QeCEejv0N6T4A9vOMdgQ69sVufeLcbdn-9BSy4HrLTxe1RK7Sug46W8CnkJcD7f0',
      vehicle: { name: 'Heavy Tow • Unit #402', plate: 'RD-RESC-9' }
    };

    ticket.status = 'Assigned';
    ticket.assigned = true;
    ticket.eta = 12;
    ticket.mechanic = mechanic._id;
    ticket.driverName = mechanic.name;
    ticket.driverPhone = mechanic.phone;
    ticket.driverAvatar = mechanic.avatar || '';
    ticket.vehicle = mechanic.vehicle ? mechanic.vehicle.name : 'Heavy Tow • Unit #402';

    // Append greeting message
    ticket.chatHistory.push({
      sender: 'david',
      text: `This is David R. heavy duty specialist. I've locked on your rescue beacon and I'm deploying the flatbed unit now. ETA 12 minutes. Are you in a safe spot?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    await ticket.save();

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
            sender: 'david',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          await refreshedTicket.save();
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
        lat: lat || 47.6062,
        lng: lng || -122.3321
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
