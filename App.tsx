import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.2.3';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList, Users, Globe, Check, ShieldCheck, ExternalLink } from 'https://esm.sh/lucide-react@0.563.0';
import { doc, onSnapshot, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { db } from './firebase.ts';
import { TabType, Flight, Transport, Accommodation, Ticket, Restaurant, Member, ShoppingItem, TripConfig, ScheduleItem, Transaction, ChecklistItem, NoteItem } from './types.ts';
import { COLORS, DEFAULT_FLIGHTS, EXCHANGE_RATE } from './constants.tsx';
import BookingView from './components/BookingView.tsx';
import ItineraryView from './components/ItineraryView.tsx';
import ExpenseView from './components/ExpenseView.tsx';
import ShoppingView from './components/ShoppingView.tsx';
import PrepView from './components/PrepView.tsx';

const tripDocRef = doc(db, 'trips', 'tokyo_wbc_2026_shared');

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [hasLoaded, setHasLoaded] = useState(false);
  const isCloudUpdate = useRef(false);

  // --- 全域同步狀態 ---
  const [tripConfig, setTripConfig] = useState<TripConfig>({
    name: 'WBC Tokyo 2026',
    startDate: '2026-03-05',
    endDate: '2026-03-10',
    currencies: ['JPY', 'TWD']
  });
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
    { id: '1', name: 'WBC 紀念球衣', category: '服飾', quantity: 1, note: 'XL號 藍色', jpyPrice: 12000, twdPrice: 3200, checked: false, memberId: '1', location: 'Tokyo Dome' }
  ]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { 
      id: '1', 
      time: '05:35', 
      event: '抵達桃園機場第二航廈', 
      addr: 'Taoyuan International Airport T2', 
      type: 'transport'
    }
  ]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string>(EXCHANGE_RATE.toString());
  const [todo, setTodo] = useState<ChecklistItem[]>([]);
  const [packing, setPacking] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // --- Firestore 監聽器 ---
  useEffect(() => {
    const unsubscribe = onSnapshot(tripDocRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;

      if (snap.exists()) {
        const cloud = snap.data();
        isCloudUpdate.current = true;
        if (cloud.tripConfig) setTripConfig(cloud.tripConfig);
        if (cloud.members) setMembers(cloud.members);
        if (cloud.flights) setFlights(cloud.flights);
        if (cloud.transports) setTransports(cloud.transports);
        if (cloud.hotels) setHotels(cloud.hotels);
        if (cloud.tickets) setTickets(cloud.tickets);
        if (cloud.restaurants) setRestaurants(cloud.restaurants);
        if (cloud.shoppingItems) setShoppingItems(cloud.shoppingItems);
        if (cloud.scheduleItems) setScheduleItems(cloud.scheduleItems);
        if (cloud.expenses) setExpenses(cloud.expenses);
        if (cloud.exchangeRate) setExchangeRate(cloud.exchangeRate);
        if (cloud.todo) setTodo(cloud.todo);
        if (cloud.packing) setPacking(cloud.packing);
        if (cloud.notes) setNotes(cloud.notes);
        
        setTimeout(() => { isCloudUpdate.current = false; }, 300);
      }
      setHasLoaded(true);
    }, (error) => {
      console.error("Firestore Error:", error);
      setHasLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // --- 行程資料（ScheduleItems）即時同步機制 ---
  useEffect(() => {
    if (!hasLoaded || isCloudUpdate.current) return;
    
    updateDoc(tripDocRef, { scheduleItems }).catch(err => {
      console.error("Immediate Itinerary Sync Error:", err);
    });
  }, [scheduleItems, hasLoaded]);

  // --- 其他資料類別的自動儲存機制 ---
  useEffect(() => {
    if (!hasLoaded || isCloudUpdate.current) return;

    const timer = setTimeout(() => {
      setDoc(tripDocRef, {
        tripConfig, members, flights, transports, hotels, tickets, restaurants,
        shoppingItems, expenses, exchangeRate, todo, packing, notes
      }, { merge: true }).catch(err => {
        console.error("Cloud Save Error:", err);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [tripConfig, members, flights, transports, hotels, tickets, restaurants, shoppingItems, expenses, exchangeRate, todo, packing, notes, hasLoaded]);

  const renderContent = () => {
    switch (activeTab) {
      case 'booking':
        return <BookingView 
          flights={flights} setFlights={setFlights}
          transports={transports} setTransports={setTransports}
          hotels={hotels} setHotels={setHotels}
          tickets={tickets} setTickets={setTickets}
          restaurants={restaurants} setRestaurants={setRestaurants}
          members={members} isEditable={true}
        />;
      case 'itinerary':
        return <ItineraryView 
          startDate={tripConfig.startDate} endDate={tripConfig.endDate} 
          scheduleItems={scheduleItems} setScheduleItems={setScheduleItems}
          transports={transports}
        />;
      case 'expenses':
        return <ExpenseView 
          members={members} isEditable={true} currencies={tripConfig.currencies}
          expenses={expenses} setExpenses={setExpenses}
          exchangeRate={exchangeRate} setExchangeRate={setExchangeRate}
        />;
      case 'shopping':
        return <ShoppingView 
          items={shoppingItems} setItems={setShoppingItems} 
          members={members} isEditable={true} activeCurrencies={tripConfig.currencies} 
        />;
      case 'prep':
        return (
          <div className="space-y-6">
            <PrepView 
              members={members} setMembers={setMembers} 
              tripConfig={tripConfig} setTripConfig={setTripConfig}
              todo={todo} setTodo={setTodo}
              packing={packing} setPacking={setPacking}
              notes={notes} setNotes={setNotes}
            />
          </div>
        );
      default:
        return null;
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
          <h1 className="text-2xl font-bold tracking-tight">{tripConfig.name}</h1>
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