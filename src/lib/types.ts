export type Role = 'customer' | 'technician' | 'admin';

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_customer'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ServiceMode = 'onsite' | 'carry-in' | 'remote' | 'pickup-drop';

export interface Address {
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface User {
  _id: string;
  name: string;
  /** Missing for people who signed up with just a mobile number. */
  email?: string;
  phone: string;
  role: Role;
  avatar?: string;
  company?: string;
  address?: Address;
  skills?: string[];
  isAvailable?: boolean;
  activeTicketCount?: number;
  isActive: boolean;
  lastLoginAt?: string;
  notificationPrefs?: { email: boolean; whatsapp: boolean };
  createdAt: string;
}

export interface Attachment {
  _id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface TicketComment {
  _id: string;
  author: Pick<User, '_id' | 'name' | 'role' | 'avatar'>;
  message: string;
  isInternal: boolean;
  attachments: Attachment[];
  createdAt: string;
}

export interface TicketActivity {
  _id: string;
  action: string;
  by?: Pick<User, '_id' | 'name' | 'role'>;
  from?: string;
  to?: string;
  note?: string;
  at: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  customer: Pick<User, '_id' | 'name' | 'email' | 'phone' | 'company' | 'address'>;
  assignedTo?: Pick<User, '_id' | 'name' | 'email' | 'phone' | 'skills'> | null;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  serviceMode: ServiceMode;
  device?: {
    type?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    underWarranty?: boolean;
  };
  location?: Address;
  preferredSlot?: string;
  attachments: Attachment[];
  comments: TicketComment[];
  activity: TicketActivity[];
  estimatedCost: number;
  finalCost: number;
  slaDueAt?: string;
  firstRespondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionSummary?: string;
  rating?: { stars?: number; feedback?: string; ratedAt?: string };
  isOverdue?: boolean;
  isClosed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  icon: string;
  features: string[];
  startingPrice: number;
  priceNote?: string;
  ticketCategory: string;
  turnaround?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  shortDescription?: string;
  description?: string;
  specs: { label: string; value: string }[];
  price: number;
  mrp: number;
  rentalPricePerDay: number;
  condition: 'new' | 'refurbished' | 'used';
  warrantyMonths: number;
  images: string[];
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
}

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceInterest?: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  internalNote?: string;
  handledBy?: Pick<User, '_id' | 'name'> | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminDashboard {
  kpis: {
    totalTickets: number;
    openTickets: number;
    overdueTickets: number;
    unassignedTickets: number;
    ticketsToday: number;
    resolvedTickets: number;
    resolutionRate: number;
    avgResolutionHours: number;
    avgRating: number;
    ratingCount: number;
    revenue: number;
    customers: number;
    technicians: number;
    newEnquiries: number;
    lowStockProducts: number;
  };
  charts: {
    byStatus: { name: string; value: number }[];
    byPriority: { name: string; value: number }[];
    byCategory: { name: string; value: number }[];
    trend: { date: string; created: number; resolved: number }[];
  };
  topTechnicians: {
    _id: string;
    name: string;
    total: number;
    resolved: number;
    avgRating: number;
  }[];
  recentTickets: Ticket[];
}

export interface TechnicianDashboard {
  kpis: {
    active: number;
    inProgress: number;
    resolved: number;
    overdue: number;
    resolvedToday: number;
    avgRating: number;
    ratingCount: number;
  };
  charts: { byStatus: { name: string; value: number }[] };
  queue: Ticket[];
}

export interface PublicStats {
  projectsCompleted: number;
  happyClients: number;
  ticketsHandled: number;
  teamMembers: number;
  awards: number;
  yearsExperience: number;
  avgRating: number;
}

export interface Testimonial {
  _id: string;
  rating: { stars: number; feedback: string; ratedAt: string };
  category: string;
  customer: Pick<User, '_id' | 'name' | 'company' | 'avatar'>;
  assignedTo?: Pick<User, '_id' | 'name'> | null;
  createdAt: string;
}
