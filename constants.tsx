import React from 'https://esm.sh/react@19.2.3';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList } from 'https://esm.sh/lucide-react@0.563.0';
import { Flight } from './types.ts';

export const COLORS = {
  primary: '#1d4ed8', // WBC Blue
  secondary: '#ef4444', // Japan Red
  background: '#f8fafc',
  card: '#ffffff',
};

// Fix: Export EXCHANGE_RATE which is required by ExpenseView and ShoppingView to resolve module member errors.
export const EXCHANGE_RATE = 0.215;

// Fix: Complete the Flight object properties (departure, arrival, from, to, duration, price) to satisfy the Flight interface defined in types.ts.
export const DEFAULT_FLIGHTS: Flight[] = [
  {
    id: 'f1',
    date: '2026/03/05',
    airline: '中華航空',
    flightNo: 'CI100',
    departure: '08:30',
    arrival: '12:30',
    from: 'TPE',
    to: 'NRT',
    duration: '3h 00m',
    price: 15500,
    baggage: '23kg x 2',
    seat: '12A'
  }
];
