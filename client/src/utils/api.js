import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({ baseURL: API_URL });

// Add request interceptor to attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Events
export const eventAPI = {
  create: (data) => api.post("/events/create", data),
  join: (data) => api.post("/events/join", data),
  getMyEvents: () => api.get("/events/my-events"),
  getDetails: (eventId) => api.get(`/events/${eventId}`),
  getVolunteers: (eventId) => api.get(`/events/${eventId}/volunteers`),
  removeParticipant: (eventId, userId) =>
    api.delete(`/events/${eventId}/remove/${userId}`),
};

// Committees
export const committeeAPI = {
  create: (data) => api.post("/committees/create", data),
  getByEvent: (eventId) => api.get(`/committees/${eventId}`),
  assignSubHead: (committeeId, data) =>
    api.put(`/committees/${committeeId}/assign-subhead`, data),
  joinCommittees: (data) => api.post("/committees/join-committees", data),
  removeVolunteer: (committeeId, userId) =>
    api.delete(`/committees/${committeeId}/remove-volunteer/${userId}`),
  delete: (committeeId) => api.delete(`/committees/${committeeId}`),
};

// Chat
export const chatAPI = {
  send: (data) => api.post("/chat/send", data),
  getHistory: (eventId, chatType, params = {}) =>
    api.get(`/chat/${eventId}/${chatType}`, { params }),
};

// Announcements
export const announcementAPI = {
  create: (data) => api.post("/announcements/create", data),
  getByEvent: (eventId, params = {}) =>
    api.get(`/announcements/${eventId}`, { params }),
  pin: (id) => api.put(`/announcements/${id}/pin`),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Payments
export const paymentAPI = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verify: (data) => api.post("/payments/verify", data),
  getStatus: (eventId, announcementId) =>
    api.get(`/payments/status/${eventId}/${announcementId}`),
};

export default api;
