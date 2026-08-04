import { api } from './api';
import type {
  AdminDashboard,
  Enquiry,
  Pagination,
  Product,
  PublicStats,
  Service,
  TechnicianDashboard,
  Testimonial,
  Ticket,
  User,
} from './types';

/* ------------------------------- Auth ------------------------------- */

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
  }) => api.post<{ token: string; user: User }>('/auth/register', payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api
      .get<{ user: User; stats: Record<string, number> }>('/auth/me')
      .then((r) => r.data),

  updateProfile: (payload: Partial<User>) =>
    api.patch<{ user: User }>('/auth/me', payload).then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', payload).then((r) => r.data),
};

/* ------------------------------ Tickets ----------------------------- */

export interface TicketQuery {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  customer?: string;
  search?: string;
  overdue?: string;
  unassigned?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const ticketApi = {
  list: (params: TicketQuery = {}) =>
    api
      .get<{ tickets: Ticket[]; pagination: Pagination }>('/tickets', { params })
      .then((r) => r.data),

  get: (id: string) => api.get<{ ticket: Ticket }>(`/tickets/${id}`).then((r) => r.data.ticket),

  /** Multipart, because a ticket can carry photos of the fault. */
  create: (payload: Record<string, unknown>, files: File[] = []) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null || value === '') continue;
      form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    files.forEach((file) => form.append('attachments', file));

    return api
      .post<{ ticket: Ticket }>('/tickets', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.ticket);
  },

  update: (id: string, payload: Record<string, unknown>) =>
    api.patch<{ ticket: Ticket }>(`/tickets/${id}`, payload).then((r) => r.data.ticket),

  changeStatus: (
    id: string,
    payload: { status: string; note?: string; resolutionSummary?: string; finalCost?: number }
  ) => api.patch<{ ticket: Ticket }>(`/tickets/${id}/status`, payload).then((r) => r.data.ticket),

  assign: (id: string, technicianId: string, note?: string) =>
    api
      .patch<{ ticket: Ticket }>(`/tickets/${id}/assign`, { technicianId, note })
      .then((r) => r.data.ticket),

  comment: (id: string, message: string, isInternal = false, files: File[] = []) => {
    const form = new FormData();
    form.append('message', message);
    form.append('isInternal', String(isInternal));
    files.forEach((file) => form.append('attachments', file));

    return api
      .post<{ ticket: Ticket }>(`/tickets/${id}/comments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.ticket);
  },

  rate: (id: string, stars: number, feedback?: string) =>
    api.post<{ ticket: Ticket }>(`/tickets/${id}/rate`, { stars, feedback }).then((r) => r.data.ticket),

  remove: (id: string) => api.delete(`/tickets/${id}`).then((r) => r.data),

  track: (ticketNumber: string) =>
    api.get<{ ticket: Ticket }>(`/tickets/track/${ticketNumber}`).then((r) => r.data.ticket),

  options: () =>
    api
      .get<{
        options: {
          statuses: string[];
          priorities: string[];
          categories: string[];
          serviceModes: string[];
          slaHours: Record<string, number>;
        };
      }>('/tickets/meta/options')
      .then((r) => r.data.options),
};

/* ------------------------------- Users ------------------------------ */

export const userApi = {
  list: (params: { role?: string; search?: string; page?: number; limit?: number } = {}) =>
    api.get<{ users: User[]; pagination: Pagination }>('/users', { params }).then((r) => r.data),

  technicians: () =>
    api.get<{ technicians: User[] }>('/users/technicians').then((r) => r.data.technicians),

  get: (id: string) =>
    api
      .get<{ user: User; stats: Record<string, number>; recentTickets: Ticket[] }>(`/users/${id}`)
      .then((r) => r.data),

  create: (payload: Record<string, unknown>) =>
    api.post<{ user: User }>('/users', payload).then((r) => r.data.user),

  update: (id: string, payload: Record<string, unknown>) =>
    api.patch<{ user: User }>(`/users/${id}`, payload).then((r) => r.data.user),

  deactivate: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

/* ------------------------------ Catalog ----------------------------- */

export const serviceApi = {
  list: (params: { featured?: string } = {}) =>
    api.get<{ services: Service[] }>('/services', { params }).then((r) => r.data.services),
  get: (slug: string) =>
    api.get<{ service: Service }>(`/services/${slug}`).then((r) => r.data.service),
};

export const productApi = {
  list: (
    params: {
      category?: string;
      brand?: string;
      search?: string;
      featured?: string;
      sort?: string;
      page?: number;
      limit?: number;
    } = {}
  ) =>
    api
      .get<{
        products: Product[];
        facets: { brands: string[]; categories: string[] };
        pagination: Pagination;
      }>('/products', { params })
      .then((r) => r.data),

  get: (slug: string) =>
    api
      .get<{ product: Product; related: Product[] }>(`/products/${slug}`)
      .then((r) => r.data),
};

/* ------------------------------ Contact ----------------------------- */

export const contactApi = {
  submit: (payload: {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    serviceInterest?: string;
  }) => api.post<{ message: string }>('/contact', payload).then((r) => r.data),

  list: (params: { status?: string; search?: string; page?: number } = {}) =>
    api
      .get<{ enquiries: Enquiry[]; newCount: number; pagination: Pagination }>('/contact', { params })
      .then((r) => r.data),

  update: (id: string, payload: { status?: string; internalNote?: string }) =>
    api.patch<{ enquiry: Enquiry }>(`/contact/${id}`, payload).then((r) => r.data.enquiry),

  remove: (id: string) => api.delete(`/contact/${id}`).then((r) => r.data),
};

/* ------------------------------- Stats ------------------------------ */

export const statsApi = {
  admin: () => api.get<AdminDashboard>('/stats/dashboard').then((r) => r.data),
  technician: () => api.get<TechnicianDashboard>('/stats/me').then((r) => r.data),
  public: () => api.get<{ stats: PublicStats }>('/stats/public').then((r) => r.data.stats),
  testimonials: () =>
    api.get<{ testimonials: Testimonial[] }>('/stats/testimonials').then((r) => r.data.testimonials),
};
