import React, { useState } from 'react';
import { Plane, Hotel, Ticket as TicketIcon, Utensils, Plus, Edit2, Clock, MapPin, Info, Train, AlertCircle, Trash2, X, Check, ChevronUp, ChevronDown, Package, Armchair, DollarSign, Trophy, Castle, Camera, Music, Gamepad2, ShoppingCart, ExternalLink, Beef, Soup, Pizza, Coffee, Beer, IceCream, Sandwich } from 'lucide-react';
import { Flight, Transport, Accommodation, Ticket, Restaurant, Member } from '../types';

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

const TRANSPORT_TYPES = ['新幹線', '巴士', '特急電車'];

const BookingView: React.FC<BookingViewProps> = ({ 
  flights, setFlights, 
  transports, setTransports, 
  hotels, setHotels, 
  tickets, setTickets, 
  restaurants, setRestaurants,
  members
}) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [formData, setFormData] = useState<any>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [editModes, setEditModes] = useState<Record<string, boolean>>({
    flight: false,
    transport: false,
    hotel: false,
    ticket: false,
    restaurant: false
  });

  const toggleEditMode = (section: string) => {
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const moveItem = (type: ModalType, index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation(); 
    const setterMap: Record<string, any> = { 
      flight: [flights, setFlights], 
      transport: [transports, setTransports], 
      hotel: [hotels, setHotels], 
      ticket: [tickets, setTickets], 
      restaurant: [restaurants, setRestaurants] 
    };
    if (!type || !setterMap[type]) return;

    const [list, setList] = setterMap[type];
    const newList = [...list];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newList.length) return;
    
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setList(newList);
  };

  const deleteItem = (type: ModalType, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm('確定要刪除這筆資料嗎？')) return;
    if (type === 'flight') setFlights(flights.filter((_, i) => i !== index));
    if (type === 'transport') setTransports(transports.filter((_, i) => i !== index));
    if (type === 'hotel') setHotels(hotels.filter((_, i) => i !== index));
    if (type === 'ticket') setTickets(tickets.filter((_, i) => i !== index));
    if (type === 'restaurant') setRestaurants(restaurants.filter((_, i) => i !== index));
  };

  const handleOpenModal = (type: ModalType) => {
    setEditingIndex(null);
    setModalType(type);
    const defaults: any = {
      flight: { airline: '', flightNo: '', from: '', to: '', departure: '', arrival: '', date: '2026/03/05', duration: '', baggage: '23kg x 1', seat: '', memberSeats: {}, note: '' },
      transport: { type: '新幹線', name: '', date: '2026/03/06', from: '', to: '', departureTime: '', arrivalTime: '', duration: '', seatInfo: '', memberSeats: {}, note: '請將行李置於座位後方', price: 0, currency: 'JPY' },
      hotel: { name: '', address: '', checkIn: '2026/03/05', checkOut: '2026/03/10', price: 0 },
      ticket: { category: '球賽票券', event: '', date: '2026/03/08', time: '18:00', teams: '', notes: '', location: '', section: '', row: '', seat: '', iconType: 'ticket' },
      restaurant: { name: '', date: '2026/03/06', time: '12:00', address: '', reservedDishes: '', note: '', iconType: 'general' }
    };
    setFormData(defaults[type as string] || {});
  };

  const handleEditItem = (type: ModalType, index: number) => {
    setEditingIndex(index);
    setModalType(type);
    let itemData;
    if (type === 'flight') itemData = flights[index];
    else if (type === 'transport') itemData = transports[index];
    else if (type === 'hotel') itemData = hotels[index];
    else if (type === 'ticket') itemData = tickets[index];
    else if (type === 'restaurant') itemData = restaurants[index];
    
    setFormData({ ...itemData });
  };

  const handleSave = () => {
    if (!modalType) return;

    let processedData = { ...formData };
    
    if (modalType === 'flight') {
      const formattedSeats = members
        .map(m => {
          const s = formData.memberSeats?.[m.id];
          return s ? `${s} - ${m.name}` : null;
        })
        .filter(Boolean)
        .join('\n');
      processedData.seat = formattedSeats || formData.seat;
    }

    if (editingIndex !== null) {
      if (modalType === 'flight') {
        const newList = [...flights];
        newList[editingIndex] = processedData;
        setFlights(newList);
      } else if (modalType === 'transport') {
        const newList = [...transports];
        newList[editingIndex] = processedData;
        setTransports(newList);
      } else if (modalType === 'hotel') {
        const newList = [...hotels];
        newList[editingIndex] = processedData;
        setHotels(newList);
      } else if (modalType === 'ticket') {
        const newList = [...tickets];
        newList[editingIndex] = processedData;
        setTickets(newList);
      } else if (modalType === 'restaurant') {
        const newList = [...restaurants];
        newList[editingIndex] = processedData;
        setRestaurants(newList);
      }
    } else {
      if (modalType === 'flight') setFlights([...flights, processedData]);
      else if (modalType === 'transport') setTransports([...transports, processedData]);
      else if (modalType === 'hotel') {
        processedData.image = processedData.image || 'https://picsum.photos/800/400?random=' + Date.now();
        processedData.dates = `${processedData.checkIn} - ${processedData.checkOut}`;
        setHotels([...hotels, processedData]);
      } else if (modalType === 'ticket') {
        processedData.id = Date.now().toString();
        setTickets([...tickets, processedData]);
      } else if (modalType === 'restaurant') setRestaurants([...restaurants, processedData]);
    }

    setModalType(null);
    setEditingIndex(null);
  };

  const navTabs = [
    { id: 'flights-section', label: '機票', icon: Plane, color: 'text-blue-600' },
    { id: 'transport-section', label: '交通', icon: Train, color: 'text-blue-600' },
    { id: 'hotels-section', label: '住宿', icon: Hotel, color: 'text-blue-600' },
    { id: 'tickets-section', label: '票券', icon: TicketIcon, color: 'text-blue-600' },
    { id: 'restaurants-section', label: '餐廳', icon: Utensils, color: 'text-blue-600' },
  ];

  const groupedTickets = tickets.reduce((groups, ticket) => {
    const category = ticket.category || '未分類票券';
    if (!groups[category]) groups[category] = [];
    groups[category].push(ticket);
    return groups;
  }, {} as Record<string, Ticket[]>);

  const getTicketIcon = (type?: string) => {
    const found = TICKET_ICONS.find(i => i.type === type);
    return found ? found.icon : TicketIcon;
  };

  const getRestaurantIcon = (type?: string) => {
    const found = RESTAURANT_ICONS.find(i => i.type === type);
    return found ? found.icon : Utensils;
  };

  const renderCardControls = (type: ModalType, index: number, isFirst: boolean, isLast: boolean) => {
    const section = type as string;
    if (!editModes[section]) return null;
    return (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        <button disabled={isFirst} onClick={(e) => moveItem(type, index, 'up', e)} className={`p-1.5 rounded-full bg-white shadow-sm border border-slate-100 ${isFirst ? 'text-slate-100' : 'text-slate-400 active:bg-slate-50'}`}><ChevronUp size={16}/></button>
        <button onClick={(e) => deleteItem(type, index, e)} className="p-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-red-400 active:bg-red-50"><Trash2 size={16}/></button>
        <button disabled={isLast} onClick={(e) => moveItem(type, index, 'down', e)} className={`p-1.5 rounded-full bg-white shadow-sm border border-slate-100 ${isLast ? 'text-slate-100' : 'text-slate-400 active:bg-slate-50'}`}><ChevronDown size={16}/></button>
      </div>
    );
  };

  const AddButton = ({ onClick, colorClass }: { onClick: () => void, colorClass: string }) => (
    <div className="flex justify-center mt-1 pb-1">
      <button 
        onClick={onClick} 
        className={`w-6 h-6 flex items-center justify-center rounded-full border border-dashed border-blue-400 text-blue-400 bg-blue-400 bg-opacity-5 hover:bg-opacity-10 active:scale-90 transition-all`}
      >
        <Plus size={12} />
      </button>
    </div>
  );

  return (
    <div className="pb-10">
      {/* Quick Nav */}
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
            <button onClick={() => toggleEditMode('flight')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.flight ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
              {editModes.flight ? '完成' : '編輯'}
            </button>
          </div>
          <div className="space-y-4">
            {flights.map((f, i) => (
              <div 
                key={i} 
                onClick={() => editModes.flight && handleEditItem('flight', i)}
                className={`bg-slate-50 rounded-[2rem] p-4 border border-slate-100 relative transition-all ${editModes.flight ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
              >
                {renderCardControls('flight', i, i === 0, i === flights.length - 1)}
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
                    <div className="text-[10px] font-bold text-slate-700 whitespace-pre-line leading-relaxed">
                      {f.seat || '--'}
                    </div>
                  </div>
                </div>

                {f.note && (
                  <div className="mt-2 py-1.5 px-2.5 bg-blue-50/50 rounded-xl text-[10px] text-blue-700 flex gap-2">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    {f.note}
                  </div>
                )}
              </div>
            ))}
            {editModes.flight && <AddButton onClick={() => handleOpenModal('flight')} colorClass="text-blue-400 border-blue-100 bg-blue-100" />}
          </div>
        </section>

        {/* Transport Section */}
        <section id="transport-section" className="scroll-mt-20 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Train size={20} className="text-blue-600" /></div>
              交通車票
            </h2>
            <button onClick={() => toggleEditMode('transport')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.transport ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
              {editModes.transport ? '完成' : '編輯'}
            </button>
          </div>
          <div className="space-y-4">
            {transports.map((t, i) => (
              <div 
                key={i} 
                onClick={() => editModes.transport && handleEditItem('transport', i)}
                className={`bg-slate-50 rounded-[2rem] p-4 border border-slate-100 relative transition-all ${editModes.transport ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
              >
                {renderCardControls('transport', i, i === 0, i === transports.length - 1)}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-500 bg-white px-2 py-0.5 rounded-md border border-blue-100 uppercase">{t.type}</span>
                    <span className="text-base font-bold text-slate-900">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100">{t.date}</span>
                </div>
                <div className="bg-white border border-blue-100/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between relative">
                    <div className="text-left w-1/3">
                      <div className="text-2xl font-black text-slate-800">{t.departureTime}</div>
                      <div className="text-sm font-bold text-blue-600 truncate">{t.from}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-2">
                      {t.duration && <div className="text-[10px] font-bold text-blue-500 mb-1">{t.duration}</div>}
                      <div className="w-full h-[1.5px] bg-blue-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <Train size={14} className="text-blue-200" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-1/3">
                      <div className="text-2xl font-black text-slate-800">{t.arrivalTime}</div>
                      <div className="text-sm font-bold text-blue-600 truncate">{t.to}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 mb-1 pb-1 border-b border-slate-50"><Armchair size={10} /> Seat</div>
                    {members.map(m => {
                      const seatData = t.memberSeats?.[m.id];
                      if (!seatData && !t.seatInfo) return null;
                      return (
                        <div key={m.id} className="grid grid-cols-[1fr_1.5fr_1fr] text-[11px] leading-tight items-center">
                          <div className="text-left font-bold text-slate-400 border-r border-slate-100 pr-2 pl-2">
                            {seatData?.type || '指定席'}
                          </div>
                          <div className="text-center font-black text-slate-800 border-r border-slate-100 px-1">
                            {seatData?.seat || '--'}
                          </div>
                          <div className="text-right font-bold text-slate-500 pl-1">
                            {m.name}
                          </div>
                        </div>
                      );
                    })}
                    {!t.memberSeats && t.seatInfo && (
                      <div className="text-center text-[11px] font-bold text-slate-700">{t.seatInfo}</div>
                    )}
                  </div>
                </div>

                {t.note && (
                  <div className="mt-2 py-1.5 px-2.5 bg-blue-50/50 rounded-xl text-[10px] text-blue-700 flex gap-2">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    {t.note}
                  </div>
                )}
              </div>
            ))}
            {editModes.transport && <AddButton onClick={() => handleOpenModal('transport')} colorClass="text-blue-400 border-blue-100 bg-blue-100" />}
          </div>
        </section>

        {/* Hotels Section */}
        <section id="hotels-section" className="scroll-mt-20 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Hotel size={20} className="text-blue-600" /></div>
              住宿資訊
            </h2>
            <button onClick={() => toggleEditMode('hotel')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.hotel ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
              {editModes.hotel ? '完成' : '編輯'}
            </button>
          </div>
          <div className="space-y-4">
            {hotels.map((h, i) => (
              <div 
                key={i} 
                onClick={() => editModes.hotel && handleEditItem('hotel', i)}
                className={`bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 relative transition-all ${editModes.hotel ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
              >
                {renderCardControls('hotel', i, i === 0, i === hotels.length - 1)}
                <img src={h.image} className="w-full h-32 object-cover" alt={h.name} />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{h.name}</h3>
                  <div className="flex items-center gap-1.5 mb-4 group">
                    <MapPin size={12} className="text-blue-400 shrink-0" />
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>{h.address}</span>
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Check-in</div>
                      <div className="text-xs font-bold">{h.checkIn}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Check-out</div>
                      <div className="text-xs font-bold">{h.checkOut}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {editModes.hotel && <AddButton onClick={() => handleOpenModal('hotel')} colorClass="text-blue-400 border-blue-100 bg-blue-100" />}
          </div>
        </section>

        {/* Tickets Section */}
        <section id="tickets-section" className="scroll-mt-20 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><TicketIcon size={20} className="text-blue-600" /></div>
              各式票券
            </h2>
            <button onClick={() => toggleEditMode('ticket')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.ticket ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
              {editModes.ticket ? '完成' : '編輯'}
            </button>
          </div>
          {(Object.entries(groupedTickets) as [string, Ticket[]][]).map(([category, categoryTickets]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-800">{category}</h3>
              </div>
              <div className="space-y-3">
                {categoryTickets.map((t, i) => {
                  const globalIndex = tickets.findIndex(x => x.id === t.id);
                  const SpecificIcon = getTicketIcon(t.iconType);
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => editModes.ticket && handleEditItem('ticket', globalIndex)}
                      className={`bg-slate-50 rounded-[2rem] p-4 border border-slate-100 relative transition-all ${editModes.ticket ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
                    >
                      {renderCardControls('ticket', globalIndex, i === 0 && Object.keys(groupedTickets)[0] === category, i === categoryTickets.length - 1 && Object.keys(groupedTickets)[Object.keys(groupedTickets).length-1] === category)}
                      
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-base font-bold text-slate-900 truncate flex-1 pr-4">{t.event}</span>
                        <span className="text-[10px] font-bold bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100 shrink-0">{t.date}</span>
                      </div>

                      <div className="bg-white border border-blue-100/30 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 shrink-0">
                            <SpecificIcon size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {t.teams && (
                              <div className="text-sm font-black text-slate-800 leading-tight mb-1.5">{t.teams}</div>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <Clock size={12} className="text-blue-300" /> {t.time}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <MapPin size={12} className="text-blue-300" />
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.location || 'Tokyo Dome')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-blue-600 flex items-center gap-1 group transition-colors"
                                >
                                  <span>{t.location || 'Tokyo Dome'}</span>
                                  <ExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </div>
                            </div>

                            {(t.section || t.row || t.seat) && (
                              <div className="grid grid-cols-3 gap-2 border-t border-blue-50 pt-2.5">
                                {t.section && (
                                  <div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Section</div>
                                    <div className="text-[10px] font-black text-slate-700">{t.section}</div>
                                  </div>
                                )}
                                {t.row && (
                                  <div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Row</div>
                                    <div className="text-[10px] font-black text-slate-700">{t.row}</div>
                                  </div>
                                )}
                                {t.seat && (
                                  <div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Seat</div>
                                    <div className="text-[10px] font-black text-slate-700">{t.seat}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {t.notes && (
                        <div className="mt-2.5 py-2 px-3 bg-blue-50/50 rounded-xl text-[10px] text-blue-700 flex gap-2 border border-blue-100/30">
                          <Info size={12} className="shrink-0 mt-0.5 text-blue-400" />
                          <span className="font-semibold">{t.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {editModes.ticket && <AddButton onClick={() => handleOpenModal('ticket')} colorClass="text-blue-400 border-blue-100 bg-blue-100" />}
        </section>

        {/* Restaurants Section */}
        <section id="restaurants-section" className="scroll-mt-20 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Utensils size={20} className="text-blue-600" /></div>
              餐廳預約
            </h2>
            <button onClick={() => toggleEditMode('restaurant')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${editModes.restaurant ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-100'}`}>
              {editModes.restaurant ? '完成' : '編輯'}
            </button>
          </div>
          <div className="space-y-4">
            {restaurants.map((r, i) => (
              <div 
                key={i} 
                onClick={() => editModes.restaurant && handleEditItem('restaurant', i)}
                className={`bg-slate-50 rounded-[2rem] p-4 border border-slate-100 relative transition-all ${editModes.restaurant ? 'pr-12 opacity-90 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30' : ''}`}
              >
                {renderCardControls('restaurant', i, i === 0, i === restaurants.length - 1)}
                
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-base font-bold text-slate-900 truncate flex-1 pr-4">{r.name}</span>
                  <span className="text-[10px] font-bold bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-100 shrink-0">{r.date}</span>
                </div>

                <div className="bg-white border border-blue-100/30 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 shrink-0">
                      {React.createElement(getRestaurantIcon(r.iconType), { size: 22 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-lg font-black text-slate-800 tracking-tight">{r.time}</span>
                      </div>
                      {r.address && (
                        <div className="flex items-start gap-1.5 mb-2">
                          <MapPin size={12} className="text-blue-400 shrink-0 mt-0.5" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold text-slate-500 leading-snug hover:text-blue-600 flex items-center gap-1 group transition-colors"
                          >
                            <span className="min-w-0 flex-1">{r.address}</span>
                            <ExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      )}
                      {r.reservedDishes && (
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-blue-50">
                          <ShoppingCart size={12} className="text-blue-400" />
                          <span className="text-[11px] font-black text-slate-700">預約餐點：{r.reservedDishes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {r.note && (
                  <div className="mt-3 py-2 px-3 bg-blue-50/50 rounded-xl text-[10px] text-blue-700 flex gap-2 whitespace-pre-line border border-blue-100/30">
                    <span className="shrink-0 mt-0.5 text-blue-400"><Info size={12} /></span>
                    <span className="font-semibold">{r.note}</span>
                  </div>
                )}
              </div>
            ))}
            {editModes.restaurant && <AddButton onClick={() => handleOpenModal('restaurant')} colorClass="text-blue-400 border-blue-100 bg-blue-100" />}
          </div>
        </section>
      </div>

      {/* Data Entry Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setModalType(null); setEditingIndex(null); }}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {editingIndex !== null ? '編輯' : '新增'}{navTabs.find(t => modalType && t.id.includes(modalType))?.label}
                </h3>
                <button onClick={() => { setModalType(null); setEditingIndex(null); }} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                {modalType === 'flight' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">航空公司</label>
                        <input placeholder="例如：中華航空" value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">航班號</label>
                        <input placeholder="例如：CI 0154" value={formData.flightNo} onChange={e => setFormData({...formData, flightNo: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發地</label>
                        <input placeholder="TPE" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">目的地</label>
                        <input placeholder="NRT" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Baggage</label>
                      <input placeholder="例如：23kg x 1" value={formData.baggage} onChange={e => setFormData({...formData, baggage: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    
                    <div className="space-y-2 mt-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seat 分配</label>
                       {members.map(m => (
                         <div key={m.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${m.color}`}>
                             {m.name.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-600 flex-1">{m.name}</span>
                           <input 
                             placeholder="座位 (如 15A)" 
                             value={formData.memberSeats?.[m.id] || ''} 
                             onChange={e => setFormData({
                               ...formData, 
                               memberSeats: { ...formData.memberSeats, [m.id]: e.target.value }
                             })} 
                             className="w-24 bg-white border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                       ))}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註</label>
                      <input placeholder="航班備註..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
                {modalType === 'transport' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">交通工具類型</label>
                        <select 
                          value={formData.type} 
                          onChange={e => setFormData({...formData, type: e.target.value})} 
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                          {TRANSPORT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">工具名稱/班次</label>
                        <input placeholder="NOZOMI 233" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">日期</label>
                      <input placeholder="2026/03/06" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發地</label>
                        <input placeholder="東京" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">目的地</label>
                        <input placeholder="名古屋" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發時間</label>
                        <input type="time" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">抵達時間</label>
                        <input type="time" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">票價</label>
                      <div className="flex gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, currency: 'JPY'})}
                            className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                          >
                            JPY
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, currency: 'TWD'})}
                            className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                          >
                            TWD
                          </button>
                        </div>
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={formData.price || ''} 
                          onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-blue-600" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">每人 Seat 分配</label>
                       {members.map(m => (
                         <div key={m.id} className="bg-slate-50 p-3 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${m.color}`}>
                                {m.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-600">{m.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                placeholder="類型 (指定席)" 
                                value={formData.memberSeats?.[m.id]?.type || ''} 
                                onChange={e => setFormData({
                                  ...formData, 
                                  memberSeats: { 
                                    ...formData.memberSeats, 
                                    [m.id]: { ...(formData.memberSeats?.[m.id] || {}), type: e.target.value }
                                  }
                                })} 
                                className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-[11px] focus:ring-2 focus:ring-blue-500"
                              />
                              <input 
                                placeholder="座號 (6車 12-A)" 
                                value={formData.memberSeats?.[m.id]?.seat || ''} 
                                onChange={e => setFormData({
                                  ...formData, 
                                  memberSeats: { 
                                    ...formData.memberSeats, 
                                    [m.id]: { ...(formData.memberSeats?.[m.id] || {}), seat: e.target.value }
                                  }
                                })} 
                                className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-[11px] focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註</label>
                      <input placeholder="例如：請將行李置於座位後方" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
                {modalType === 'hotel' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">飯店名稱</label>
                      <input placeholder="例如：Comfort Hotel Nagoya Meiekiminami" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">地址</label>
                      <input placeholder="飯店地址" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-in 日期</label>
                        <input placeholder="2026/03/05" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-out 日期</label>
                        <input placeholder="2026/03/10" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </>
                )}
                {modalType === 'ticket' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">票券名稱 / 活動</label>
                      <input placeholder="例如：WBC 球賽" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">選擇圖示</label>
                      <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
                        {TICKET_ICONS.map((iconItem) => (
                          <button
                            key={iconItem.type}
                            onClick={() => setFormData({ ...formData, iconType: iconItem.type })}
                            className={`flex flex-col items-center gap-1 shrink-0 p-3 rounded-2xl transition-all border ${
                              formData.iconType === iconItem.type 
                                ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100' 
                                : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                          >
                            <iconItem.icon size={20} />
                            <span className="text-[9px] font-bold">{iconItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">隊伍 / 內容</label>
                      <input placeholder="例如：台灣 vs 日本" value={formData.teams} onChange={e => setFormData({...formData, teams: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">日期</label>
                        <input placeholder="2026/03/08" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">時間</label>
                        <input placeholder="19:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Section</label>
                        <input placeholder="A44" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Row</label>
                        <input placeholder="14" value={formData.row} onChange={e => setFormData({...formData, row: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seat</label>
                        <input placeholder="389" value={formData.seat} onChange={e => setFormData({...formData, seat: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">地點</label>
                      <input placeholder="例如：東京巨蛋" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">其他備註</label>
                      <input placeholder="例如：Gate 21" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
                {modalType === 'restaurant' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">餐廳名稱</label>
                      <input placeholder="例如：Peter Luger Steak House" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">類別圖示</label>
                      <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
                        {RESTAURANT_ICONS.map((iconItem) => (
                          <button
                            key={iconItem.type}
                            onClick={() => setFormData({ ...formData, iconType: iconItem.type })}
                            className={`flex flex-col items-center gap-1 shrink-0 p-3 rounded-2xl transition-all border ${
                              formData.iconType === iconItem.type 
                                ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100' 
                                : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                          >
                            <iconItem.icon size={20} />
                            <span className="text-[9px] font-bold">{iconItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">地址</label>
                      <input placeholder="餐廳完整地址" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">預約餐點 (選填)</label>
                      <input placeholder="例如：平日午間套餐*2" value={formData.reservedDishes} onChange={e => setFormData({...formData, reservedDishes: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">日期</label>
                        <input placeholder="2026/03/06" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">時間</label>
                        <input placeholder="13:15" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註 (如預約內容)</label>
                      <textarea placeholder="例如：不收現金" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 h-24" />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setModalType(null); setEditingIndex(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> {editingIndex !== null ? '更新資料' : '儲存資料'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingView;