import React, { useState, useEffect, useRef, useMemo } from 'https://esm.sh/react@19.2.3';
import { MapPin, Navigation, Plus, Sun, Cloud, Clock, Wind, Edit3, Check, X, Info, Trash2, Train, Bus, Car, Plane, Footprints, ChevronRight, ArrowRight, ChevronDown, ChevronUp, StickyNote, DollarSign, GripVertical, History, Utensils, ShoppingBag, Map as MapIcon, Loader2, ArrowLeft, BookOpen, Settings, ListPlus, Bold, Italic, Type, Palette, Minus, ExternalLink, Link, Image, Search, AlertTriangle } from 'https://esm.sh/lucide-react@0.563.0';
import { Transport, TransportTransfer } from '../types.ts';

import { db } from '../firebase.ts';
import { doc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

interface CustomDetail {
  id: string; // 新增唯一 ID 確保排序時組件能正確對應
  title: string;
  content: string; // 儲存 HTML 字串
}

interface ScheduleItem {
  id: string;
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

  // 初始化與同步內容
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
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Location Search Modal (Scoped to Editor) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" /> 插入地圖連結
              </h4>
              <button onClick={() => setIsLocationModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-400">
                <X size={16} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">輸入地點名稱或地址</p>
            <div className="space-y-4">
              <input 
                autoFocus
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="例如：東京巨蛋"
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600"
                onKeyDown={(e) => e.key === 'Enter' && confirmLocation()}
              />
              <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-[10px] font-black text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Search size={14} /> 前往 Google Maps 搜尋地址
              </a>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 text-xs">取消</button>
                <button onClick={confirmLocation} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100">確認插入</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 active:scale-90" title="粗體"><Bold size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 active:scale-90" title="斜體"><Italic size={16} /></button>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-1 self-center"></div>
        
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('fontSize', '2')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 text-[10px] font-black active:scale-90" title="小字">S</button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('fontSize', '3')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 text-xs font-black active:scale-90" title="中字">M</button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('fontSize', '5')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600 text-sm font-black active:scale-90" title="大字">L</button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1 self-center"></div>

        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('foreColor', '#2563eb')} className="p-2 hover:bg-white rounded-xl transition-all text-blue-600 active:scale-90" title="藍色"><Palette size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('foreColor', '#ef4444')} className="p-2 hover:bg-white rounded-xl transition-all text-red-500 active:scale-90" title="紅色"><Palette size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('foreColor', '#000000')} className="p-2 hover:bg-white rounded-xl transition-all text-black active:scale-90" title="黑色"><Palette size={16} /></button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1 self-center"></div>

        <button type="button" onMouseDown={preventFocusLoss} onClick={openLocationModal} className="p-2 hover:bg-white rounded-xl transition-all text-blue-500 active:scale-90" title="插入景點地圖連結"><MapPin size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 active:scale-90" title="插入圖片"><Image size={16} /></button>
        <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCommand('insertHorizontalRule')} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 active:scale-90" title="插入分隔線"><Minus size={16} /></button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={saveSelection}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        className="p-5 min-h-[160px] max-h-[350px] overflow-y-auto focus:outline-none text-sm leading-relaxed text-slate-700"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
};

interface ItineraryViewProps {
  transports?: Transport[];
  startDate: string;
  endDate: string;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ transports = [], startDate, endDate }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'advanced'>('basic');
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  // 新增：處理刪除確認狀態
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isTransportDeleteConfirmOpen, setIsTransportDeleteConfirmOpen] = useState(false);

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedDetailId, setDraggedDetailId] = useState<string | null>(null);

  const [selectedSpotForDetail, setSelectedSpotForDetail] = useState<ScheduleItem | null>(null);

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [activeTransportItem, setActiveTransportItem] = useState<ScheduleItem | null>(null);
  const [activeNoteItem, setActiveNoteItem] = useState<ScheduleItem | null>(null);


// --- 貼在第 229 行 ---
  React.useEffect(() => {
    // 確保資料庫有連上
    if (!db) return;
    const tripRef = doc(db, 'trips', 'main_trip_data');
    // 開始監聽雲端，只要雲端有變動，畫面就自動更新
    const unsubscribe = onSnapshot(tripRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.scheduleItems) {
          setScheduleItems(data.scheduleItems);
          console.log("📡 雲端最新行程已送達！");
        }
      }
    });
    return () => unsubscribe();
  }, []);


  // 計算行程日期標籤
  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // Safety check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [{ date: '3/5', weekday: 'THU', weather: '12°C', icon: Sun, condition: '晴朗' }];

    let current = new Date(start);
    // Limit to prevent accidental infinite loop if dates are weird
    let count = 0;
    while (current <= end && count < 31) {
      result.push({
        date: `${current.getMonth() + 1}/${current.getDate()}`,
        weekday: weekdays[current.getDay()],
        weather: '12°C', // Placeholder
        icon: Sun,      // Placeholder
        condition: '晴朗' // Placeholder
      });
      current.setDate(current.getDate() + 1);
      count++;
    }
    return result;
  }, [startDate, endDate]);

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { 
      id: '1', 
      time: '05:35', 
      event: '抵達桃園機場第二航廈', 
      addr: 'Taoyuan International Airport T2', 
      type: 'transport',
      plannedTransport: {
        type: '計程車',
        name: '機場接送',
        from: '住家',
        to: '桃園機場',
        departureTime: '05:00',
        arrivalTime: '05:35',
        note: ''
      }
    }
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>(scheduleItems[0]?.id || null);
  const visibilityMap = useRef<Map<string, number>>(new Map());
  
  const [expandedTransports, setExpandedTransports] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('itinerary_expanded_states');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('itinerary_expanded_notes_states');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // 設定滾動監測
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            visibilityMap.current.set(id, entry.intersectionRatio);
          }
        });

        let maxRatio = -1;
        let bestId = null;
        let bestTop = Infinity;

        const allRows = document.querySelectorAll('.itinerary-item-row');
        allRows.forEach((el) => {
          const id = el.getAttribute('data-id');
          if (!id) return;
          
          const ratio = visibilityMap.current.get(id) || 0;
          const rect = el.getBoundingClientRect();

          if (ratio > maxRatio) {
            maxRatio = ratio;
            bestId = id;
            bestTop = rect.top;
          } else if (ratio === maxRatio && ratio > 0) {
            if (rect.top < bestTop) {
              bestId = id;
              bestTop = rect.top;
            }
          }
        });

        if (bestId) {
          setActiveItemId(bestId);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px'
      }
    );

    const elements = document.querySelectorAll('.itinerary-item-row');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [scheduleItems, isEditMode, expandedTransports, expandedNotes]);

  const getTransportIcon = (type: string = '') => {
    switch (type) {
      case '地鐵':
      case '新幹線':
        return Train;
      case '巴士':
        return Bus;
      case '計程車':
        return Car;
      case '飛機':
        return Plane;
      case '步行':
        return Footprints;
      default:
        return Train;
    }
  };

  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    time: '12:00',
    event: '',
    addr: '',
    type: 'visit',
    price: 0,
    currency: 'JPY',
    customDetails: []
  });

  const [transportFormData, setTransportFormData] = useState<Partial<Transport>>({
    type: '地鐵',
    name: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    note: '',
    price: 0,
    currency: 'JPY',
    transfers: []
  });

  const [noteFormData, setNoteFormData] = useState<string>('');

  const currentDayWeather = days[selectedDay] || days[0];

  const isTransportExpanded = (id: string, item: ScheduleItem) => {
    if (expandedTransports[id] !== undefined) return expandedTransports[id];
    return !!item.plannedTransport;
  };

  const isNoteExpanded = (id: string, item: ScheduleItem) => {
    if (expandedNotes[id] !== undefined) return expandedNotes[id];
    return !!item.customNote;
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalTab('basic');
    setFormData({ 
      time: '12:00', event: '', addr: '', type: 'visit', price: 0, currency: 'JPY',
      customDetails: []
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalTab('basic');
    setFormData({ 
      ...item, 
      price: item.price || 0, 
      currency: item.currency || 'JPY',
      customDetails: item.customDetails?.map(d => d.id ? d : { ...d, id: `detail-${Math.random().toString(36).substr(2, 9)}` }) || []
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.event || !formData.time) return;
    let newList = editingItem 
      ? scheduleItems.map(item => item.id === editingItem.id ? { ...item, ...formData } : item)
      : [...scheduleItems, { ...formData, id: Date.now().toString() }];

    setScheduleItems(newList);
    setIsModalOpen(false);

    // 強迫寫入 Firebase
    const tripRef = doc(db, 'trips', 'main_trip_data');
    updateDoc(tripRef, { scheduleItems: newList })
      .then(() => console.log("✅ 真正存入資料庫了"))
      .catch(e => alert("存入失敗：" + e.message));
  };

  // 修正：刪除按鈕改為開啟確認彈窗
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDeleteId(id);
  };

  // 新增：真正執行刪除並同步雲端
  const confirmDelete = () => {
    if (!itemToDeleteId) return;
    const newList = scheduleItems.filter(item => item.id !== itemToDeleteId);
    setScheduleItems(newList);
    setItemToDeleteId(null);

    // 同步雲端以防止 onSnapshot 覆寫回本地
    const tripRef = doc(db, 'trips', 'main_trip_data');
    updateDoc(tripRef, { scheduleItems: newList })
      .then(() => console.log("✅ 行程已從雲端移除"))
      .catch(e => console.error("雲端刪除失敗：", e));
  };

  const openTransportModal = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTransportItem(item);
    setTransportFormData(item.plannedTransport || {
      type: '地鐵',
      name: '',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      note: '',
      price: 0,
      currency: 'JPY',
      transfers: []
    });
    setIsTransportModalOpen(true);
  };

  const openNoteModal = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveNoteItem(item);
    setNoteFormData(item.customNote || '');
    setIsNoteModalOpen(true);
  };

  const handleOpenSpotDetail = (item: ScheduleItem) => {
    if (isEditMode) return;
    const hasDetails = item.customDetails && item.customDetails.length > 0;
    if (!hasDetails) return;
    setSelectedSpotForDetail(item);
  };

  const toggleTransportVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = scheduleItems.find(i => i.id === id);
    if (!item) return;

    const currentlyExpanded = isTransportExpanded(id, item);
    const nextState = !currentlyExpanded;

    setExpandedTransports(prev => {
      const newState = { ...prev, [id]: nextState };
      // Fix: Change 'newList' to 'newState' to resolve the reference error and properly persist the expanded states.
      localStorage.setItem('itinerary_expanded_states', JSON.stringify(newState));
      return newState;
    });
  };

  const toggleNoteVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = scheduleItems.find(i => i.id === id);
    if (!item) return;

    const currentlyExpanded = isNoteExpanded(id, item);
    const nextState = !currentlyExpanded;

    setExpandedNotes(prev => {
      const newState = { ...prev, [id]: nextState };
      localStorage.setItem('itinerary_expanded_notes_states', JSON.stringify(newState));
      return newState;
    });
  };

  const handleCiteTransport = (t: Transport) => {
    setTransportFormData({
      type: t.type,
      name: t.name,
      from: t.from,
      to: t.to,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      note: t.note,
      price: t.price,
      currency: t.currency || 'JPY',
      transfers: t.transfers || []
    });
  };

  const handleSaveTransport = () => {
    if (!activeTransportItem) return;
    const newList = scheduleItems.map(item => 
      item.id === activeTransportItem.id 
      ? { ...item, plannedTransport: transportFormData } 
      : item
    );
    setScheduleItems(newList);
    setIsTransportModalOpen(false);
    
    // 同步雲端
    const tripRef = doc(db, 'trips', 'main_trip_data');
    updateDoc(tripRef, { scheduleItems: newList });
  };

  const handleSaveNote = () => {
    if (!activeNoteItem) return;
    const newList = scheduleItems.map(item => 
      item.id === activeNoteItem.id 
      ? { ...item, customNote: noteFormData } 
      : item
    );
    setScheduleItems(newList);
    setIsNoteModalOpen(false);

    // 同步雲端
    const tripRef = doc(db, 'trips', 'main_trip_data');
    updateDoc(tripRef, { scheduleItems: newList });
  };

  const handleAddDetailSection = () => {
    setFormData(prev => ({
      ...prev,
      customDetails: [...(prev.customDetails || []), { id: `detail-${Math.random().toString(36).substr(2, 9)}`, title: '', content: '' }]
    }));
  };

  const handleUpdateDetailSection = (index: number, field: keyof CustomDetail, value: string) => {
    const updated = [...(formData.customDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, customDetails: updated }));
  };

  const handleRemoveDetailSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customDetails: (prev.customDetails || []).filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!isEditMode || !draggedItemId || draggedItemId === targetId) return;

    setScheduleItems(prev => {
      const newList = [...prev];
      const draggedIndex = newList.findIndex(item => item.id === draggedItemId);
      const targetIndex = newList.findIndex(item => item.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, draggedItem);
        
        // 拖曳結束同步雲端
        const tripRef = doc(db, 'trips', 'main_trip_data');
        updateDoc(tripRef, { scheduleItems: newList });
        
        return newList;
      }
      return prev;
    });
    setDraggedItemId(null);
  };

  const handleDetailDragStart = (e: React.DragEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('[contenteditable="true"]')) {
      return;
    }
    setDraggedDetailId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDetailDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedDetailId || draggedDetailId === targetId) return;

    const updated = [...(formData.customDetails || [])];
    const draggedIndex = updated.findIndex(d => d.id === draggedDetailId);
    const targetIndex = updated.findIndex(d => d.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      setFormData(prev => ({ ...prev, customDetails: updated }));
    }
    
    setDraggedDetailId(null);
  };

  const handleAddTransfer = () => {
    const newTransfer: TransportTransfer = {
      type: '地鐵',
      name: '',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: ''
    };
    setTransportFormData(prev => ({
      ...prev,
      transfers: [...(prev.transfers || []), newTransfer]
    }));
  };

  const handleUpdateTransfer = (index: number, field: keyof TransportTransfer, value: string) => {
    const updatedTransfers = [...(transportFormData.transfers || [])];
    updatedTransfers[index] = { ...updatedTransfers[index], [field]: value };
    setTransportFormData(prev => ({ ...prev, transfers: updatedTransfers }));
  };

  const handleRemoveTransfer = (index: number) => {
    setTransportFormData(prev => ({
      ...prev,
      transfers: (prev.transfers || []).filter((_, i) => i !== index)
    }));
  };

  const availableTransports = transports.filter(t => {
    return !scheduleItems.some(item => {
      if (item.id === activeTransportItem?.id) return false;
      const pt = item.plannedTransport;
      if (!pt) return false;
      return pt.type === t.type && pt.name === t.name && pt.from === t.from && pt.to === t.to && pt.departureTime === t.departureTime && pt.arrivalTime === t.arrivalTime;
    });
  });

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 py-2">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`flex flex-col items-center shrink-0 min-w-[64px] py-3 px-2 rounded-2xl transition-all ${
              selectedDay === idx 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
              : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold mb-0.5">{day.weekday}</span>
            <span className="text-base font-black">{day.date}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <currentDayWeather.icon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-800">{currentDayWeather.weather}</span>
              <span className="text-sm font-bold text-slate-500">{currentDayWeather.condition}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">旅遊地區天氣預報</p>
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
            <Wind size={12} /> 3m/s
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">今日行程</h2>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button 
                onClick={handleOpenAddModal}
                className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"
              >
                <Plus size={18} />
              </button>
            )}
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                isEditMode 
                ? 'bg-slate-900 border-slate-900 text-white' 
                : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {isEditMode ? <Check size={14} /> : <Edit3 size={14} />}
              <span>{isEditMode ? '完成' : '編輯'}</span>
            </button>
          </div>
        </div>

        <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {scheduleItems.map((item, idx) => {
            const transportActive = !!item.plannedTransport;
            const transportExpanded = isTransportExpanded(item.id, item);
            const noteActive = !!item.customNote;
            const noteExpanded = isNoteExpanded(item.id, item);
            const hasDetails = item.customDetails && item.customDetails.length > 0;

            return (
              <div 
                key={item.id} 
                data-id={item.id}
                className={`itinerary-item-row relative flex flex-col gap-3 group transition-opacity ${draggedItemId === item.id ? 'opacity-40 grayscale scale-95' : ''}`}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
              >
                <div className="flex gap-6">
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 mt-1.5 transition-colors duration-300 ${
                    activeItemId === item.id ? 'bg-blue-600' : 'bg-slate-300'
                  }`}></div>
                  <div 
                    onClick={() => isEditMode ? handleEditItem(item) : handleOpenSpotDetail(item)}
                    className={`flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 transition-all relative ${isEditMode ? 'border-blue-400 ring-2 ring-blue-50 cursor-grab active:cursor-grabbing pr-12' : (hasDetails ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : '')}`}
                  >
                    {isEditMode && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 text-slate-300">
                        <GripVertical size={16} />
                      </div>
                    )}
                    {isEditMode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button onClick={(e) => handleDelete(item.id, e)} className="p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                        <Clock size={12} /> {item.time}
                      </div>
                      {!isEditMode && <Navigation size={16} className="text-slate-300" />}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{item.event}</h3>
                      {!isEditMode && hasDetails && (
                        <div className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded font-black flex items-center gap-1">
                          <BookOpen size={10} /> 詳情
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <MapPin size={12} /> {item.addr}
                    </p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      {!isEditMode && (
                        <div className="flex gap-2">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.addr)}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            地圖
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              transportActive ? toggleTransportVisibility(item.id, e) : openTransportModal(item, e);
                            }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 flex items-center gap-1.5 ${transportActive ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}
                          >
                            {transportActive ? (
                              <>
                                {transportExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                交通
                              </>
                            ) : '交通'}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              noteActive ? toggleNoteVisibility(item.id, e) : openNoteModal(item, e);
                            }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 flex items-center gap-1.5 ${noteActive ? 'bg-slate-600 text-white shadow-md shadow-slate-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
                          >
                            {noteActive ? (
                              <>
                                {noteExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                備註
                              </>
                            ) : '備註'}
                          </button>
                        </div>
                      )}
                      
                      {item.price ? (
                        <div className="shrink-0 ml-auto">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.currency === 'TWD' ? '$' : '¥'} {item.price.toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                
                {!isEditMode && transportActive && transportExpanded && (
                  <div 
                    onClick={(e) => openTransportModal(item, e)}
                    className="ml-10 bg-white border border-blue-100 rounded-3xl p-4 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md active:scale-[0.99] transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                      {React.createElement(getTransportIcon(item.plannedTransport?.type), { size: 64 })}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        {React.createElement(getTransportIcon(item.plannedTransport?.type), { size: 20 })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">{item.plannedTransport?.type}</span>
                          <span className="text-xs font-black text-slate-800 truncate">{item.plannedTransport?.name || ''}</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <span className="truncate max-w-[120px]">{item.plannedTransport?.from || '起點'}</span>
                            <ArrowRight size={10} className="text-slate-300 shrink-0" />
                            <span className="truncate max-w-[120px]">{item.plannedTransport?.to || '終點'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-500">
                              <Clock size={10} className="shrink-0" />
                              <span>
                                {item.plannedTransport?.departureTime && item.plannedTransport?.arrivalTime 
                                  ? `${item.plannedTransport.departureTime} → ${item.plannedTransport.arrivalTime}` 
                                  : item.plannedTransport?.departureTime || item.plannedTransport?.arrivalTime || '尚未設定時間'}
                              </span>
                            </div>
                            {item.plannedTransport?.price ? (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.plannedTransport.currency === 'TWD' ? '$' : '¥'} {item.plannedTransport.price.toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.plannedTransport?.transfers && item.plannedTransport.transfers.length > 0 && (
                      <div className="space-y-4 pt-2 border-t border-blue-50">
                        {item.plannedTransport.transfers.map((transfer, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                              {React.createElement(getTransportIcon(transfer.type), { size: 20 })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">{transfer.type}</span>
                                <span className="text-xs font-black text-slate-800 truncate">{transfer.name}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                  <span className="truncate">{transfer.from}</span>
                                  <ArrowRight size={10} className="text-slate-300 shrink-0" />
                                  <span className="truncate">{transfer.to}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-500">
                                  <Clock size={10} className="shrink-0" />
                                  <span>{transfer.departureTime} → {transfer.arrivalTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.plannedTransport?.note && (
                      <div className="mt-0.5 text-[10px] text-slate-500 leading-relaxed border-t border-slate-50 pt-0.5">
                        {item.plannedTransport.note}
                      </div>
                    )}
                  </div>
                )}

                {!isEditMode && noteActive && noteExpanded && (
                  <div 
                    onClick={(e) => openNoteModal(item, e)}
                    className="ml-10 bg-white border border-slate-200 rounded-3xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden cursor-pointer hover:border-slate-400 hover:shadow-md active:scale-[0.99] transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                      <StickyNote size={64} className="text-slate-300" />
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                      <StickyNote size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-700 font-bold leading-relaxed whitespace-pre-wrap">
                        {item.customNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {scheduleItems.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-bold">
              尚無行程，點擊編輯新增項目。
            </div>
          )}
        </div>
      </div>

      {/* 刪除確認自定義彈窗 (行程項目) */}
      {itemToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setItemToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除嗎？</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              「{scheduleItems.find(i => i.id === itemToDeleteId)?.event}」行程刪除後將無法復原。
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all">確認刪除</button>
              <button onClick={() => setItemToDeleteId(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認自定義彈窗 (交通規劃) */}
      {isTransportDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTransportDeleteConfirmOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">移除交通規劃？</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              確定要移除此行程的交通安排嗎？
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (activeTransportItem) {
                    const newList = scheduleItems.map(item => item.id === activeTransportItem.id ? { ...item, plannedTransport: null } : item);
                    setScheduleItems(newList);
                    setTransportFormData({ price: 0, currency: 'JPY', transfers: [] });
                    setIsTransportDeleteConfirmOpen(false);
                    setIsTransportModalOpen(false);
                    // 同步雲端
                    const tripRef = doc(db, 'trips', 'main_trip_data');
                    updateDoc(tripRef, { scheduleItems: newList });
                  }
                }} 
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                確認移除
              </button>
              <button onClick={() => setIsTransportDeleteConfirmOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all">取消</button>
            </div>
          </div>
        </div>
      )}

      {selectedSpotForDetail && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto hide-scrollbar">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 pt-12 pb-4 flex items-center gap-4 border-b border-slate-100">
            <button 
              onClick={() => setSelectedSpotForDetail(null)}
              className="p-2 bg-slate-50 rounded-full text-slate-600 active:scale-90 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-slate-900 truncate">{selectedSpotForDetail.event}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin size={10} /> {selectedSpotForDetail.addr}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8 pb-20">
            {selectedSpotForDetail.customDetails?.map((detail) => (
              <section key={detail.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">{detail.title || '無標題'}</h2>
                </div>
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-700 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: detail.content || '<span style="color: #94a3b8;">尚無內容</span>' }} />
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl"><Edit3 size={20} /></div>
                  {editingItem ? '編輯行程' : '新增行程'}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setModalTab(modalTab === 'basic' ? 'advanced' : 'basic')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                      modalTab === 'advanced' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {modalTab === 'basic' ? <BookOpen size={14} /> : <Settings size={14} />}
                    <span>{modalTab === 'basic' ? '進階內容' : '基本資訊'}</span>
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 hide-scrollbar">
                {modalTab === 'basic' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">時間</label>
                      <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">活動名稱</label>
                      <input placeholder="例如：築地場外市場" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">地點 / 地址</label>
                      <input placeholder="輸入地址或標籤" value={formData.addr} onChange={e => setFormData({...formData, addr: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">票價</label>
                      <div className="flex gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                          <button 
                            onClick={() => setFormData({...formData, currency: 'JPY'})}
                            className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                          >
                            JPY
                          </button>
                          <button 
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
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-blue-600" 
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 pb-6">
                    <div className="space-y-8">
                      {formData.customDetails?.map((detail, idx) => (
                        <div 
                          key={detail.id} 
                          draggable
                          onDragStart={(e) => handleDetailDragStart(e, detail.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDetailDrop(e, detail.id)}
                          className={`bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100 relative group animate-in zoom-in-95 duration-200 cursor-grab active:cursor-grabbing ${draggedDetailId === detail.id ? 'opacity-40 grayscale scale-95 border-dashed border-blue-300' : ''}`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="text-slate-300 shrink-0">
                                <GripVertical size={16} />
                              </div>
                              <input 
                                placeholder="輸入標題 (例如：必買小物)..." 
                                value={detail.title} 
                                onChange={e => handleUpdateDetailSection(idx, 'title', e.target.value)}
                                className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600"
                                onDragStart={(e) => e.stopPropagation()}
                              />
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleRemoveDetailSection(idx); }}
                                className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm hover:text-red-500 transition-colors border border-slate-100 active:scale-90 shrink-0"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="space-y-1" onDragStart={(e) => e.stopPropagation()}>
                              <RichTextEditor 
                                initialValue={detail.content} 
                                onChange={(html) => handleUpdateDetailSection(idx, 'content', html)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-center !mt-4">
                        <button 
                          onClick={handleAddDetailSection}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg active:scale-90 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {(!formData.customDetails || formData.customDetails.length === 0) && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <ListPlus size={32} className="text-slate-200 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-400">目前尚無進階區塊</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button onClick={handleSave} disabled={!formData.event} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Check size={18} /> {editingItem ? '儲存修改' : '加入行程'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTransportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTransportModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Train size={20} /></div>
                  交通規劃
                </h3>
                <button onClick={() => setIsTransportModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 hide-scrollbar pb-10">
                {availableTransports.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">引用預訂資料</label>
                    <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar -mx-1 px-1">
                      {availableTransports.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCiteTransport(t)}
                          className="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-100 rounded-2xl min-w-[140px] text-left active:scale-95 transition-all hover:bg-blue-50/50 hover:border-blue-200"
                        >
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{t.type}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">{t.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold truncate">{t.from} → {t.to}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      {React.createElement(getTransportIcon(transportFormData.type), { size: 20 })}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">類型</label>
                        <select value={transportFormData.type} onChange={e => setTransportFormData({...transportFormData, type: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 appearance-none">
                          <option>地鐵</option>
                          <option>新幹線</option>
                          <option>巴士</option>
                          <option>計程車</option>
                          <option>飛機</option>
                          <option>步行</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">名稱</label>
                        <input placeholder="例如：JR 山手線" value={transportFormData.name} onChange={e => setTransportFormData({...transportFormData, name: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發地</label>
                      <input placeholder="起點" value={transportFormData.from} onChange={e => setTransportFormData({...transportFormData, from: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">目的地</label>
                      <input placeholder="終點" value={transportFormData.to} onChange={e => setTransportFormData({...transportFormData, to: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發時間</label>
                      <input type="time" value={transportFormData.departureTime} onChange={e => setTransportFormData({...transportFormData, departureTime: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">抵達時間</label>
                      <input type="time" value={transportFormData.arrivalTime} onChange={e => setTransportFormData({...transportFormData, arrivalTime: e.target.value})} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                  </div>
                </div>

                {transportFormData.transfers && transportFormData.transfers.length > 0 && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 block">轉乘資訊</label>
                    {transportFormData.transfers.map((transfer, tIdx) => (
                      <div key={tIdx} className="bg-blue-50/30 p-4 rounded-3xl border border-blue-100 space-y-4 relative">
                        <button 
                          onClick={() => handleRemoveTransfer(tIdx)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-400 rounded-full shadow-sm active:scale-90"
                        >
                          <X size={12} />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-white rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            {React.createElement(getTransportIcon(transfer.type), { size: 20 })}
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">類型</label>
                              <select value={transfer.type} onChange={e => handleUpdateTransfer(tIdx, 'type', e.target.value)} className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 appearance-none">
                                <option>地鐵</option>
                                <option>巴士</option>
                                <option>計程車</option>
                                <option>步行</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">名稱</label>
                              <input placeholder="路線名" value={transfer.name} onChange={e => handleUpdateTransfer(tIdx, 'name', e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發地</label>
                            <input placeholder="起點" value={transfer.from} onChange={e => handleUpdateTransfer(tIdx, 'from', e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">目的地</label>
                            <input placeholder="終點" value={transfer.to} onChange={e => handleUpdateTransfer(tIdx, 'to', e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">出發時間</label>
                            <input type="time" value={transfer.departureTime} onChange={e => handleUpdateTransfer(tIdx, 'departureTime', e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">抵達時間</label>
                            <input type="time" value={transfer.arrivalTime} onChange={e => handleUpdateTransfer(tIdx, 'arrivalTime', e.target.value)} className="w-full bg-white border-none rounded-xl px-3 py-2.5 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={handleAddTransfer}
                  className="w-full py-3 bg-white border-2 border-dashed border-blue-100 text-blue-500 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all"
                >
                  <Plus size={14} /> 添加轉乘資訊
                </button>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">票價</label>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                      <button 
                        onClick={() => setTransportFormData({...transportFormData, currency: 'JPY'})}
                        className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${transportFormData.currency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >
                        JPY
                      </button>
                      <button 
                        onClick={() => setTransportFormData({...transportFormData, currency: 'TWD'})}
                        className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${transportFormData.currency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >
                        TWD
                      </button>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={transportFormData.price || ''} 
                      onChange={e => setTransportFormData({...transportFormData, price: Number(e.target.value)})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-blue-600" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註</label>
                  <textarea placeholder="轉乘資訊、月台或出口建議..." value={transportFormData.note} onChange={e => setTransportFormData({...transportFormData, note: e.target.value})} className="w-full h-20 bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 resize-none" />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {activeTransportItem?.plannedTransport && (
                  <button 
                    onClick={() => setIsTransportDeleteConfirmOpen(true)} 
                    className="px-4 py-4 bg-red-50 text-red-500 rounded-2xl font-bold active:scale-95 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => setIsTransportModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button onClick={handleSaveTransport} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> 儲存交通
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-600"><StickyNote size={20} /></div>
                  行程備註
                </h3>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4 pr-1 hide-scrollbar">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註內容</label>
                  <textarea 
                    placeholder="填寫此行程的注意事項、必買商品 or 提醒..." 
                    value={noteFormData} 
                    onChange={e => setNoteFormData(e.target.value)} 
                    className="w-full h-40 bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-slate-500 resize-none" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {activeNoteItem?.customNote && (
                  <button 
                    onClick={() => {
                      if (window.confirm('確定要移除此備註嗎？')) {
                        setNoteFormData('');
                        const newList = scheduleItems.map(item => item.id === activeNoteItem?.id ? { ...item, customNote: null } : item);
                        setScheduleItems(newList);
                        setIsNoteModalOpen(false);
                        // 同步雲端
                        const tripRef = doc(db, 'trips', 'main_trip_data');
                        updateDoc(tripRef, { scheduleItems: newList });
                      }
                    }} 
                    className="px-4 py-4 bg-red-50 text-red-500 rounded-2xl font-bold active:scale-95 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => setIsNoteModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button onClick={handleSaveNote} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> 儲存備註
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;