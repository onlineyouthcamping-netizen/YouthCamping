import { apiRequest } from './api';

export async function deletePassengerDocument(
  token: string,
  bookingId: string,
  passengerId: string,
  docId?: string,
) {
  const path = docId
    ? `/bookings/${bookingId}/documents/${docId}`
    : `/bookings/${bookingId}/passengers/${passengerId}/document`;
  return apiRequest('DELETE', path, { token });
}

export async function cleanupDocumentIfCreated(
  token: string,
  bookingId?: string,
  passengerId?: string,
  docId?: string,
) {
  if (!bookingId || !passengerId) return;
  try {
    await deletePassengerDocument(token, bookingId, passengerId, docId);
  } catch {
    // best-effort cleanup
  }
}
