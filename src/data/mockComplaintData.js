/**
 * Mock complaint data for fallback when network is unavailable
 */

const MOCK_COMPLAINTS = [
  {
    id: 'mock-1',
    lat: 11.0168,
    lng: 76.9558,
    weight: 5,
    status: 'pending',
    color: '#FF4444',
    markerType: 'active',
    complaintType: 'sewage_overflow',
    priorityLevel: 'CRITICAL',
    priorityScore: 0.95,
    createdAt: new Date().toISOString(),
    location: 'RS Puram Main Road',
    daysSinceCreated: 0,
    tooltip: 'SEWAGE OVERFLOW\nStatus: PENDING\nPriority: CRITICAL\nToday\nLocation: RS Puram Main Road'
  },
  {
    id: 'mock-2',
    lat: 11.0361,
    lng: 76.8928,
    weight: 5,
    status: 'pending',
    color: '#FF4444',
    markerType: 'active',
    complaintType: 'fire_hazard',
    priorityLevel: 'CRITICAL',
    priorityScore: 1,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    location: 'Vadavalli Area',
    daysSinceCreated: 2,
    tooltip: 'FIRE HAZARD\nStatus: PENDING\nPriority: CRITICAL\n2 days ago\nLocation: Vadavalli Area'
  },
  {
    id: 'mock-3',
    lat: 11.0041,
    lng: 76.9614,
    weight: 4,
    status: 'in_progress',
    color: '#FF8800',
    markerType: 'active',
    complaintType: 'water_leakage',
    priorityLevel: 'HIGH',
    priorityScore: 0.8,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    location: 'Peelamedu Junction',
    daysSinceCreated: 4,
    tooltip: 'WATER LEAKAGE\nStatus: IN PROGRESS\nPriority: HIGH\n4 days ago\nLocation: Peelamedu Junction'
  },
  {
    id: 'mock-4',
    lat: 10.9962,
    lng: 76.9617,
    weight: 4,
    status: 'in_progress',
    color: '#FF8800',
    markerType: 'active',
    complaintType: 'traffic_signal',
    priorityLevel: 'HIGH',
    priorityScore: 0.75,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 8)).toISOString(),
    location: 'Gandhipuram Market',
    daysSinceCreated: 0,
    tooltip: 'TRAFFIC SIGNAL\nStatus: IN PROGRESS\nPriority: HIGH\n8 hours ago\nLocation: Gandhipuram Market'
  },
  {
    id: 'mock-5',
    lat: 11.0510,
    lng: 76.8735,
    weight: 3,
    status: 'pending',
    color: '#FF4444',
    markerType: 'active',
    complaintType: 'broken_streetlight',
    priorityLevel: 'MEDIUM',
    priorityScore: 0.65,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    location: 'Vadavalli Main Road',
    daysSinceCreated: 5,
    tooltip: 'BROKEN STREETLIGHT\nStatus: PENDING\nPriority: MEDIUM\n5 days ago\nLocation: Vadavalli Main Road'
  },
  {
    id: 'mock-7',
    lat: 11.0085,
    lng: 76.9279,
    weight: 1,
    status: 'completed',
    color: '#00AA44',
    markerType: 'resolved',
    complaintType: 'pothole',
    priorityLevel: 'HIGH',
    priorityScore: 0.85,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    resolvedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    location: 'Saibaba Colony',
    daysSinceCreated: 10,
    tooltip: 'POTHOLE\nStatus: COMPLETED\nPriority: HIGH\n10 days ago\nLocation: Saibaba Colony'
  },
  {
    id: 'mock-8',
    lat: 11.0047,
    lng: 76.9661,
    weight: 1,
    status: 'resolved',
    color: '#00CC44',
    markerType: 'resolved',
    complaintType: 'garbage_collection',
    priorityLevel: 'MEDIUM',
    priorityScore: 0.7,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    resolvedAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
    location: 'Singanallur area',
    daysSinceCreated: 15,
    tooltip: 'GARBAGE COLLECTION\nStatus: RESOLVED\nPriority: MEDIUM\n15 days ago\nLocation: Singanallur area'
  }
];

const MOCK_STATISTICS = {
  total: MOCK_COMPLAINTS.length,
  resolved: MOCK_COMPLAINTS.filter(c => c.status === 'completed' || c.status === 'resolved').length,
  active: MOCK_COMPLAINTS.filter(c => c.status !== 'completed' && c.status !== 'resolved').length,
  pending: MOCK_COMPLAINTS.filter(c => c.status === 'pending').length,
  resolutionRate: Math.round((MOCK_COMPLAINTS.filter(c => c.status === 'completed' || c.status === 'resolved').length / MOCK_COMPLAINTS.length) * 100),
  averageResolutionDays: 7,
  byType: {
    sewage_overflow: 1,
    fire_hazard: 1,
    water_leakage: 1,
    traffic_signal: 1,
    broken_streetlight: 1,
    pothole: 1,
    garbage_collection: 1,
    others: 0
  },
  byPriority: {
    CRITICAL: 2,
    HIGH: 3,
    MEDIUM: 2
  },
  oldestPending: MOCK_COMPLAINTS.filter(c => c.status === 'pending').sort((a, b) => a.daysSinceCreated - b.daysSinceCreated)[0]
};

export { MOCK_COMPLAINTS, MOCK_STATISTICS };
