// Mock data for Stayoid — populated and empty states

const STAY_PROPERTIES = [
  {
    id: 'p1',
    name: 'Bluegrass PG',
    type: 'Boys · Coliving',
    address: 'HSR Layout, Bengaluru',
    beds: 24,
    occupied: 21,
    monthly: 252000,
    collected: 189000,
    tone: '#2E5D48',
  },
  {
    id: 'p2',
    name: 'Ivy House',
    type: 'Girls · Coliving',
    address: 'Koramangala, Bengaluru',
    beds: 18,
    occupied: 18,
    monthly: 216000,
    collected: 216000,
    tone: '#6B5A2E',
  },
  {
    id: 'p3',
    name: 'The Cedar',
    type: 'Co-ed · 2BHK units',
    address: 'Indiranagar, Bengaluru',
    beds: 12,
    occupied: 9,
    monthly: 168000,
    collected: 96000,
    tone: '#3A4F6B',
  },
  {
    id: 'p4',
    name: 'Mulberry Stays',
    type: 'Boys · Studio',
    address: 'Whitefield, Bengaluru',
    beds: 16,
    occupied: 12,
    monthly: 176000,
    collected: 132000,
    tone: '#5C3A3A',
  },
];

const STAY_BEDS = [
  // Bluegrass PG — 3 floors x 8 beds = 24
  // status: occupied, vacant, notice
  ...Array.from({ length: 24 }, (_, i) => {
    const statuses = ['o','o','o','o','o','o','o','v','o','o','o','o','o','o','o','o','o','o','o','o','o','n','o','v'];
    return { id: `b${i+1}`, room: `${Math.floor(i/2)+101}`, bed: i%2===0?'A':'B', status: statuses[i] };
  }),
];

const STAY_TENANTS = [
  { id: 't1', name: 'Aarav Mehta',    initials: 'AM', bed: 'Blue · 201A', rent: 10500, status: 'paid',    due: 'Apr 5',  joined: 'Jan 2024', phone: '+91 98451 22104' },
  { id: 't2', name: 'Priya Nair',     initials: 'PN', bed: 'Ivy · 104B',  rent: 12000, status: 'paid',    due: 'Apr 3',  joined: 'Oct 2023', phone: '+91 98451 33221' },
  { id: 't3', name: 'Rohan Kapoor',   initials: 'RK', bed: 'Blue · 104A', rent: 10500, status: 'pending', due: 'Apr 10', joined: 'Feb 2024', phone: '+91 98451 56487' },
  { id: 't4', name: 'Sanya Iyer',     initials: 'SI', bed: 'Ivy · 108A',  rent: 12000, status: 'paid',    due: 'Apr 2',  joined: 'Aug 2023', phone: '+91 98451 77892' },
  { id: 't5', name: 'Vikram Shah',    initials: 'VS', bed: 'Cedar · 3B',  rent: 14000, status: 'overdue', due: 'Mar 28', joined: 'Dec 2023', phone: '+91 98451 98234' },
  { id: 't6', name: 'Ananya Raj',     initials: 'AR', bed: 'Ivy · 112A',  rent: 12000, status: 'paid',    due: 'Apr 4',  joined: 'Jun 2024', phone: '+91 98451 21347' },
  { id: 't7', name: 'Dhruv Malhotra', initials: 'DM', bed: 'Mulberry · 2', rent: 11000, status: 'pending', due: 'Apr 12', joined: 'Mar 2025', phone: '+91 98451 44123' },
  { id: 't8', name: 'Ishita Kumari',  initials: 'IK', bed: 'Blue · 203A', rent: 10500, status: 'paid',    due: 'Apr 1',  joined: 'Nov 2023', phone: '+91 98451 65298' },
];

const STAY_PAYMENTS = [
  { id: 'pay1', who: 'Aarav Mehta',    amount: 10500, when: 'Today, 2:14 PM',    method: 'UPI',  ref: 'AM · Blue 201A' },
  { id: 'pay2', who: 'Priya Nair',     amount: 12000, when: 'Today, 11:02 AM',   method: 'UPI',  ref: 'PN · Ivy 104B' },
  { id: 'pay3', who: 'Sanya Iyer',     amount: 12000, when: 'Yesterday, 6:40 PM',method: 'Card', ref: 'SI · Ivy 108A' },
  { id: 'pay4', who: 'Ananya Raj',     amount: 12000, when: 'Yesterday, 3:12 PM',method: 'UPI',  ref: 'AR · Ivy 112A' },
  { id: 'pay5', who: 'Ishita Kumari',  initials: 'IK', amount: 10500, when: 'Apr 1, 10:22 AM',method: 'Bank', ref: 'IK · Blue 203A' },
  { id: 'pay6', who: 'Rahul D.',       amount: 10500, when: 'Apr 1, 9:15 AM',   method: 'UPI',  ref: 'RD · Blue 102A' },
];

const STAY_NOTIFS = [
  { id: 'n1', kind: 'payment', title: 'Payment received', body: 'Aarav Mehta paid ₹10,500 via UPI', when: '2 min ago', unread: true },
  { id: 'n2', kind: 'rent',    title: 'Rent due tomorrow', body: 'Rohan Kapoor · Blue 104A · ₹10,500', when: '1 hr ago', unread: true },
  { id: 'n3', kind: 'overdue', title: 'Overdue rent', body: 'Vikram Shah is 21 days past due', when: '3 hr ago', unread: true },
  { id: 'n4', kind: 'lease',   title: 'Lease renewal', body: 'Priya Nair — renewal window opens next week', when: 'Yesterday', unread: false },
  { id: 'n5', kind: 'bed',     title: 'Bed vacated', body: 'Blue 106B marked vacant by manager', when: '2 days ago', unread: false },
  { id: 'n6', kind: 'payment', title: 'Payment received', body: 'Priya Nair paid ₹12,000 via UPI', when: '2 days ago', unread: false },
];

const STAY_TOTALS = {
  properties: 4,
  beds: 70,
  occupied: 60,
  vacant: 10,
  revenueTarget: 812000,
  revenueCollected: 633000,
  activeTenants: 60,
  month: 'April 2026',
};

Object.assign(window, {
  STAY_PROPERTIES, STAY_BEDS, STAY_TENANTS, STAY_PAYMENTS, STAY_NOTIFS, STAY_TOTALS,
});
