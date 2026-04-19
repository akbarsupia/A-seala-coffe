// @ts-ignore
import midtransClient from 'midtrans-client';

// Create Snap API instance
export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});
