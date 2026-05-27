import api from "./api";

export interface BookingLinkRecord {
  id: string;
  tripId: string;
  tripName: string | null;
  departureDate: string | null;
  pickupCity: string | null;
  paymentMode: string | null;
  customAmount: number | null;
  expiresAt: string | null;
  status: string;
  tokenPrefix: string;
  openedCount: number;
  completedCount: number;
  createdByAdminId: string | null;
  createdAt: string;
  shareUrl?: string | null;
}

export const bookingLinksService = {
  async create(data: {
    tripId: string;
    departureDate: string; // yyyy-mm-dd or ISO
    paymentMode: string; // "Full Payment" | "Partial Payment"
    customAmount: number;
    pickupCity: string;
    expiresAt?: string | null; // optional
  }): Promise<BookingLinkRecord> {
    const res = await api.post("/booking-links", data);
    return res.data.data;
  },

  async getAll(): Promise<BookingLinkRecord[]> {
    const res = await api.get("/booking-links");
    return res.data.data;
  },

  async revoke(id: string): Promise<BookingLinkRecord> {
    const res = await api.post(`/booking-links/${id}/revoke`);
    return res.data.data;
  },

  async getAnalytics(params?: { from?: string; to?: string; salesAdminId?: string }): Promise<{
    linksGenerated: number;
    opened: number;
    completedBookings: number;
    revenueGenerated: number;
  }> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.salesAdminId) qs.set("salesAdminId", params.salesAdminId);

    const url = qs.toString() ? `/booking-links/analytics?${qs.toString()}` : "/booking-links/analytics";
    const res = await api.get(url);
    return res.data.data;
  },
};

