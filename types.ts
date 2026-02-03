export type TabType = 'booking' | 'itinerary' | 'expenses' | 'shopping' | 'prep';

export interface Member {
  id: string;
  name: string;
  color?: string;
  note?: string;
}

export interface TripConfig {
  name: string;
  startDate: string;
  endDate: string;
  currencies: string[];
}

export interface Flight {
  airline: string;
  flightNo: string;
  departure: string;
  arrival: string;
  from: string;
  to: string;
  duration: string;
  price: number;
  date: string;
  note?: string;
  baggage?: string;
  seat?: string;
  memberSeats?: Record<string, string>;
}

export interface TransportTransfer {
  type: string;
  name: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
}

export interface Transport {
  type: string;
  name: string;
  date: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  seatInfo: string;
  note?: string;
  price?: number;
  currency?: 'JPY' | 'TWD' | string;
  memberSeats?: Record<string, { type: string, seat: string }>;
  transfers?: TransportTransfer[];
}

export interface Accommodation {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  dates: string;
  price: number;
  image: string;
  note?: string;
}

export interface Ticket {
  id: string;
  category: string;
  event: string;
  date: string;
  time: string;
  teams?: string;
  location?: string;
  notes: string;
  price?: string;
  section?: string;
  row?: string;
  seat?: string;
  iconType?: string;
}

export interface Restaurant {
  name: string;
  date: string;
  time: string;
  address?: string;
  note?: string;
  reservedDishes?: string;
  iconType?: string;
}

export interface CustomDetail {
  id: string;
  title: string;
  content: string;
}

export interface ScheduleItem {
  id: string;
  date: string; // New field to support independent date pages
  time: string;
  event: string;
  addr: string;
  type: string;
  plannedTransport?: Partial<Transport> | null;
  customNote?: string | null;
  price?: number;
  currency?: 'JPY' | 'TWD' | string;
  customDetails?: CustomDetail[];
}

export interface Transaction {
  id: string;
  date: string;
  currency: string;
  amount: number;
  twdAmount: number;
  location: string;
  category: string;
  payer: string;
  splitWith?: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  note: string;
  twdPrice: number;
  jpyPrice: number;
  actualJpy?: number;
  actualTwd?: number;
  actualCurrency?: string;
  image?: string;
  checked: boolean;
  memberId?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
}
