import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.2.3';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList, Users, Globe, Check, ShieldCheck, ExternalLink, AlertTriangle, RefreshCw, Key, ShieldAlert } from 'https://esm.sh/lucide-react@0.563.0';
import { doc, onSnapshot, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { db } from './firebase.ts';
import { TabType, Flight, Transport, Accommodation, Ticket, Restaurant, Member, ShoppingItem, TripConfig, ScheduleItem, Transaction, ChecklistItem, NoteItem } from './types.ts';
import { COLORS, DEFAULT_FLIGHTS, EXCHANGE_RATE } from './constants.tsx';
import BookingView from './components/BookingView.tsx';
import ItineraryView from './components/ItineraryView.tsx';
import ExpenseView from './components/ExpenseView.tsx';
import ShoppingView from './components/ShoppingView.tsx';
import PrepView from './components/PrepView.tsx';

// 指定同步的雲端文件路徑
const tripDocRef = doc(db, 'trips', 'main_trip_data');

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const isCloudUpdate = useRef(false);

  // --- 全域資料狀態 ---
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
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hotels, setHotels] = useState<Accommodation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<string>(EXCHANGE_RATE.toString());
  const [todo, setTodo] = useState<ChecklistItem[]>([]);
  const [packing, setPacking] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // --- 啟動時自動讀取舊有的資料 ---
  useEffect(() => {
    let unsubscribe = () => {};
    
    const startSync = async () => {
      try {
        // 先嘗試獲取一次，確認權限
        await getDoc(tripDocRef);
        setPermissionError(false);
      } catch (e: any) {
        if (e.message.includes("permission")) {
          setPermissionError(true);
        }
      }

      unsubscribe = onSnapshot(tripDocRef, (snap) => {
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
        } else {
          // 首次啟動：嘗試寫入初始標記，若報錯則會進入 onError
          setDoc(tripDocRef, { initialized: true }, { merge: true }).catch(() => {});
        }
        setHasLoaded(true);
        setPermissionError(false);
      }, (error) => {
        console.error("Firestore Sync Failed:", error);
        if (error.message.includes("permission")) {
          setPermissionError(true);
        }
        setHasLoaded(true);
      });
    };

    startSync();
    return () => unsubscribe();
  }, [retryCount]);

  // --- 自動存入雲端：當本地修改時自動寫入 ---
  useEffect(() => {
    if (!hasLoaded || isCloudUpdate.current || permissionError) return;

    const timer = setTimeout(() => {
      setDoc(tripDocRef, {
        tripConfig, members, flights, transports, hotels, tickets, restaurants,
        shoppingItems, scheduleItems, expenses, exchangeRate, todo, packing, notes
      }, { merge: true }).catch(err => {
        if (err.message.includes("permission")) setPermissionError(true);
        console.error("Auto-Save Cloud Error:", err);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [tripConfig, members, flights, transports, hotels, tickets, restaurants, shoppingItems, scheduleItems, expenses, exchangeRate, todo, packing, notes, hasLoaded, permissionError]);

  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return <ItineraryView 
          startDate={tripConfig.startDate} endDate={tripConfig.endDate} 
          scheduleItems={scheduleItems} setScheduleItems={setScheduleItems}
          transports={transports}
        />;
      case 'booking':
        return <BookingView 
          flights={flights} setFlights={setFlights}
          transports={transports} setTransports={setTransports}
          hotels={hotels} setHotels={setHotels}
          tickets={tickets} setTickets={setTickets}
          restaurants={restaurants} setRestaurants={setRestaurants}
          members={members} isEditable={true}
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
          <PrepView 
            members={members} setMembers={setMembers} 
            tripConfig={tripConfig} setTripConfig={setTripConfig}
            todo={todo} setTodo={setTodo}
            packing={packing} setPacking={setPacking}
            notes={notes} setNotes={setNotes}
          />
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
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${permissionError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${permissionError ? 'text-red-500' : 'text-emerald-500'}`}>
              {permissionError ? '雲端權限拒絕' : '雲端讀寫就緒'}
            </span>
          </div>
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
        {permissionError && (
          <div className="mt-4 bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl text-red-500 shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-1">Firestore 存取被拒</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  請至您的 Firebase Console 更新「規則 (Rules)」如下：
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 font-mono text-[9px] text-emerald-400 overflow-x-auto border border-white/10 select-all">
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                <RefreshCw size={14} /> 我已更新規則，重新連接
              </button>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> 前往 Firebase Console
              </a>
            </div>
          </div>
        )}
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