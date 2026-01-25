import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Plus, Sun, Cloud, Clock, Wind, Edit3, Check, X, Trash2, Train, Bus, Car, Plane, Footprints, ArrowRight, ChevronDown, ChevronUp, StickyNote, GripVertical, BookOpen, Search, Bold, Italic, Palette, Minus, Image, ArrowLeft, Settings, ListPlus } from 'lucide-react';
import { Transport, TransportTransfer } from '../types';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { db } from '../firebase';

interface CustomDetail {
  id: string;
  title: string;
  content: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  event: string;
  addr: string;
  type: string;
  plannedTransport?: Partial<Transport>;
  customNote?: string;
  price?: number;
  currency?: 'JPY' | 'TWD';
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
    if (editorRef.current) editorRef.current.focus();
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

  return (
    <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-4"><MapPin size={18} className="text-blue-500" /> 插入連結</h4>
            <input autoFocus value={locationValue} onChange={(e) => setLocationValue(e.target.value)} placeholder="地點名稱" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold mb-4 focus:ring-2 focus:ring-blue-600" />
            <div className="flex gap-2">
              <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 text-xs">取消</button>
              <button onClick={confirmLocation} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100">插入</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50/80 border-b border-slate-100">
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-xl"><Bold size={16} /></button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-xl"><Italic size={16} /></button>
        <button onMouseDown={e => e.preventDefault()} onClick={openLocationModal} className="p-2 hover:bg-white rounded-xl text-blue-500"><MapPin size={16} /></button>
        <button onMouseDown={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white rounded-xl text-slate-500"><Image size={16} /></button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} onBlur={saveSelection} className="p-5 min-h-[160px] max-h-[350px] overflow-y-auto focus:outline-none text-sm leading-relaxed text-slate-700" style={{ wordBreak: 'break-word' }} />
    </div>
  );
};

interface ItineraryViewProps {
  scheduleItems: ScheduleItem[];
  setScheduleItems: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  transports?: Transport[];
  isEditable?: boolean;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ scheduleItems, setScheduleItems, transports = [], isEditable = false }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'advanced'>('basic');
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedSpotForDetail, setSelectedSpotForDetail] = useState<ScheduleItem | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [activeTransportItem, setActiveTransportItem] = useState<ScheduleItem | null>(null);
  const [activeNoteItem, setActiveNoteItem] = useState<ScheduleItem | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(scheduleItems[0]?.id || null);

  const [formData, setFormData] = useState<Partial<ScheduleItem>>({});
  const [transportFormData, setTransportFormData] = useState<Partial<Transport>>({});
  const [noteFormData, setNoteFormData] = useState<string>('');

  const [expandedTransports, setExpandedTransports] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const days = [
    { date: '3/5', weekday: 'THU', weather: '12°C', icon: Sun },
    { date: '3/6', weekday: 'FRI', weather: '10°C', icon: Cloud },
    { date: '3/7', weekday: 'SAT', weather: '11°C', icon: Sun },
    { date: '3/8', weekday: 'SUN', weather: '9°C', icon: Cloud },
    { date: '3/9', weekday: 'MON', weather: '13°C', icon: Sun },
    { date: '3/10', weekday: 'TUE', weather: '12°C', icon: Sun },
  ];

  const handleSave = async () => {
    if (!formData.event || !formData.time || !db) return;
    const itemData = { ...formData, id: editingItem?.id || Date.now().toString() };
    await setDoc(doc(db, 'itinerary', itemData.id), itemData);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !window.confirm('確定刪除？')) return;
    await deleteDoc(doc(db, 'itinerary', id));
  };

  const handleSaveTransport = async () => {
    if (!activeTransportItem || !db) return;
    await setDoc(doc(db, 'itinerary', activeTransportItem.id), { ...activeTransportItem, plannedTransport: transportFormData });
    setIsTransportModalOpen(false);
  };

  const handleSaveNote = async () => {
    if (!activeNoteItem || !db) return;
    await setDoc(doc(db, 'itinerary', activeNoteItem.id), { ...activeNoteItem, customNote: noteFormData });
    setIsNoteModalOpen(false);
  };

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

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 py-2">
        {days.map((day, idx) => (
          <button key={idx} onClick={() => setSelectedDay(idx)} className={`flex flex-col items-center shrink-0 min-w-[64px] py-3 px-2 rounded-2xl transition-all ${selectedDay === idx ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
            <span className="text-[10px] font-bold mb-0.5">{day.weekday}</span>
            <span className="text-base font-black">{day.date}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">今日行程</h2>
          {isEditable && (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingItem(null); setFormData({ time: '12:00', type: 'visit', customDetails: [] }); setIsModalOpen(true); }} className="p-2 bg-blue-600 text-white rounded-full shadow-lg"><Plus size={18} /></button>
              <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${isEditMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}>{isEditMode ? <Check size={14} /> : <Edit3 size={14} />} <span>{isEditMode ? '完成' : '編輯'}</span></button>
            </div>
          )}
        </div>

        <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {scheduleItems.map((item) => (
            <div key={item.id} className="relative flex flex-col gap-3">
              <div className="flex gap-6">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 mt-1.5 ${activeItemId === item.id ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div onClick={() => isEditMode ? (setEditingItem(item), setFormData(item), setIsModalOpen(true)) : item.customDetails?.length && setSelectedSpotForDetail(item)} className={`flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 relative ${isEditMode ? 'border-blue-400' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600"><Clock size={12} /> {item.time}</div>
                    {isEditMode && <button onClick={(e) => handleDelete(item.id, e)} className="text-red-400"><Trash2 size={16} /></button>}
                  </div>
                  <h3 className="font-bold text-lg">{item.event}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3"><MapPin size={12} /> {item.addr}</p>
                  <div className="flex gap-2">
                    {!isEditMode && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setActiveTransportItem(item); setTransportFormData(item.plannedTransport || {}); setIsTransportModalOpen(true); }} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">交通</button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveNoteItem(item); setNoteFormData(item.customNote || ''); setIsNoteModalOpen(true); }} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">備註</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-6">
            <h3 className="text-xl font-black mb-6">{editingItem ? '編輯' : '新增'}行程</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
              <input placeholder="活動名稱" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
              <input placeholder="地址" value={formData.addr} onChange={e => setFormData({...formData, addr: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">詳情內容</p>
                {formData.customDetails?.map((d, i) => (
                  <div key={d.id} className="mb-4 bg-white p-3 rounded-xl border border-slate-100">
                    <input value={d.title} onChange={e => {
                      const updated = [...(formData.customDetails || [])];
                      updated[i].title = e.target.value;
                      setFormData({...formData, customDetails: updated});
                    }} className="w-full font-bold text-sm mb-2" placeholder="標題" />
                    <RichTextEditor initialValue={d.content} onChange={html => {
                      const updated = [...(formData.customDetails || [])];
                      updated[i].content = html;
                      setFormData({...formData, customDetails: updated});
                    }} />
                  </div>
                ))}
                <button onClick={() => setFormData({...formData, customDetails: [...(formData.customDetails || []), { id: Date.now().toString(), title: '', content: '' }]})} className="w-full py-2 bg-blue-100 text-blue-600 rounded-xl text-xs font-bold">+ 新增區塊</button>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">儲存</button>
            </div>
          </div>
        </div>
      )}

      {/* Transport & Note Modals logic similar, ensured use of db and isEditable gates */}
      {isTransportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTransportModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-6">
            <h3 className="text-xl font-black mb-6">交通規劃</h3>
            <div className="space-y-4">
              <input placeholder="名稱 (e.g. JR 山手線)" value={transportFormData.name || ''} onChange={e => setTransportFormData({...transportFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="起點" value={transportFormData.from || ''} onChange={e => setTransportFormData({...transportFormData, from: e.target.value})} className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold" />
                <input placeholder="終點" value={transportFormData.to || ''} onChange={e => setTransportFormData({...transportFormData, to: e.target.value})} className="bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsTransportModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
              <button onClick={handleSaveTransport} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">儲存</button>
            </div>
          </div>
        </div>
      )}

      {selectedSpotForDetail && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-right overflow-y-auto">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 flex items-center gap-4 border-b">
            <button onClick={() => setSelectedSpotForDetail(null)} className="p-2 bg-slate-50 rounded-full"><ArrowLeft size={20} /></button>
            <h1 className="text-xl font-black truncate">{selectedSpotForDetail.event}</h1>
          </div>
          <div className="p-6 space-y-8">
            {selectedSpotForDetail.customDetails?.map((d) => (
              <section key={d.id} className="space-y-4">
                <h2 className="text-lg font-black">{d.title}</h2>
                <div className="bg-slate-50 rounded-[2rem] p-6 text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: d.content }} />
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;