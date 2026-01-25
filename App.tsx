import React, { useState, useEffect } from 'react';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList, Users } from 'lucide-react';
import { TabType, Flight, Transport, Accommodation, Ticket, Restaurant, Member, ShoppingItem } from './types';
import { COLORS, DEFAULT_FLIGHTS, EXCHANGE_RATE } from './constants';
import BookingView from './components/BookingView';
import ItineraryView from './components/ItineraryView';
import ExpenseView from './components/ExpenseView';
import ShoppingView from './components/ShoppingView';
import PrepView from './components/PrepView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary'); // Set default to itinerary

  // State Management
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Yumi', color: 'bg-blue-500' },
    { id: '2', name: 'Ping', color: 'bg-pink-500' }
  ]);

  const [flights, setFlights] = useState<Flight[]>(DEFAULT_FLIGHTS);
  const [transports, setTransports] = useState<Transport[]>([
    {
      type: '新幹線',
      name: 'NOZOMI226',
      date: '2026/03/06',
      from: '名古屋',
      to: '東京',
      departureTime: '10:06',
      arrivalTime: '11:45',
      duration: '1小時39分',
      seatInfo: '',
      note: '請將行李置於座位後方',
      memberSeats: {
        '1': { type: '指定席', seat: '6車 12-A' },
        '2': { type: '指定席', seat: '6車 12-B' }
      }
    }
  ]);
  const [hotels, setHotels] = useState<Accommodation[]>([
    {
      name: 'Comfort Hotel Nagoya Meiekiminami',
      address: '1 Chome-14-16 Meiekiminami, Nakamura Ward, Nagoya, Aichi 450-0003, Japan',
      checkIn: '2026/03/05 15:00',
      checkOut: '2026/03/10 10:00',
      dates: '2026/03/05 - 2026/03/10',
      price: 25000,
      image: 'https://picsum.photos/800/400?random=1'
    }
  ]);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 't1',
      category: '球賽票券',
      event: 'WBC Pool C',
      date: '2026/03/06',
      time: '19:00',
      teams: 'Japan vs Chinese Taipei',
      section: 'A44',
      row: '14',
      seat: '389 & 390',
      notes: '',
      iconType: 'trophy'
    },
    {
      id: 't2',
      category: '球賽票券',
      event: 'WBC Pool C',
      date: '2026/03/07',
      time: '12:00',
      teams: 'Czechia vs Chinese Taipei',
      section: 'D12',
      row: '5',
      seat: '290 & 291',
      location: 'Tokyo Dome',
      notes: '',
      iconType: 'trophy'
    },
    {
      id: 't3',
      category: '景點票券',
      event: 'SHIBUYA SKY 展望台',
      date: '2026/03/06',
      time: '16:30',
      location: 'Shibuya Scramble Square',
      notes: '請提前 15 分鐘抵達 14 樓入口',
      iconType: 'camera'
    }
  ]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    { 
      name: 'Peter Luger Steak House', 
      date: '2026/03/06', 
      time: '13:15',
      address: '日本〒150-0013 Tokyo, Shibuya, Ebisu, 4 Chome−19−19 Peter Luger Steak House Tokyo',
      reservedDishes: '平日午間套餐*2',
      note: '不收現金',
      iconType: 'steak'
    }
  ]);

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'WBC 紀念球衣', category: '服飾', quantity: 1, note: 'XL號 藍色', jpyPrice: 12000, twdPrice: 3200, checked: false, memberId: '1' },
    { id: '2', name: '大谷翔平簽名球', category: '週邊', quantity: 1, note: '如果還有貨的話', jpyPrice: 5000, twdPrice: 1500, checked: true, memberId: '1' },
    { id: '3', name: '合利他命 EX Plus', category: '藥品', quantity: 3, note: '幫家人帶', jpyPrice: 6500, twdPrice: 2200, checked: false, memberId: '2' },
    { id: '4', name: '一蘭拉麵包', category: '食品', quantity: 2, note: '機場買', jpyPrice: 2000, twdPrice: 550, checked: false, memberId: '2' },
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case 'booking':
        return <BookingView 
          flights={flights} setFlights={setFlights}
          transports={transports} setTransports={setTransports}
          hotels={hotels} setHotels={setHotels}
          tickets={tickets} setTickets={setTickets}
          restaurants={restaurants} setRestaurants={setRestaurants}
          members={members}
        />;
      case 'itinerary':
        return <ItineraryView transports={transports} />;
      case 'expenses':
        return <ExpenseView members={members} />;
      case 'shopping':
        return <ShoppingView items={shoppingItems} setItems={setShoppingItems} members={members} />;
      case 'prep':
        return <PrepView members={members} setMembers={setMembers} />;
      default:
        return <ItineraryView transports={transports} />;
    }
  };

  const navItems = [
    { id: 'itinerary', icon: Calendar, label: '行程' },
    { id: 'booking', icon: Plane, label: '預訂' },
    { id: 'expenses', icon: Wallet, label: '記帳' },
    { id: 'shopping', icon: ShoppingBag, label: '購物' },
    { id: 'prep', icon: ClipboardList, label: '準備' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900">
      <header className="px-6 pt-12 pb-1 bg-white shadow-sm flex justify-between items-center shrink-0 z-30">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WBC Tokyo 2026</h1>
        </div>
        <div className="flex -space-x-2">
          {members.map(m => (
            <div key={m.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${m.color}`}>
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 pb-8 pt-3 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 px-4 py-1 rounded-2xl ${
              activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[10px] font-bold ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;