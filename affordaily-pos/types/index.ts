export interface Guest {
  id: string;
  name: string;
  phone: string;
  idPhotoUrl?: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  number: string;
  type: 'A' | 'B';
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  startAt: Date;
  endAt: Date;
  status: 'active' | 'completed' | 'cancelled' | 'pending_checkout';
  keyStatus: 'issued' | 'returned';
  nights: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'cash' | 'transfer';
  status: 'pending' | 'confirmed';
  reference?: string;
  createdAt: Date;
}

export interface Visitor {
  id: string;
  bookingId: string;
  name: string;
  checkInAt: Date;
  checkOutAt?: Date;
}

export interface Notification {
  id: string;
  type: 'pending_checkout' | 'auto_checkout' | 'low_inventory';
  message: string;
  createdAt: Date;
  isRead: boolean;
}