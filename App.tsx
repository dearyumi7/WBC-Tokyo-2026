import React, { useState, useEffect } from 'react';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList, Users, Loader2 } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { TabType, Flight, Transport, Accommodation, Ticket, Restaurant, Member, ShoppingItem } from './types';
import BookingView from './components/BookingView';
import ItineraryView from './components/ItineraryView';
import ExpenseView from './components/ExpenseView';
import ShoppingView from './components/ShoppingView';
import PrepView from './components/PrepView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [isLoading, setIsLoading] = useState(true);

  // Firestore States
  const [members, setMembers] = useState<Member[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hotels, setHotels] = useState<Accommodation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  // Real-time Listeners
  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'members'), (s) => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() } as Member)))),
      onSnapshot(collection(db, 'booking_flights'), (s) => setFlights(s.docs.map(d => ({ id: d.id, ...d.data() } as Flight)))),
      onSnapshot(collection(db, 'booking_transports'), (s) => setTransports(s.docs.map(d => ({ id: d.id, ...d.data() } as Transport)))),
      onSnapshot(collection(db, 'booking_hotels'), (s) => setHotels(s.docs.map(d => ({ id: d.id, ...d.data() } as Accommodation)))),
      onSnapshot(collection(db, 'booking_tickets'), (s) => setTickets(s.docs.map(d => ({ id: d.id, ...d.data() } as Ticket)))),
      onSnapshot(collection(db, 'booking_restaurants'), (s) => setRestaurants(s.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant)))),
      onSnapshot(collection(db, 'shopping'), (s) => setShoppingItems(s.docs.map(d => ({ id: d.id, ...d.data() } as ShoppingItem)))),
    ];

    // Initial load check (simulated)
    setTimeout(() => setIsLoading(false), 1000);

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Sync Functions (Wrappers to replace useState setters)
  const syncItems = (collectionName: string) => async (items: any[] | ((prev: any[]) => any[])) => {
    // Note: This is a simplified version for small datasets. 
    // In production, we should call addDoc/updateDoc/deleteDoc directly in components.
    // For now, we will handle the logic where components call these proxy functions.
  };

  const handleUpdateFirestore = (collectionName: string) => async (newItems: any) => {
    // If it's a function (from React state update), we can't easily sync without knowing which ID changed.
    // So we'll pass direct CRUD functions to components instead in a real scenario.
    // To minimize changes to existing components, we'll implement a simple "last-one-wins" collection sync 
    // if passed an array, OR let the components handle their specific Firestore calls.
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="font-bold text-sm tracking-widest uppercase">Syncing with Tokyo...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'booking':
        return <BookingView 
          flights={flights} setFlights={(val: any) => {
            const list = typeof val === 'function' ? val(flights) : val;
            list.forEach((item: any) => setDoc(doc(db, 'booking_flights', item.id || Date.now().toString()), item));
          }}
          transports={transports} setTransports={(val: any) => {
            const list = typeof val === 'function' ? val(transports) : val;
            list.forEach((item: any) => setDoc(doc(db, 'booking_transports', item.id || Date.now().toString()), item));
          }}
          hotels={hotels} setHotels={(val: any) => {
            const list = typeof val === 'function' ? val(hotels) : val;
            list.forEach((item: any) => setDoc(doc(db, 'booking_hotels', item.id || Date.now().toString()), item));
          }}
          tickets={tickets} setTickets={(val: any) => {
            const list = typeof val === 'function' ? val(tickets) : val;
            list.forEach((item: any) => setDoc(doc(db, 'booking_tickets', item.id || Date.now().toString()), item));
          }}
          restaurants={restaurants} setRestaurants={(val: any) => {
            const list = typeof val === 'function' ? val(restaurants) : val;
            list.forEach((item: any) => setDoc(doc(db, 'booking_restaurants', item.id || Date.now().toString()), item));
          }}
          members={members}
        />;
      case 'itinerary':
        return <ItineraryView transports={transports} />;
      case 'expenses':
        return <ExpenseView members={members} />;
      case 'shopping':
        return <ShoppingView 
          items={shoppingItems} 
          setItems={(val: any) => {
            const list = typeof val === 'function' ? val(shoppingItems) : val;
            // Check for deletions by comparing IDs or handle specifically
            list.forEach((item: any) => setDoc(doc(db, 'shopping', item.id), item));
          }} 
          members={members} 
        />;
      case 'prep':
        return <PrepView 
          members={members} 
          setMembers={(val: any) => {
            const list = typeof val === 'function' ? val(members) : val;
            list.forEach((item: any) => setDoc(doc(db, 'members', item.id), item));
          }} 
        />;
      default:
        return <div />;
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