export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'customer';
  createdAt: string;
  blocked?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  processor: string;
  ram: string;
  ssd: string;
  price: number;
  discountPrice?: number;
  condition: 'A' | 'B' | 'C';
  stock: number;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  featured?: boolean;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentId?: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
