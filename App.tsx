import React, { useState, useEffect } from 'https://esm.sh/react@19.2.3';
import { Plane, Calendar, Wallet, ShoppingBag, ClipboardList, LogIn, LogOut, ShieldCheck } from 'https://esm.sh/lucide-react@0.563.0';
import { TabType, Member, ShoppingItem } from './types.ts';
import { DEFAULT_FLIGHTS } from './constants.tsx';
import BookingView from './components/BookingView.tsx';
import ItineraryView from './components/ItineraryView.tsx';
import ExpenseView from './components/ExpenseView.tsx';
import ShoppingView from './components/ShoppingView.tsx';
import PrepView from './components/PrepView.tsx';
import { db, auth, googleProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from './firebase.ts';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const ADMIN_EMAIL = "dearyumi7@gmail.com";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [user, setUser] = useState<any>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  // 1. 核心 Auth 與 跳轉結果處理
  useEffect(() => {
    if (!auth) return;

    // 處理跳轉後的回傳結果
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Redirect Login Success:', result.user.email);
        }
      } catch (error: any) {
        if (error.code === 'auth/configuration-not-found') {
          console.error("CRITICAL: Firebase Google 登入尚未啟用。請至 Firebase Console -> Authentication -> Sign-in method 啟用 Google 提供者。");
        } else if (error.code !== 'auth/no-recent-redirect-anyway') {
          console.error("Auth Error:", error.code, error.message);
        }
      }
    };

    checkRedirect();

    // 監聽登入狀態
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. 雲端同步
  useEffect(() => {
    if (!db) return;

    const handleSyncError = (error: any) => {
      if (error.code === 'permission-denied') {
        console.warn("Firestore: Guest Mode (Read-only)");
      }
    };

    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      setMembers(snap.docs.map(d => ({ ...d.data(), id: d.id })) as Member[]);
    }, handleSyncError);

    const unsubItinerary = onSnapshot(collection(db, 'itinerary'), (snap) => {
      setItineraryItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, handleSyncError);

    const unsubShopping = onSnapshot(collection(db, 'shoppingItems'), (snap) => {
      setShoppingItems(snap.docs.map(d => ({ ...d.data(), id: d.id })) as ShoppingItem[]);
    }, handleSyncError);

    return () => { unsubMembers(); unsubItinerary(); unsubShopping(); };
  }, [db]);

  // 3. 管理員身分自動判定
  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase().trim();
      const isAdmin = email === ADMIN_EMAIL.toLowerCase();
      const isRegisteredMember = members.some(m => m.note?.toLowerCase().trim() === email);
      setIsEditable(isAdmin || isRegisteredMember);
    } else {
      setIsEditable(false);
    }
  }, [user, members]);

  const handleLogin = async () => {
    if (!auth || !googleProvider) return;
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Trigger Error:", error.code);
    }
  };

  const handleLogout = () => signOut(auth).catch(console.error);

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900 overflow-hidden">
      <header className="px-6 pt-12 pb-4 bg-white shadow-sm flex justify-between items-center shrink-0 z-30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter">WBC Tokyo</h1>
            <div className={`status-dot ${user ? 'status-online' : 'status-offline'}`}></div>
            {isEditable && (
              <div className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-fade-in shadow-sm flex items-center gap-1">
                <ShieldCheck size={10} /> 管理員模式：已連線
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {user ? user.email : 'Guest Mode'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-100 rounded-full active:scale-95 transition-all">
              <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white" alt="avatar" />
              <LogOut size={16} className="text-slate-400 mr-2" />
            </button>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-[11px] font-black active:scale-95 transition-all shadow-lg shadow-blue-100">
              <LogIn size={14} /> 登入雲端
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 hide-scrollbar">
        {activeTab === 'itinerary' && <ItineraryView scheduleItems={itineraryItems} setScheduleItems={setItineraryItems} isEditable={isEditable} />}
        {activeTab === 'booking' && <BookingView flights={DEFAULT_FLIGHTS} setFlights={() => {}} transports={[]} setTransports={() => {}} hotels={[]} setHotels={() => {}} tickets={[]} setTickets={() => {}} restaurants={[]} setRestaurants={() => {}} members={members} isEditable={isEditable} />}
        {activeTab === 'expenses' && <ExpenseView members={members} isEditable={isEditable} />}
        {activeTab === 'shopping' && <ShoppingView items={shoppingItems} setItems={setShoppingItems} members={members} isEditable={isEditable} />}
        {activeTab === 'prep' && <PrepView members={members} setMembers={setMembers} isEditable={isEditable} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pb-8 pt-3 flex justify-around items-center z-50">
        {[
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'booking', icon: Plane, label: '預訂' },
          { id: 'expenses', icon: Wallet, label: '記帳' },
          { id: 'shopping', icon: ShoppingBag, label: '購物' },
          { id: 'prep', icon: ClipboardList, label: '設定' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 px-4 py-1 rounded-2xl ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[10px] font-black ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;