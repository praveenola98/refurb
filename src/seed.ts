import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const sampleProducts = [
  {
    name: "Apple MacBook Pro M2",
    brand: "Apple",
    processor: "Apple M2 Chip",
    ram: "16GB",
    ssd: "512GB SSD",
    price: 129900,
    discountPrice: 115000,
    condition: "A",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
    description: "Experience the power of the M2 chip. This MacBook Pro is in pristine condition with minimal signs of use.",
    specifications: { "Display": "13.3-inch Retina", "Battery": "Up to 20 hours" },
    warranty: "1 Year Store Warranty",
    featured: true,
    category: "Laptop"
  },
  {
    name: "Dell XPS 13 9310",
    brand: "Dell",
    processor: "Intel Core i7 11th Gen",
    ram: "16GB",
    ssd: "512GB NVMe SSD",
    price: 95000,
    discountPrice: 78000,
    condition: "A",
    stock: 5,
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"],
    description: "Compact and powerful. The Dell XPS 13 is the ultimate Windows ultrabook.",
    specifications: { "Display": "13.4-inch FHD+ Touch", "Weight": "1.2 kg" },
    warranty: "6 Months Warranty",
    featured: true,
    category: "Laptop"
  },
  {
    name: "HP EliteBook 840 G8",
    brand: "HP",
    processor: "Intel Core i5 11th Gen",
    ram: "8GB",
    ssd: "256GB SSD",
    price: 55000,
    discountPrice: 42000,
    condition: "B",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"],
    description: "Reliable business laptop. Great for students and office work.",
    specifications: { "Display": "14-inch FHD", "Security": "Fingerprint Reader" },
    warranty: "6 Months Warranty",
    featured: false,
    category: "Laptop"
  }
];

export const seedProducts = async () => {
  const q = query(collection(db, 'products'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log("Seeding products...");
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
    }
    console.log("Seeding complete!");
  }
};
