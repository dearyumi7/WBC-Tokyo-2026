import React, { useState } from 'https://esm.sh/react@19.2.3';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Plus, Info, Train, Trash2, X, Check, Package, Armchair, Trophy, Castle, Camera, Music, Gamepad2, Beef, Soup, Pizza, Coffee, Beer, IceCream, Sandwich } from 'https://esm.sh/lucide-react@0.563.0';
import { Flight, Transport, Accommodation, Ticket, Restaurant, Member } from '../types.ts';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { db } from '../firebase.ts';

interface BookingViewProps {
  flights: Flight[];
  setFlights: React.Dispatch<React.SetStateAction<Flight[]>>;
  transports: Transport[];
  setTransports: React.Dispatch<React.SetStateAction<Transport[]>>;
  hotels: Accommodation[];
  setHotels: React.Dispatch<React.SetStateAction<Accommodation[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  restaurants: Restaurant[];
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  members: Member[];
  isEditable?: boolean;
}

type ModalType = 'flight' | 'transport' | 'hotel' | 'ticket' | 'restaurant' | null;

const TICKET_ICONS = [
  { type: 'ticket', icon: TicketIcon, label: '一般' },
  { type: 'trophy', icon: Trophy, label: '球賽' },
  { type: 'castle', icon: Castle, label: '樂園' },
  { type: 'camera', icon: Camera, label: '景點' },
  { type: 'music', icon: Music, label: '表演' },
  { type: 'gamepad', icon: Gamepad2, label: '電玩' },
];

const RESTAURANT_ICONS = [
  { type: 'general', icon: Utensils, label: '一般' },
  { type: 'steak', icon: Beef, label: '牛排' },
  { type: 'ramen', icon: Soup, label: '拉麵' },
  { type: 'fastfood', icon: Pizza, label: '速食' },
  { type: 'rice', icon: Sandwich, label: '米飯' },
  { type: 'dessert', icon: IceCream, label: '甜點' },
  { type: 'drink', icon: Coffee, label: '咖啡' },
  { type: 'alcohol', icon: Beer, label: '酒精' },
];

const BookingView: React.FC<BookingViewProps> = ({ 
  flights, 
  transports, 
  hotels, 
  tickets, 
  restaurants, 
  members,
  isEditable = false
}) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editModes, setEditModes] = useState<Record<string, boolean>>({
    flight: false, transport: false, hotel: false, ticket: false, restaurant: false
  });

  const toggleEditMode = (section: string) => {
    if (!isEditable) return;
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const deleteItemFromDB = async (type: ModalType, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable || !db) return;
    if (!window.confirm('確定要刪除這筆資料嗎？')) return;
    const collectionName = type === 'flight' ? 'flights' : type === 'transport' ? 'transports' : type === 'hotel' ? 'hotels' : type === 'ticket' ? 'tickets' : 'restaurants';
    await deleteDoc(doc(db, collectionName, id));
  };

  const handleOpenModal = (type: ModalType) => {
    if (!isEditable) return;
    setEditingId(null);
    setModalType(type);
    const defaults: any = {
      flight: { id: Date.now().toString(), airline: '', flightNo: '', from: '', to: '', departure: '', arrival: '', date: '2026/03/05', duration: '', baggage: '23kg x 1', seat: '', memberSeats: {}, note: '' },
      transport: { id: Date.now().toString(), type: '新幹線', name: '', date: '2026/03/06', from: '', to: '', departureTime: '', arrivalTime: '', duration: '', seatInfo: '', memberSeats: {}, note: '', price: 0, currency: 'JPY' },
      hotel: { id: Date.now().toString(), name: '', address: '', checkIn: '2026/03/05', checkOut: '2026/03/10', price: 0 },
      ticket: { id: Date.now().toString(), category: '球賽票券', event: '', date: '2026/03/08', time: '18:00', teams: '', notes: '', location: '', section: '', row: '', seat: '', iconType: 'ticket' },
      restaurant: { id: Date.now().toString(), name: '', date: '2026/03/06', time: '12:00', address: '', reservedDishes: '', note: '', iconType: 'general' }
    };
    setFormData(defaults[type as string] || {});
  };

  const handleEditItem = (type: ModalType, item: any) => {
    if (!isEditable) return;
    setEditingId(item.id);
    setModalType(type);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    if (!modalType || !db || !isEditable) return;
    let processedData = { ...formData };
    if (!processedData.id) processedData.id = Date.now().toString();
    const collectionName = modalType === 'flight' ? 'flights' : modalType === 'transport' ? 'transports' : modalType === 'hotel' ? 'hotels' : modalType === 'ticket' ? 'tickets' : 'restaurants';
    await setDoc(doc(db, collectionName, processedData.id), processedData);
    setModalType(null);
    setEditingId(null);
  };

  const navTabs = [
    { id: 'flights-section', label: '機票', icon: Plane, color: 'text-blue-600' },
    { id: 'transport-section', label: '交通', icon: Train, color: 'text-blue-600' },
    { id: 'hotels-section', label: '住宿', icon: Hotel, color: 'text-blue-600' },
    { id: 'tickets-section', label: '票券', icon: TicketIcon, color: 'text-blue-600' },
    { id: 'restaurants-section', label: '餐廳', icon: Utensils, color: 'text-blue-600' },
  ];

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-slate-200">
        <div className="grid grid-cols-5 gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {navTabs.map((tab) => (
            <button key={tab.id} onClick={() => scrollToSection(tab.id)} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl active:bg-slate-100 transition-all">
              <tab.icon size={18} className={tab.color} />
              <span className="text-[11px] font-bold text-slate-600">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10 mt-4">
        {/* Flights Section */}
        <section id="flights-section" className="scroll-mt-20 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Plane size={20} className="text-blue-600" /></div>
              航班資訊
            </h2>
            {isEditable && (
              <button onClick={() => toggleEditMode('flight')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.flight ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
                {editModes.flight ? '完成' : '編輯'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {flights.map((f, i) => (
              <div key={f.id || i} onClick={() => editModes.flight && handleEditItem('flight', f)}
                className={`bg-slate-50 rounded-[2rem] p-4 border border-slate-100 relative transition-all ${editModes.flight ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
              >
                {isEditable && editModes.flight && (
                  <button onClick={(e) => deleteItemFromDB('flight', f.id || i.toString(), e)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-red-400 active:bg-red-50 z-20"><Trash2 size={16}/></button>
                )}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{f.airline}</span>
                    <span className="text-base font-bold text-slate-900">{f.flightNo}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100">{f.date}</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl py-8 px-4">
                  <div className="flex items-center justify-between relative">
                    <div className="text-center w-1/3">
                      <div className="text-2xl font-black text-slate-800">{f.departure}</div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">{f.from}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="text-[10px] font-bold text-blue-500 mb-1">{f.duration}</div>
                      <div className="w-full h-[1.5px] bg-blue-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <Plane size={14} className="text-blue-500 rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="text-2xl font-black text-slate-800">{f.arrival}</div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">{f.to}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1"><Package size={10} /> Baggage</div>
                    <div className="text-xs font-bold text-slate-700 leading-tight">{f.baggage || '--'}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1"><Armchair size={10} /> Seat</div>
                    <div className="text-[10px] font-bold text-slate-700 whitespace-pre-line leading-relaxed">{f.seat || '--'}</div>
                  </div>
                </div>
              </div>
            ))}
            {isEditable && editModes.flight && (
              <div className="flex justify-center mt-1 pb-1">
                <button onClick={() => handleOpenModal('flight')} className="w-6 h-6 flex items-center justify-center rounded-full border border-dashed border-blue-400 text-blue-400 bg-blue-400 bg-opacity-5 active:scale-90 transition-all">
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {modalType && isEditable && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setModalType(null); setEditingId(null); }}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">編輯資訊</h3>
              <button onClick={() => { setModalType(null); setEditingId(null); }} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            {/* 這裡僅放置基礎儲存邏輯，UI 部分可按需補充表單 */}
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2">
                <Check size={18} /> 儲存至雲端
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingView;