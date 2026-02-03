
import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.2.3';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Calendar, Wallet, ShoppingBag, ClipboardList, Users, Globe, Check, ShieldCheck, ExternalLink, AlertTriangle, RefreshCw, Key, ShieldAlert } from 'https://esm.sh/lucide-react@0.563.0';
import { doc, onSnapshot, setDoc, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { db } from './firebase.ts';
import { TabType, Flight, Transport, Accommodation, Ticket, Restaurant, Member, ShoppingItem, TripConfig, ScheduleItem, Transaction, ChecklistItem, CouponItem } from './types.ts';
import { DEFAULT_FLIGHTS, EXCHANGE_RATE } from './constants.tsx';
import BookingView from './components/BookingView.tsx';
import ItineraryView from './components/ItineraryView.tsx';
import ExpenseView from './components/ExpenseView.tsx';
import ShoppingView from './components/ShoppingView.tsx';
import PrepView from './components/PrepView.tsx';

// 指定唯一的同步文件路徑
const tripDocRef = doc(db, 'trips', 'main_trip_data');

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const isCloudUpdate = useRef(false);

  // --- 狀態定義 ---
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
  const [coupons, setCoupons] = useState<CouponItem[]>([]);

  // --- 啟用本地持久化快取 ---
  useEffect(() => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore Persistence failed: Browser not supported');
      }
    });
  }, []);

  // --- 封裝寫入函式 ---
  const saveToCloud = () => {
    console.log("📤 正在同步資料到 Firebase...");
    setDoc(tripDocRef, {
      tripConfig, 
      members, 
      flights, 
      transports, 
      hotels, 
      tickets, 
      restaurants,
      shoppingItems, 
      scheduleItems, 
      expenses, 
      exchangeRate, 
      todo, 
      packing, 
      coupons,
      lastUpdated: new Date().toISOString(),
      initialized: true
    }, { merge: true }).then(() => {
      console.log("✅ 同步完成");
    }).catch(err => {
      console.error("❌ 寫入失敗:", err);
    });
  };

  // --- 核心同步邏輯 (監聽雲端與快取) ---
  useEffect(() => {
    console.log("📡 啟動實時同步監聽 (含快取優先)...");
    
    const unsubscribe = onSnapshot(tripDocRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;

      if (snap.exists()) {
        const cloud = snap.data();
        console.log(`📥 收到更新 (來源: ${snap.metadata.fromCache ? '快取' : '雲端'})`);
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
        if (cloud.coupons) setCoupons(cloud.coupons);
        
        setTimeout(() => { isCloudUpdate.current = false; }, 500);
      } else {
        console.log("⚠️ 雲端/快取為空，準備初始化...");
        saveToCloud();
      }
      setHasLoaded(true);
      setPermissionError(false);
    }, (error) => {
      console.error("❌ Firestore 連接出錯:", error);
      if (error.message.includes("permission")) setPermissionError(true);
      setHasLoaded(true);
    });

    return () => unsubscribe();
  }, [retryCount]);

  // --- 監聽本地變動自動儲存 ---
  useEffect(() => {
    if (!hasLoaded || isCloudUpdate.current || permissionError) return;
    
    const timer = setTimeout(() => {
      saveToCloud();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [tripConfig, members, flights, transports, hotels, tickets, restaurants, shoppingItems, scheduleItems, expenses, exchangeRate, todo, packing, coupons]);

  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary': return <ItineraryView startDate={tripConfig.startDate} endDate={tripConfig.endDate} scheduleItems={scheduleItems} setScheduleItems={setScheduleItems} transports={transports} />;
      case 'booking': return <BookingView flights={flights} setFlights={setFlights} transports={transports} setTransports={setTransports} hotels={hotels} setHotels={setHotels} tickets={tickets} setTickets={setTickets} restaurants={restaurants} setRestaurants={setRestaurants} members={members} isEditable={true} />;
      case 'expenses': return <ExpenseView members={members} isEditable={true} currencies={tripConfig.currencies} expenses={expenses} setExpenses={setExpenses} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />;
      case 'shopping': return <ShoppingView items={shoppingItems} setItems={setShoppingItems} members={members} isEditable={true} activeCurrencies={tripConfig.currencies} />;
      case 'prep': return (
        <PrepView 
          members={members} setMembers={setMembers} 
          tripConfig={tripConfig} setTripConfig={setTripConfig} 
          todo={todo} setTodo={setTodo} 
          packing={packing} setPacking={setPacking} 
          coupons={coupons} setCoupons={setCoupons}
          setHotels={setHotels} hotels={hotels}
          setShoppingItems={setShoppingItems} shoppingItems={shoppingItems}
          setScheduleItems={setScheduleItems} scheduleItems={scheduleItems}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900">
      <header className="px-5 pt-3 pb-2 bg-white shadow-sm flex justify-between items-center shrink-0 z-30">
        <h1 className="text-xl font-bold tracking-tight">{tripConfig.name}</h1>
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${permissionError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
          <span className={`text-[8px] font-black uppercase tracking-widest ${permissionError ? 'text-red-500' : 'text-emerald-500'}`}>
            {permissionError ? '雲端權限拒絕' : '雲端快取同步中'}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4">
        {permissionError && (
          <div className="mt-4 bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider mb-1">雲端連線失敗</h3>
            <button onClick={() => setRetryCount(prev => prev + 1)} className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
              <RefreshCw size={14} /> 點此強制重連
            </button>
          </div>
        )}
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 pb-8 pt-3 flex justify-around items-center z-50">
        {[
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'booking', icon: Plane, label: '預訂' },
          { id: 'expenses', icon: Wallet, label: '記帳' },
          { id: 'shopping', icon: ShoppingBag, label: '購物' },
          { id: 'prep', icon: ClipboardList, label: '準備' },
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`flex flex-col items-center gap-1 transition-all duration-200 px-4 py-1 rounded-2xl ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[10px] font-bold ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
