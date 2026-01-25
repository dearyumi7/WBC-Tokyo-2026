
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Navigation, Plus, Sun, Cloud, Clock, Wind, Edit3, Check, X, Info, Trash2, Train, Bus, Car, Plane, Footprints, ChevronRight, ArrowRight, ChevronDown, ChevronUp, StickyNote, DollarSign, GripVertical, History, Utensils, ShoppingBag, Map as MapIcon, Loader2, ArrowLeft, BookOpen, Settings, ListPlus, Bold, Italic, Type, Palette, Minus, ExternalLink, Link, SubcornerRight, Image, Search } from 'lucide-react';
import { Transport, TransportTransfer, ScheduleItem, CustomDetail } from '../types';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (html: string) => void;
}

// Fix: Define the missing ItineraryViewProps interface
interface ItineraryViewProps {
  transports: Transport[];
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
              <input autoFocus value={locationValue} onChange={(e) => setLocationValue(e.target.value)} placeholder="例如：東京巨蛋" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 text-xs">取消</button>
                <button onClick={confirmLocation} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100">確認插入</button>
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
      <div ref={editorRef} contentEditable onInput={handleInput} onBlur={saveSelection} className="p-5 min-h-[160px] max-h-[350px] overflow-y-auto focus:outline-none text-sm leading-relaxed text-slate-700" style={{ wordBreak: 'break-word' }} />
    </div>
  );
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ transports = [] }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Firestore Sync
  useEffect(() => {
    const q = query(collection(db, `itinerary_day_${selectedDay}`), orderBy('time'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScheduleItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleItem)));
    });
    return () => unsubscribe();
  }, [selectedDay]);

  const handleSave = async () => {
    if (!formData.event || !formData.time) return;
    const itemId = formData.id || Date.now().toString();
    await setDoc(doc(db, `itinerary_day_${selectedDay}`, itemId), { ...formData, id: itemId });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此行程嗎？')) {
      await deleteDoc(doc(db, `itinerary_day_${selectedDay}`, id));
    }
  };

  const days = [
    { date: '3/5', weekday: 'THU', weather: '12°C', icon: Sun, condition: '晴朗' },
    { date: '3/6', weekday: 'FRI', weather: '10°C', icon: Cloud, condition: '多雲' },
    { date: '3/7', weekday: 'SAT', weather: '11°C', icon: Sun, condition: '晴朗' },
    { date: '3/8', weekday: 'SUN', weather: '9°C', icon: Cloud, condition: '陰天' },
    { date: '3/9', weekday: 'MON', weather: '13°C', icon: Sun, condition: '晴朗' },
    { date: '3/10', weekday: 'TUE', weather: '12°C', icon: Sun, condition: '晴朗' },
    { date: '3/11', weekday: 'WED', weather: '11°C', icon: Cloud, condition: '多雲' },
  ];

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

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">今日行程</h2>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button onClick={() => { setFormData({ time: '12:00', type: 'visit' }); setIsModalOpen(true); }} className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"><Plus size={18} /></button>
            )}
            <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${isEditMode ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
              {isEditMode ? <Check size={14} /> : <Edit3 size={14} />}
              <span>{isEditMode ? '完成' : '編輯'}</span>
            </button>
          </div>
        </div>

        <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {scheduleItems.map((item) => (
            <div key={item.id} className="relative flex flex-col gap-3">
              <div className="flex gap-6">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 mt-1.5 ${activeItemId === item.id ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div onClick={() => isEditMode && (setFormData(item), setIsModalOpen(true))} className={`flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 relative ${isEditMode ? 'border-blue-400 ring-2 ring-blue-50 pr-12' : ''}`}>
                   {isEditMode && (
                      <button onClick={(e) => handleDelete(item.id, e)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-red-50 text-red-500 rounded-full active:scale-90"><Trash2 size={16} /></button>
                   )}
                   <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-2"><Clock size={12} /> {item.time}</div>
                   <h3 className="font-bold text-lg mb-1">{item.event}</h3>
                   <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {item.addr}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-black mb-6">編輯行程內容</h3>
            <div className="space-y-4">
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              <input placeholder="活動名稱" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              <input placeholder="地點" value={formData.addr} onChange={e => setFormData({...formData, addr: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">儲存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
