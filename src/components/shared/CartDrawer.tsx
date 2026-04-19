'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart();

  const formatIDR = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 w-[380px] z-[60] bg-stone-50 rounded-l-[2.5rem] shadow-2xl shadow-orange-900/10 transition-transform duration-500 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-6">
          <div>
            <h2 className="font-headline text-2xl text-orange-900">Your Vessel</h2>
            <p className="font-label text-xs tracking-widest uppercase text-stone-400 mt-1">Curated Selections</p>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <span className="material-symbols-outlined text-6xl text-stone-200">local_cafe</span>
              <p className="font-headline text-xl text-stone-400 font-bold italic">Yah, trolinya nganggur nih 🥲</p>
              <p className="text-sm text-stone-400 text-center px-6">Jangan cuma di-scroll! Yuk buruan pilih menu favoritmu biar nggak nyesel nanti.</p>
              <Link
                href="/menu"
                onClick={closeCart}
                className="mt-4 bg-primary text-white px-8 py-3 rounded-full text-sm font-label font-bold tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md"
              >
                Gass Jajan Kuy! 🚀
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                  <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline text-sm text-on-surface leading-snug">{item.name}</h4>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{item.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-primary">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="font-label text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-primary">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <span className="font-body text-sm font-bold text-primary">{formatIDR(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start text-stone-300 hover:text-red-400 mt-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 border-t border-stone-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-label uppercase tracking-widest text-xs text-stone-400">Total</span>
              <span className="font-headline text-2xl text-primary font-bold">{formatIDR(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-primary text-white py-4 rounded-full font-label tracking-wide text-sm shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container"
            >
              Proceed to Ritual →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
