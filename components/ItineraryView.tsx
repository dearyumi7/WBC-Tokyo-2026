import React, { useState, useEffect, useRef, useMemo } from 'https://esm.sh/react@19.2.3';
import { MapPin, Navigation, Plus, Sun, Cloud, Clock, Wind, Edit3, Check, X, Info, Trash2, Train, Bus, Car, Plane, Footprints, ChevronRight, ArrowRight, ChevronDown, ChevronUp, StickyNote, DollarSign, GripVertical, History, Utensils, ShoppingBag, Map as MapIcon, Loader2, ArrowLeft, BookOpen, Settings, ListPlus, Bold, Italic, Type, Palette, Minus, ExternalLink, Link, Image, Search, AlertTriangle, CloudRain, CloudLightning } from 'https://esm.sh/lucide-react@0.563.0';
import { Transport, TransportTransfer } from '../types.ts';

import { db } from '../firebase.ts';
import { doc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

interface CustomDetail {
  id: string;
  title: string;
  content: string;
}

interface ScheduleItem {
  id: string;
  date: string; // 新增日期欄位
  time: string;
  event: string;
  addr: string;
  type: string;
  plannedTransport?: Partial<Transport> | null;
  customNote?: string | null;
  price?: number;
  currency?: 'JPY' | 'TWD' | string;
  customDetails?: CustomDetail[];
}

interface RichTextEditorProps {
  initialValue: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationValue, setLocationValue] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
  };

  const restoreSelection = (rangeToRestore?: Range | null) => {
    const range = rangeToRestore || savedRange;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (range) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const execCommand = (command: string, value: string = '') => {
    restoreSelection();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        restoreSelection();
        const imgHtml = `<div style="margin: 12px 0;"><img src="${base64}" style="max-width: 100%; height: auto; border-radius: 12px; display: block;" /></div><br>`;
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openLocationModal = () => {
    saveSelection();
    setIsLocationModalOpen(true);
  };

  const confirmLocation = () => {
    if (locationValue.trim()) {
      restoreSelection();
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationValue)}`;
      const html = `<a href="${url}" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 ${locationValue}</a>&nbsp;`;
      document.execCommand('insertHTML', false, html);
      handleInput();
    }
    setIsLocationModalOpen(false);
    setLocationValue('');
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><MapPin size={18} className="text-blue-500" /> 插入地圖連結</h4>
              <button onClick={() => setIsLocationModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-400"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <input autoFocus value={locationValue} onChange={(e) => setLocationValue(e.target.value)} placeholder="例如：東京巨蛋" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" onKeyDown={(e) => e.key === 'Enter' && confirmLocation()} />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 text-xs">取消</button>
                <button onClick={confirmLocation} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs">確認插入</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 active:scale-90"><Bold size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 active:scale-90"><Italic size={16} /></button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1 self-center"></div>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('fontSize', '3')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 text-xs font-black active:scale-90">M</button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('fontSize', '5')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 text-sm font-black active:scale-90">L</button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1 self-center"></div>
        <button type="button" onMouseDown={preventFocusLoss} onClick={openLocationModal} className="p-2 hover:bg-white rounded-xl transition-all text-blue-500 active:scale-90"><MapPin size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 active:scale-90"><Image size={16} /></button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} onBlur={saveSelection} onMouseUp={saveSelection} onKeyUp={saveSelection} className="p-5 min-h-[160px] max-h-[350px] overflow-y-auto focus:outline-none text-sm leading-relaxed text-slate-700" style={{ wordBreak: 'break-word' }} />
    </div>
  );
};

interface ItineraryViewProps {
  transports?: Transport[];
  startDate: string;
  endDate: string;
  scheduleItems: ScheduleItem[];
  setScheduleItems: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ transports = [], startDate, endDate, scheduleItems, setScheduleItems }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'advanced'>('basic');
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isTransportDeleteConfirmOpen, setIsTransportDeleteConfirmOpen] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedDetailId, setDraggedDetailId] = useState<string | null>(null);
  const [selectedSpotForDetail, setSelectedSpotForDetail] = useState<ScheduleItem | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [activeTransportItem, setActiveTransportItem] = useState<ScheduleItem | null>(null);
  const [activeNoteItem, setActiveNoteItem] = useState<ScheduleItem | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const weatherIcons = [Sun, Cloud, CloudRain, Sun, CloudLightning, Sun];
    const temps = ['12°C', '10°C', '8°C', '14°C', '11°C', '13°C'];
    const conditions = ['晴朗', '多雲', '有雨', '晴時多雲', '局部陣雨', '陽光普照'];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [{ date: '3/5', fullDate: '2026-03-05', weekday: 'THU', weather: '12°C', icon: Sun, condition: '晴朗' }];

    let current = new Date(start);
    let count = 0;
    while (current <= end && count < 31) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      result.push({
        date: `${current.getMonth() + 1}/${current.getDate()}`,
        fullDate: dateStr,
        weekday: weekdays[current.getDay()],
        weather: temps[count % temps.length],
        icon: weatherIcons[count % weatherIcons.length],
        condition: conditions[count % conditions.length]
      });
      current.setDate(current.getDate() + 1);
      count++;
    }
    return result;
  }, [startDate, endDate]);

  const currentDay = days[selectedDay] || days[0];

  // 核心：依據日期過濾行程
  const currentDayItems = useMemo(() => {
    return scheduleItems
      .filter(item => item.date === currentDay.fullDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [scheduleItems, currentDay]);

  const [expandedTransports, setExpandedTransports] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    time: '12:00', event: '', addr: '', type: 'visit', price: 0, currency: 'JPY', customDetails: []
  });

  const [transportFormData, setTransportFormData] = useState<Partial<Transport>>({
    type: '地鐵', name: '', from: '', to: '', departureTime: '', arrivalTime: '', note: '', price: 0, currency: 'JPY', transfers: []
  });

  const [noteFormData, setNoteFormData] = useState<string>('');

  const getTransportIcon = (type: string = '') => {
    switch (type) {
      case '地鐵': case '新幹線': return Train;
      case '巴士': return Bus;
      case '計程車': return Car;
      case '飛機': return Plane;
      case '步行': return Footprints;
      default: return Train;
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalTab('basic');
    setFormData({ time: '12:00', event: '', addr: '', type: 'visit', price: 0, currency: 'JPY', customDetails: [] });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalTab('basic');
    setFormData({ ...item, customDetails: item.customDetails || [] });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.event || !formData.time) return;
    const newItem = { ...formData, date: currentDay.fullDate } as ScheduleItem;
    let newList;
    if (editingItem) {
      newList = scheduleItems.map(item => item.id === editingItem.id ? { ...item, ...newItem } : item);
    } else {
      newList = [...scheduleItems, { ...newItem, id: Date.now().toString() }];
    }
    setScheduleItems(newList);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!itemToDeleteId) return;
    const newList = scheduleItems.filter(item => item.id !== itemToDeleteId);
    setScheduleItems(newList);
    setItemToDeleteId(null);
  };

  const handleSaveTransport = () => {
    if (!activeTransportItem) return;
    const newList = scheduleItems.map(item => item.id === activeTransportItem.id ? { ...item, plannedTransport: transportFormData } : item);
    setScheduleItems(newList);
    setIsTransportModalOpen(false);
  };

  const handleSaveNote = () => {
    if (!activeNoteItem) return;
    const newList = scheduleItems.map(item => item.id === activeNoteItem.id ? { ...item, customNote: noteFormData } : item);
    setScheduleItems(newList);
    setIsNoteModalOpen(false);
  };

  // 拖曳處理
  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedItemId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;
    const newList = [...scheduleItems];
    const draggedIdx = newList.findIndex(i => i.id === draggedItemId);
    const targetIdx = newList.findIndex(i => i.id === targetId);
    if (draggedIdx !== -1 && targetIdx !== -1) {
      const [draggedItem] = newList.splice(draggedIdx, 1);
      newList.splice(targetIdx, 0, draggedItem);
      setScheduleItems(newList);
    }
    setDraggedItemId(null);
  };

  const toggleTransportVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTransports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNoteVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 py-2">
        {days.map((day, idx) => (
          <button key={idx} onClick={() => setSelectedDay(idx)} className={`flex flex-col items-center shrink-0 min-w-[64px] py-3 px-2 rounded-2xl transition-all ${selectedDay === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>
            <span className="text-[10px] font-bold mb-0.5">{day.weekday}</span>
            <span className="text-base font-black">{day.date}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            {React.createElement(currentDay.icon, { size: 28 })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-800">{currentDay.weather}</span>
              <span className="text-sm font-bold text-slate-500">{currentDay.condition}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">今日天氣預報</p>
          </div>
        </div>
        <Wind size={16} className="text-slate-300" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">今日行程</h2>
          <div className="flex items-center gap-2">
            {isEditMode && <button onClick={handleOpenAddModal} className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"><Plus size={18} /></button>}
            <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${isEditMode ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>{isEditMode ? <Check size={14} /> : <Edit3 size={14} />}<span>{isEditMode ? '完成' : '編輯'}</span></button>
          </div>
        </div>

        <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {currentDayItems.map((item) => (
            <div key={item.id} className={`relative flex flex-col gap-3 group transition-opacity ${draggedItemId === item.id ? 'opacity-40 grayscale scale-95' : ''}`} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, item.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item.id)}>
              <div className="flex gap-6">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 mt-1.5 transition-colors duration-300 ${activeItemId === item.id ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div onClick={() => isEditMode ? handleEditItem(item) : (item.customDetails?.length ? setSelectedSpotForDetail(item) : null)} className={`flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 transition-all relative ${isEditMode ? 'border-blue-400 ring-2 ring-blue-50 cursor-grab active:cursor-grabbing pr-12' : (item.customDetails?.length ? 'hover:border-blue-400 cursor-pointer' : '')}`}>
                  {isEditMode && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2"><button onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} className="p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform"><Trash2 size={16} /></button></div>}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600"><Clock size={12} /> {item.time}</div>
                  </div>
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-lg">{item.event}</h3>{item.customDetails?.length > 0 && !isEditMode && <div className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded font-black flex items-center gap-1"><BookOpen size={10} /> 詳情</div>}</div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3"><MapPin size={12} /> {item.addr}</p>
                  <div className="flex gap-2">
                    {!isEditMode && (
                      <>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.addr)}`} target="_blank" onClick={(e) => e.stopPropagation()} className="text-[10px] font-bold bg-slate-50 px-3 py-1.5 rounded-full text-slate-600">地圖</a>
                        <button onClick={(e) => { e.stopPropagation(); item.plannedTransport ? toggleTransportVisibility(item.id, e) : (setActiveTransportItem(item), setIsTransportModalOpen(true)); }} className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${item.plannedTransport ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600'}`}>{item.plannedTransport ? (expandedTransports[item.id] ? '收起交通' : '展開交通') : '交通'}</button>
                        <button onClick={(e) => { e.stopPropagation(); item.customNote ? toggleNoteVisibility(item.id, e) : (setActiveNoteItem(item), setIsNoteModalOpen(true)); }} className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${item.customNote ? 'bg-slate-600 text-white shadow-md' : 'bg-slate-50 text-slate-600'}`}>{item.customNote ? (expandedNotes[item.id] ? '收起備註' : '展開備註') : '備註'}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {expandedTransports[item.id] && item.plannedTransport && (
                <div className="ml-10 bg-white border border-blue-100 rounded-3xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">{React.createElement(getTransportIcon(item.plannedTransport.type), { size: 20 })}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{item.plannedTransport.type}</span>
                      <p className="text-xs font-black text-slate-800">{item.plannedTransport.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{item.plannedTransport.departureTime} → {item.plannedTransport.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              )}
              {expandedNotes[item.id] && item.customNote && (
                <div className="ml-10 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed whitespace-pre-wrap">{item.customNote}</p>
                </div>
              )}
            </div>
          ))}
          {currentDayItems.length === 0 && <div className="ml-10 h-32 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl"><p className="text-xs font-bold text-slate-300 uppercase tracking-widest">尚無行程</p></div>}
        </div>
      </div>

      {/* 詳情與彈窗部分維持原邏輯，但儲存時會帶入 currentDay.fullDate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">{editingItem ? '編輯行程' : '新增行程'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                <input placeholder="活動名稱" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                <input placeholder="地點 / 地址" value={formData.addr} onChange={e => setFormData({...formData, addr: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">儲存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSpotForDetail && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 pt-12 pb-4 flex items-center gap-4 border-b border-slate-100">
            <button onClick={() => setSelectedSpotForDetail(null)} className="p-2 bg-slate-50 rounded-full text-slate-600"><ArrowLeft size={20} /></button>
            <div className="flex-1 min-w-0"><h1 className="text-xl font-black text-slate-900 truncate">{selectedSpotForDetail.event}</h1></div>
          </div>
          <div className="p-6 space-y-8 pb-20">
            {selectedSpotForDetail.customDetails?.map((detail) => (
              <section key={detail.id} className="space-y-4">
                <h2 className="text-lg font-black text-slate-800">{detail.title}</h2>
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-sm" dangerouslySetInnerHTML={{ __html: detail.content }} />
              </section>
            ))}
          </div>
        </div>
      )}

      {itemToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setItemToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除嗎？</h3>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg">確認刪除</button>
              <button onClick={() => setItemToDeleteId(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;