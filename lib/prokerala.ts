// lib/prokerala.ts
import { ApiClient } from '@prokerala/api-client';

export function getProkeralaClient() {
  const clientId = process.env.PROKERALA_CLIENT_ID!;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET!;

  return new ApiClient(clientId, clientSecret);
}
