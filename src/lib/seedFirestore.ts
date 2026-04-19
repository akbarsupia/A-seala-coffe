import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const menuItems = {
  celestial: [
    { name: 'Hot Cappuccino', price: 30000, desc: 'Espresso dengan paduan steam milk lembut dan foam tebal.', img: '/images/cappuccino.png', category: 'celestial', featured: true },
    { name: 'Ice Rose Latte', price: 35000, desc: 'Minuman dingin segar dengan sensasi floral mawar yang chill.', img: '/images/rose_latte.png', category: 'celestial' },
    { name: 'Cafe Latte', price: 32000, desc: 'Kopi susu klasik dengan racikan espresso dan susu yang super pas.', img: '/images/cafe_latte.png', category: 'celestial', featured: true },
  ],
  ancient: [
    { name: 'Kopsus Gula Aren', price: 25000, desc: 'Es kopi susu manis legit, paling favorit buat nongkrong.', img: '/images/kopsus_aren.png', category: 'ancient' },
    { name: 'Cold Brew Coffee', price: 30000, desc: 'Kopi seduh dingin 12 jam, rasanya segar dan bebas asam lambung.', img: '/images/cold_brew.png', category: 'ancient' },
    { name: 'Aseala House Beans', price: 75000, desc: 'Kemas biji kopi andalan kami buat kamu seduh sendiri di rumah.', img: '/images/house_beans.png', category: 'ancient' },
    { name: 'Iced Americano', price: 22000, desc: 'Tegang? Minum Americano segar ini buat balikin fokusmu seketika.', img: '/images/iced_americano.png', category: 'ancient' },
  ],
  noncoffee: [
    { name: 'Matcha Latte', price: 35000, desc: 'Teh hijau pekat khas Jepang dengan susu segar.', img: '/images/Matcha Latte.png', category: 'noncoffee' },
    { name: 'Signature Chocolate', price: 35000, desc: 'Cokelat premium kental yang manis dan menenangkan.', img: '/images/Signature Chocolate.png', category: 'noncoffee' },
    { name: 'Red Velvet Latte', price: 35000, desc: 'Sensasi rasa kue red velvet cair yang lembut.', img: '/images/Red Velvet Late.png', category: 'noncoffee' },
    { name: 'Iced Lychee Tea', price: 28000, desc: 'Teh leci segar dengan buah leci asli.', img: '/images/Iced Lychee Tea.png', category: 'noncoffee' },
    { name: 'Yuzu Espresso Tonic', price: 38000, desc: 'Mocktail segar dengan sirup yuzu Jepang, tonic, dan espresso.', img: '/images/Yuzu Espresso Tonic.png', category: 'noncoffee' },
    { name: 'Cookies & Cream Frappe', price: 40000, desc: 'Susu blend es dengan remah Oreo dan vanilla.', img: '/images/Cookies & Cream Frappe.png', category: 'noncoffee' },
  ],
  food: [
    { name: 'Butter Croissant', price: 25000, desc: 'Klasik, renyah di luar lembut di dalam.', img: '/images/butter_croissant.png', category: 'food' },
    { name: 'French Fries', price: 22000, desc: 'Cemilan santai gurih nan renyah.', img: '/images/french_fries.png', category: 'food' },
    { name: 'Choco Lava Cake', price: 32000, desc: 'Cokelat lumer di dalam untuk sweet tooth.', img: '/images/Choco Lava Cake.png', category: 'food' },
    { name: 'Mix Platter', price: 40000, desc: 'Sosis, nugget, dan kentang untuk berbagi bersama.', img: '/images/Mix Platter.png', category: 'food' },
    { name: 'Nasi Goreng Aseala', price: 35000, desc: 'Gurih dengan telor mata sapi dan bumbu khas.', img: '/images/Nasi Goreng Aseala.png', category: 'food' },
    { name: 'Spaghetti Aglio Olio', price: 42000, desc: 'Pasta klasik bercita rasa bawang putih & cabai.', img: '/images/Spaghetti Aglio Olio.png', category: 'food' },
    { name: 'Chicken Katsu Don', price: 38000, desc: 'Mudah dimakan, enak, dan sangat mengenyangkan.', img: '/images/Chicken Katsu Don.png', category: 'food' },
    { name: 'Club Sandwich', price: 35000, desc: 'Roti lapis tebal dengan ayam dan sayuran.', img: '/images/Club Sandwich.png', category: 'food' },
    { name: 'Beef Bulgogi Bowl', price: 45000, desc: 'Nasi hangat dengan irisan daging sapi bumbu manis.', img: '/images/Beef Bulgogi Bowl.png', category: 'food' },
  ]
};

export async function seedProducts() {
  const productsRef = collection(db, 'products');
  
  // Check if already seeded to avoid duplicates
  const snapshot = await getDocs(productsRef);
  if (!snapshot.empty) {
    console.log('Products already exist in Firestore at /products');
    return { status: 'skipped', count: snapshot.size };
  }

  let count = 0;
  const allItems = [
    ...menuItems.celestial,
    ...menuItems.ancient,
    ...menuItems.noncoffee,
    ...menuItems.food
  ];

  for (const item of allItems) {
    await addDoc(productsRef, {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    count++;
  }

  return { status: 'success', count };
}
