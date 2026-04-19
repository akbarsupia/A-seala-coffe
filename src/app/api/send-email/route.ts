import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import nodemailer from 'nodemailer';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // 🛡️ SECURITY: Verify Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      // Verifikasi token dengan Firebase Admin SDK
      await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { to, type, orderId, items, total, customerName } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let subject = '';
    let htmlContent = '';

    if (type === 'welcome') {
      subject = `Selamat Datang di Keluarga A'seala Coffe, ${customerName}! ✨`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #4b3621; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">A'SEALA COFFE</h1>
            <p style="color: #d2b48c; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">The Art of Brewing</p>
          </div>
          
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">Halo, ${customerName}! 👋</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Selamat bergabung di keluarga besar A'seala Coffe! Kami sangat senang Anda memutuskan untuk menyeduh kebahagiaan bersama kami hari ini.
            </p>
            
            <div style="background-color: #fffaf5; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #f3e5d8;">
              <p style="color: #8b4513; font-weight: bold; margin-bottom: 10px;">Mengapa A'seala?</p>
              <p style="color: #666; font-size: 14px; margin: 0;">
                Kami percaya setiap cangkir kopi punya cerita. Dengan akun ini, Anda kini bisa memesan lebih cepat, melacak riwayat ritual kopi Anda, dan mendapatkan penawaran eksklusif kedepannya.
              </p>
            </div>
            
            <p style="color: #666; font-size: 15px; margin-top: 30px;">
              Siap untuk pesanan pertama Anda? <br>
              <strong>Mari jelajahi menu pilihan kami!</strong>
            </p>
            
            <div style="margin-top: 40px;">
              <a href="http://localhost:3000/menu" style="background-color: #4b3621; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Lihat Daftar Menu</a>
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
            &copy; 2026 Aseala Coffe. All rights reserved.<br>
            Jl. Raya Pajajaran, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128
          </div>
        </div>
      `;
    } else if (type === 'reservation') {
      const { space, guests, date, time, note } = body;
      subject = `Konfirmasi Reservasi Meja - Aseala Coffe`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #4b3621; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">A'SEALA COFFE</h1>
            <p style="color: #d2b48c; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">The Art of Brewing</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Halo, ${customerName}! 👋</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
              Terima kasih telah memilih A'seala Coffe. Pemesanan tempat Anda telah kami konfirmasi. Berikut adalah rincian reservasi Anda:
            </p>
            
            <div style="background-color: #fffaf5; border: 1px dashed #d2b48c; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 8px 0; color: #8b4513; font-weight: bold; width: 40%;">Ruangan Singgasana</td>
                    <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${space || '-'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b4513; font-weight: bold;">Jumlah Tamu</td>
                    <td style="padding: 8px 0; color: #333;">${guests || '-'} Orang</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b4513; font-weight: bold;">Tanggal</td>
                    <td style="padding: 8px 0; color: #333;">${date || '-'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #8b4513; font-weight: bold;">Waktu</td>
                    <td style="padding: 8px 0; color: #333;">${time || '-'} WIB</td>
                  </tr>
                  ${note ? `
                  <tr>
                    <td style="padding: 8px 0; color: #8b4513; font-weight: bold; vertical-align: top;">Catatan Tambahan</td>
                    <td style="padding: 8px 0; color: #333; font-style: italic;">"${note}"</td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #999; font-size: 13px; font-style: italic;">Cinta selalu menunggu mereka yang tepat waktu.</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                Jika ada perubahan jadwal, silakan hubungi kami sekurang-kurangnya 2 jam sebelum waktu kedatangan Anda.
              </div>
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
            &copy; 2026 Aseala Coffe. All rights reserved.<br>
            Jl. Raya Pajajaran, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128
          </div>
        </div>
      `;
    } else {
      // DEFAULT: Receipt Email
      const itemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <div style="font-weight: bold; color: #333;">${item.name}</div>
            <div style="font-size: 12px; color: #666;">${item.quantity}x @ ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
            ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price * item.quantity)}
          </td>
        </tr>
      `).join('');

      subject = `Resi Pesanan Aseala Coffe - ${orderId}`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfdfd; border: 1px solid #eee; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #4b3621; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">A'SEALA COFFE</h1>
            <p style="color: #d2b48c; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">The Art of Brewing</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Halo, ${customerName}! 👋</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
              Terima kasih telah menyeduh kebahagiaan bersama kami. Pembayaran Anda telah kami terima dengan sukses. Berikut adalah rincian "ritual" kopi Anda hari ini:
            </p>
            
            <div style="background-color: #fffaf5; border: 1px dashed #d2b48c; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; color: #8b4513; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #d2b48c;">Menu Pesanan</th>
                    <th style="text-align: right; color: #8b4513; font-size: 12px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #d2b48c;">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 20px 0 0 0; font-size: 16px; font-weight: bold; color: #333;">Total Bayar</td>
                    <td style="padding: 20px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #4b3621;">
                      ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
              <p style="color: #999; font-size: 13px; font-style: italic;">ID Pesanan: ${orderId}</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                Pesanan Anda sedang kami siapkan dengan penuh cinta. Silakan tunggu di tempat duduk Anda atau ambil di bar jika sudah mendapatkan notifikasi selanjutnya.
              </div>
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
            &copy; 2026 Aseala Coffe. All rights reserved.<br>
            Jl. Raya Pajajaran, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"Aseala Coffe" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Email Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
