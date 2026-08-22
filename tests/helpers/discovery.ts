import { apiGet } from './api';

export type VendorQueueItem = {
  id: string;
  sourceType?: string | null;
  sourceId?: string | null;
  operationalLinked?: boolean;
  tenantId?: string | null;
  tripId?: string | null;
  departureDate?: string | null;
  category?: string;
  vendorType?: string;
  approvalStatus?: string;
  paidAmount?: number;
  advancePaid?: number;
};

export async function fetchVendorQueue(token: string): Promise<VendorQueueItem[]> {
  const res = await apiGet('/finance/control-center/vendor-queue?limit=100', token);
  if (!res.ok) {
    throw new Error(`vendor-queue ${res.status}: ${res.text.slice(0, 400)}`);
  }
  const data = res.json?.data;
  return Array.isArray(data) ? data : [];
}

export function itemsBySourceType(items: VendorQueueItem[], sourceType: string) {
  return items.filter((i) => i.sourceType === sourceType);
}

export async function discoverPublicTripSlug(pageBaseUrl: string): Promise<string | null> {
  const api =
    process.env.E2E_API_URL?.trim() || 'https://api.youthcamping.online/api';
  const base = api.replace(/\/+$/, '').endsWith('/api')
    ? api.replace(/\/+$/, '')
    : `${api.replace(/\/+$/, '')}/api`;
  const res = await fetch(`${base}/trips/public/cards?limit=20`);
  if (!res.ok) return null;
  const json = await res.json();
  const trips = json?.data || [];
  const published = trips.find(
    (t: any) => t.slug && t.status !== 'draft' && !String(t.slug).includes('mka-'),
  );
  return published?.slug || trips.find((t: any) => t.slug)?.slug || null;
}

export async function discoverAdminTrip(
  token: string,
): Promise<{ id: string; title?: string } | null> {
  const res = await apiGet('/bookings/trips', token);
  const list = res.json?.data;
  if (!Array.isArray(list) || list.length === 0) return null;
  return { id: list[0].id, title: list[0].title || list[0].name };
}

export async function discoverDeparture(
  token: string,
  tripId: string,
): Promise<{ tripId: string; departureDate: string } | null> {
  const res = await apiGet(`/trips/${tripId}/departures`, token);
  const data = res.json?.data || res.json;
  const dates: string[] = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      const date = typeof d === 'string' ? d : d?.date || d?.departureDate;
      if (date) dates.push(String(date).slice(0, 10));
    }
  }
  if (dates.length === 0) return null;
  return { tripId, departureDate: dates[0] };
}

export async function fetchOpsSection(
  token: string,
  kind: 'hotels' | 'transport' | 'guides' | 'activities',
  tripId: string,
  departureDate: string,
) {
  const path = `/ops/${kind}/${tripId}?departureDate=${encodeURIComponent(departureDate)}`;
  return apiGet(path, token);
}

export async function discoverBookingWithPassenger(
  token: string,
): Promise<{ bookingId: string; passengerId: string } | null> {
  const res = await apiGet('/bookings?limit=20', token);
  const list = res.json?.data;
  if (!Array.isArray(list)) return null;
  for (const b of list) {
    const persons = Array.isArray(b.passengers)
      ? b.passengers
      : b.passengers?.persons;
    const p = Array.isArray(persons) ? persons[0] : null;
    const passengerId = p?.id || p?._id;
    if (b.id && passengerId) {
      return { bookingId: b.id, passengerId: String(passengerId) };
    }
  }
  return list[0]?.id ? { bookingId: list[0].id, passengerId: '' } : null;
}

export function canonicalTypeForCategory(item: VendorQueueItem): string | null {
  const cat = String(item.category || item.vendorType || '').toLowerCase();
  if (cat.includes('hotel')) return 'OPS_HOTEL_BOOKING';
  if (cat.includes('trans') || cat.includes('fleet')) return 'OPS_TRANSPORT_FLEET';
  if (cat.includes('guide')) return 'OPS_GUIDE_PAYMENT';
  if (cat.includes('act')) return 'OPS_ACTIVITY';
  return item.sourceType || null;
}
