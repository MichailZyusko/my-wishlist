import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return (await response.json()) as T;
}

export const api = {
  authGoogle: (idToken: string) =>
    request<{ token: string; user: { id: string; name: string } }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  getMe: () => request<{ user: { id: string; name: string } }>('/auth/me'),
  createWishlist: (payload: { title: string; description?: string }) =>
    request<{ id: string; publicId: string; title: string }>('/wishlists', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listWishlists: () => request<Wishlist[]>('/wishlists'),
  getWishlist: (id: string) =>
    request<Wishlist>(`/wishlists/${id}`),
  getPublicWishlist: (publicId: string) =>
    request<Wishlist>(`/wishlists/public/${publicId}`),
  addItem: (wishlistId: string, payload: { name: string; url: string }) =>
    request<Item>(`/wishlists/${wishlistId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateItem: (itemId: string, payload: { name?: string; url?: string }) =>
    request<Item>(`/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteItem: (itemId: string) =>
    request<Item>(`/items/${itemId}`, {
      method: 'DELETE',
    }),
  reserveItem: (itemId: string, payload: { reservedByName?: string; reservedByEmail?: string }) =>
    request(`/items/${itemId}/reserve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelReservation: (reservationId: string) =>
    request(`/reservations/${reservationId}`, { method: 'DELETE' }),
};

export type Reservation = {
  id: string;
  reservedByName?: string | null;
  reservedByEmail?: string | null;
  reservedAt: string;
};

export type Item = {
  id: string;
  name: string;
  url: string;
  referralUrl: string;
  reservation?: Reservation | null;
};

export type Wishlist = {
  id: string;
  title: string;
  description?: string | null;
  publicId: string;
  items: Item[];
};
