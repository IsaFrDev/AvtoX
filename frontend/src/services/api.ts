const BASE = 'https://savdogar-api-production.up.railway.app';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(method: string, path: string, body?: any, auth = false) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Xatolik yuz berdi');
  }
  if (res.status === 204) return {};
  return res.json();
}

async function upload(path: string, file: File) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Fayl yuklashda xato');
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  registerCompany: (data: {
    company_name: string; company_email: string; company_phone: string;
    company_address: string; admin_email: string; admin_password: string;
    admin_full_name: string; admin_phone: string;
  }) => request('POST', '/api/auth/register', data),

  registerUser: (data: {
    email: string; password: string; full_name: string; phone: string;
  }) => request('POST', '/api/auth/register/user', data),

  login: (email: string, password: string) =>
    request('POST', '/api/auth/login', { email, password }),

  refresh: (refresh_token: string) =>
    request('POST', '/api/auth/refresh', { refresh_token }),

  logout: (refresh_token: string) =>
    request('POST', '/api/auth/logout', { refresh_token }),
};

// ─── Tours ───────────────────────────────────────────────────────────────────
export const tours = {
  list: (params: {
    page?: number; page_size?: number; city?: string;
    min_price?: number; max_price?: number; start_date?: string;
    min_slots?: number; search?: string; company_id?: string;
  } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
    const qs = q.toString();
    return request('GET', `/api/tours${qs ? '?' + qs : ''}`);
  },

  get: (id: string) => request('GET', `/api/tours/${id}`),

  create: (data: {
    title: string; description: string; city: string; country: string;
    price: number; duration_days: number; start_date: string;
    end_date: string; available_slots: number;
  }) => request('POST', '/api/tours', data, true),

  update: (id: string, data: Partial<{
    title: string; description: string; city: string; country: string;
    price: number; duration_days: number; start_date: string;
    end_date: string; available_slots: number;
  }>) => request('PATCH', `/api/tours/${id}`, data, true),

  delete: (id: string) => request('DELETE', `/api/tours/${id}`, undefined, true),

  uploadImage: (id: string, file: File) => upload(`/api/tours/${id}/image`, file),

  myTours: (params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
    return request('GET', `/api/admin/tours${q.toString() ? '?' + q.toString() : ''}`, undefined, true);
  },
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookings = {
  create: (tour_id: string, guests_count: number, notes?: string) =>
    request('POST', '/api/bookings', { tour_id, guests_count, notes }, true),

  list: (params: { page?: number; page_size?: number; status?: string } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
    return request('GET', `/api/bookings${q.toString() ? '?' + q.toString() : ''}`, undefined, true);
  },

  get: (id: string) => request('GET', `/api/bookings/${id}`, undefined, true),

  updateStatus: (id: string, status: string, cancel_reason?: string) =>
    request('PATCH', `/api/bookings/${id}/status`, { status, cancel_reason }, true),

  voucherUrl: (id: string) => `${BASE}/api/bookings/${id}/voucher`,
};

// ─── CRM ─────────────────────────────────────────────────────────────────────
export const crm = {
  customers: () => request('GET', '/api/crm/customers', undefined, true),
  customer: (id: string) => request('GET', `/api/crm/customers/${id}`, undefined, true),
  addNote: (id: string, note: string) =>
    request('PATCH', `/api/crm/customers/${id}/note`, { note }, true),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reports = {
  get: (period: 'daily' | 'weekly' | 'monthly' = 'monthly') =>
    request('GET', `/api/reports?period=${period}`, undefined, true),
  dashboard: () => request('GET', '/api/reports/dashboard', undefined, true),
  recentBookings: () => request('GET', '/api/reports/recent-bookings', undefined, true),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = {
  create: (booking_id: string, rating: number, comment: string) =>
    request('POST', '/api/reviews', { booking_id, rating, comment }, true),
  forTour: (tour_id: string) => request('GET', `/api/reviews/tours/${tour_id}`),
  companyRating: (company_id: string) =>
    request('GET', `/api/reviews/companies/${company_id}/rating`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notifications = {
  list: (unread_only = false) =>
    request('GET', `/api/notifications?unread_only=${unread_only}`, undefined, true),
  unreadCount: () => request('GET', '/api/notifications/unread-count', undefined, true),
  markRead: (id: string) =>
    request('PATCH', `/api/notifications/${id}/read`, undefined, true),
  markAllRead: () => request('PATCH', '/api/notifications/read-all', undefined, true),
};

// ─── SuperAdmin ──────────────────────────────────────────────────────────────
export const superadmin = {
  pendingCompanies: () =>
    request('GET', '/api/superadmin/companies/pending', undefined, true),
  allCompanies: (status?: string) =>
    request('GET', `/api/superadmin/companies${status ? '?status=' + status : ''}`, undefined, true),
  company: (id: string) =>
    request('GET', `/api/superadmin/companies/${id}`, undefined, true),
  approve: (id: string) =>
    request('POST', `/api/superadmin/companies/${id}/approve`, undefined, true),
  reject: (id: string, reason: string) =>
    request('POST', `/api/superadmin/companies/${id}/reject`, { reason }, true),
  allUsers: () => request('GET', '/api/superadmin/users', undefined, true),
  stats: () => request('GET', '/api/superadmin/stats', undefined, true),
};

// ─── Companies ───────────────────────────────────────────────────────────────
export const companies = {
  get: (id: string) => request('GET', `/api/companies/${id}`),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chat = {
  send: (company_id: string, message: string, history: any[] = []) =>
    request('POST', `/api/chat/${company_id}`, { message, history }),
};
