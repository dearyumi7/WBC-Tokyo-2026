
import React from 'react';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList } from 'lucide-react';
import { Flight } from './types';

export const COLORS = {
  primary: '#1d4ed8', // WBC Blue
  secondary: '#ef4444', // Japan Red
  background: '#f8fafc',
  card: '#ffffff',
};

export const DEFAULT_FLIGHTS: Flight[] = [
  {
    date: '2026/03/05',
    airline: '中華航空',
    flightNo: 'CI 0154',
    from: 'TPE 台北 T2',
    to: 'NGO 名古屋 T1',
    departure: '07:35',
    arrival: '11:05',
    duration: '2小時30分',
    price: 12500,
    baggage: '23kg x 1',
    seat: '15A - Yumi\n15B - Ping',
    note: '請於3/4前預訂餐點，並開始預約自動報到'
  },
  {
    date: '2026/03/10',
    airline: '中華航空',
    flightNo: 'CI 0173',
    from: 'KIX 大阪 T1',
    to: 'TPE 台北 T2',
    departure: '19:00',
    arrival: '21:15',
    duration: '3小時15分',
    price: 13200,
    baggage: '23kg x 1',
    seat: '22C - Yumi\n22D - Ping',
    note: '請於3/9前預訂餐點，並開始預約自動報到'
  }
];

export const EXCHANGE_RATE = 0.21; // 1 JPY = 0.21 TWD approx
