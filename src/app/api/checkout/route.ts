import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { snap } from '@/lib/midtrans';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 🛡️ SECURITY 1: Verify Authorization Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { items, customerDetails, userId } = body;

    // Security check: Ensure the userId matches the token's owner
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden: Security Breach Attempted' }, { status: 403 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 🛡️ SECURITY 2: Server-side Price Validation (Jangan percaya harga dari client!)
    let recalculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productDoc = await adminDb.collection('products').doc(item.id).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      
      const realPrice = productDoc.data()?.price || Number.MAX_SAFE_INTEGER;
      recalculatedSubtotal += (realPrice * item.quantity);
      
      validatedItems.push({
        ...item,
        price: realPrice // Gunakan harga asli dari database
      });
    }

    const orderId = `ORDER-ASC-${Date.now()}`;
    const tax = recalculatedSubtotal * 0.1;
    const grossAmount = Math.round(recalculatedSubtotal + tax);

    // 1. Build Midtrans Item Details
    const itemDetails = items.map((item: any) => ({
      id: item.id,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50),
    }));

    itemDetails.push({
      id: 'TAX-10',
      price: Math.round(tax),
      quantity: 1,
      name: 'Pajak (10%)'
    });

    // 2. Create Midtrans Transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerDetails?.firstName || 'Guest',
        last_name: customerDetails?.lastName || '',
        email: customerDetails?.email || 'customer@example.com',
        phone: customerDetails?.phone || '081234567890',
      },
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId
    });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error.message },
      { status: 500 }
    );
  }
}
