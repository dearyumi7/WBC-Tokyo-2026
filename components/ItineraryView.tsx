import React, { useState, useEffect, useRef } from 'react';
// Fix: Remove non-existent SubcornerRight icon from lucide-react
import { MapPin, Navigation, Plus, Sun, Cloud, Clock, Wind, Edit3, Check, X, Info, Trash2, Train, Bus, Car, Plane, Footprints, ChevronRight, ArrowRight, ChevronDown, ChevronUp, StickyNote, DollarSign, GripVertical, History, Utensils, ShoppingBag, Map as MapIcon, Loader2, ArrowLeft, BookOpen, Settings, ListPlus, Bold, Italic, Type, Palette, Minus, ExternalLink, Link, Image, Search } from 'lucide-react';
import { Transport, TransportTransfer } from '../types';

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
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
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
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ transports = [] }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'advanced'>('basic');
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedDetailId, setDraggedDetailId] = useState<string | null>(null);

  const [selectedSpotForDetail, setSelectedSpotForDetail] = useState<ScheduleItem | null>(null);

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [activeTransportItem, setActiveTransportItem] = useState<ScheduleItem | null>(null);
  const [activeNoteItem, setActiveNoteItem] = useState<ScheduleItem | null>(null);

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
    },
    {
      id: 'airport-arrival-ngo',
      time: '11:05',
      event: '抵達中部國際機場第一航廈',
      addr: 'Chubu Centrair International Airport T1',
      type: 'transport',
      plannedTransport: {
        type: '飛機',
        name: '中華航空CI 0154',
        from: '桃園國際機場',
        to: '中部國際機場',
        departureTime: '07:35',
        arrivalTime: '11:05',
        note: '',
        price: 13328,
        currency: 'TWD'
      },
      customNote: '第一航廈4樓購買「蝦仙貝之里」\n推薦綜合口味蝦餅'
    },
    {
      id: 'hotel-luggage-drop',
      time: '13:30',
      event: '飯店寄放行李',
      addr: '1 Chome-14-16 Meiekiminami, Nakamura Ward, Nagoya, Aichi',
      type: 'visit',
      plannedTransport: {
        type: '地鐵',
        name: '名鐵電車',
        from: '中部國際機場',
        to: '名古屋車站',
        departureTime: '',
        arrivalTime: '13:30',
        note: '',
        price: 1430,
        currency: 'JPY'
      }
    },
    { 
      id: 'inuyama-castle', 
      time: '15:00', 
      event: '犬山城', 
      addr: 'Inuyama, Aichi', 
      type: 'visit',
      plannedTransport: {
        type: '地鐵',
        name: '名鐵特急',
        from: '名鐵名古屋',
        to: '犬山遊園',
        departureTime: '14:13',
        arrivalTime: '15:10',
        note: '',
        price: 690,
        currency: 'JPY'
      },
      customDetails: [
        { 
          id: 'inuyama-history', 
          title: '犬山城歷史介紹', 
          content: '<div>犬山城由織田信長的叔父織田信康於1537年所建，是日本現存12座天守閣中最古老的，也是被日本指定為國寶的五座名城之一 (另外四座為：姫路城、松本城、彦根城、松江城)。</div><br><div>犬山城又被稱作「白帝城」，源自於李白的《早發白帝城》，因古人覺得犬山城地理環境與詩中「朝辭白帝彩雲間，千里江陵一日還。兩岸猿聲啼不盡，輕舟已過萬重山。」描述極為相似，故有此名。</div>' 
        },
        { 
          id: 'inuyama-nearby', 
          title: '附近景點', 
          content: '<div>一、三光稻荷神社洗錢、換福種錢、求戀愛運</div><br><div>位於犬山城山腳的三光稻荷神社，相傳已有400多年歷史，被視為犬山城的守護神社，對守護家庭安全、生意興隆、交通安全、婚姻和睦等都相當靈驗。</div><br><div>境內還有姬龜神社、錢洗稻荷神社、猿田彥神社三座小神社。</div><br><div>祈求良緣的「姬龜神社」最受年輕女性歡迎，粉紅色的心型繪馬和愛心籤詩佈滿整座神社，超美超夢幻。</div><br><div>「錢洗稻荷神社」，據說用這裡的御神水洗錢，就會獲得加倍的報酬。</div><div>洗錢流程如下：</div><div>在接待處付100日圓領取竹簍和一支蠟燭。</div><div>點蠟燭並供奉於燭台之中。</div><div>將錢放在竹簍中用御神水清洗。</div><br><a href="https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%B8%A3%E7%8A%AC%E5%B1%B1%E5%B8%82%E7%8A%AC%E5%B1%B1%E5%8C%97%E5%8F%A4%E5%88%B865-18" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 愛知縣犬山市犬山北古券65-18</a>&nbsp;<br><div>．營業時間：08:30-16:30 (周一至周日)</div>' 
        },
        { 
          id: 'inuyama-food', 
          title: '犬山城美食', 
          content: '<div>1. 犬山牛太郎</div><div>A5飛驒牛握壽司，壽司兩貫一組，有芥末、蒜、薑三種口味任選。</div><br><div>肉質呈現淡粉色，油花細緻豐富，肉片微微炙燒過，入口即化香氣十足，沾醬山葵辣度不高，適度提味剛剛好。</div><br><a href="https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%B8%A3%E7%8A%AC%E5%B1%B1%E5%B8%82%E7%8A%AC%E5%B1%B1%E6%9D%B1%E5%8F%A4%E5%88%B875" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 愛知縣犬山市犬山東古券75</a>&nbsp;<br><div>．營業時間：09:00-17:00 (周一至周日)</div><hr style="margin: 12px 0;"><div>2. 本町茶寮</div><div>童趣滿點可愛超療癒！金魚果凍蘇打，內用直接放在魚缸裡，外帶則是夾鏈袋，話題性滿點。</div><br><div>飲料中藍色是蒟蒻，料放滿滿每口都喝的到，金魚本體則沒什麼特殊味道，沁涼消暑親子出遊犬山城記得來品嘗。</div><br><a href="https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%B8%A3%E7%8A%AC%E5%B1%B1%E5%B8%82%E7%8A%AC%E5%B1%B1%E6%9D%B1%E5%8F%A4%E5%88%B8673" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 愛知縣犬山市犬山東古券673</a>&nbsp;<br><div>．營業時間：11:00-17:00 (周一至周日)</div><hr style="margin: 12px 0;"><div>3. Tonamaru串炸</div><div>五彩繽紛的串炸，光看就讓人著迷，有雞肉、豬肉、鮮蝦三種口味可選。</div><div>豬肉，顆粒炸粉酥脆帶點硬，裡面的肉鮮美不老柴。</div><br><a href="https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%B8%A3%E7%8A%AC%E5%B1%B1%E5%B8%82%E7%8A%AC%E5%B1%B1%E8%A5%BF%E5%8F%A4%E5%88%B812-1" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 愛知縣犬山市犬山西古券12-1</a>&nbsp;<br><div>．營業時間：10:30-17:00 (周一至周日)</div><hr style="margin: 12px 0;"><div>4. 戀小町團子</div><div>宛如珠寶般色彩繽紛，廣受女孩歡迎，位於充滿懷舊感的犬山城下町昭和橫丁內，非常適合拍照打卡的散步美食。</div><br><div>糰子充滿嚼勁，搭配10種以上水果和食材製成的豆沙餡，有草莓、蜜柑、抹茶等依季節做變化，甜度恰到好處。</div><br><a href="https://www.google.com/maps/search/?api=1&query=%E6%84%9B%E7%9F%A5%E7%B8%A3%E7%8A%AC%E5%B1%B1%E5%B8%82%E7%8A%AC%E5%B1%B1%E8%A5%BF%E5%8F%A4%E5%88%B860%20%E6%98%AD%E5%92%8C%E6%A9%AB%E4%B8%81%E5%85%A7" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📍 愛知縣犬山市犬山西古券60 昭和橫丁內</a>&nbsp;<br><div>．營業時間：11:00-17:00 (周二公休)</div>' 
        }
      ]
    },
    {
      id: 'sakae-district',
      time: '19:00',
      event: '榮商圈',
      addr: 'Sakae, Naka Ward, Nagoya, Aichi',
      type: 'visit',
      currency: 'JPY',
      plannedTransport: {
        type: '地鐵',
        name: '名鐵特急',
        from: '犬山遊園',
        to: '名鐵名古屋',
        departureTime: '18:00',
        arrivalTime: '18:35',
        currency: 'JPY',
        transfers: [
          {
            type: '地鐵',
            name: '東山線',
            from: '名古屋車站',
            to: '榮(愛知)',
            departureTime: '18:37',
            arrivalTime: '18:41'
          }
        ]
      },
      customDetails: [
        { 
          id: 'sakae-matsuzakaya', 
          title: '松阪屋', 
          content: '<div>一、美食</div><div>1. 「矢場とん」味噌豬排: 南館10樓</div><div>2. HARBS: 本館4樓</div><hr style="margin: 12px 0;"><div>二、伴手禮</div><div>1. 治一郎年輪蛋糕: 江湖人稱「喝的年輪蛋糕」，因為它的濕潤度高到不需要配飲料。蛋糕體層層分明，口感紮實卻又入口即化，蛋香和奶油香氣非常高雅。</div><hr style="margin: 12px 0;"><div>．營業時間: B2～3樓的賣場開到晚上8點，但4樓以上的樓層只開到晚上7點半(部分餐廳除外)</div><div>．退稅櫃台: 南館3樓</div>' 
        },
        { 
          id: 'sakae-mitsukoshi', 
          title: '名古屋榮三越/LACHIC', 
          content: '<div>一、美食</div><div>1. 「矢場とん」味噌豬排: 7F</div><div>2. HARBS: 2F</div><hr style="margin: 12px 0;"><div>二、購物</div><div>2F: BEAMS、UNITED ARROWS這些指標性的選物店都在此</div><div>4F: BEAMS旗下的B:MING LIFE STORE就在這，風格比較清新、實穿</div><div>5F: The North Face、MAMMUT長毛象，或是日本超夯的and wander</div><hr style="margin: 12px 0;"><div>．營業時間: 11:00 – 21:00</div>' 
        },
        { 
          id: 'sakae-parco', 
          title: 'PARCO', 
          content: '<div>一、娛樂</div><div>1. 寶可夢中心: 東館2F</div><div>2. 吉伊卡哇樂園: 東館3F</div><div>3. C-pla (扭蛋專門店): 東館4F</div><hr style="margin: 12px 0;"><div>．營業時間: 10:00 – 20:00</div>' 
        }
      ]
    },
    {
      id: 'nagoya-station-return',
      time: '21:00',
      event: '名古屋車站',
      addr: 'Nakamura Ward, Nagoya, Aichi',
      type: 'visit',
      plannedTransport: {
        type: '地鐵',
        name: '東山線',
        from: '榮(愛知)',
        to: '名古屋車站',
        departureTime: '20:45',
        arrivalTime: '20:52',
        price: 210,
        currency: 'JPY'
      },
      customNote: '千里馬藥局\n營業時間09:00–21:00(1樓到22:00)\n退稅櫃檯在2樓'
    },
    {
      id: 'hotel-rest',
      time: '22:30',
      event: '飯店休息',
      addr: '1 Chome-14-16 Meiekiminami, Nakamura Ward, Nagoya, Aichi',
      type: 'visit'
    }
  ]);

  // 新增 activeItemId 用於追蹤當前滾動到的項目
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

  // 設定滾動監測：根據佔比最多且最完整的行程來切換藍色圈圈
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 更新當前畫面上所有觀察對象的可視佔比
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            visibilityMap.current.set(id, entry.intersectionRatio);
          }
        });

        // 找出佔比最大（最完整）的項目
        let maxRatio = -1;
        let bestId = null;
        let bestTop = Infinity;

        // 從 DOM 中取得所有行程行，確保按順序（從上到下）進行比對
        const allRows = document.querySelectorAll('.itinerary-item-row');
        allRows.forEach((el) => {
          const id = el.getAttribute('data-id');
          if (!id) return;
          
          const ratio = visibilityMap.current.get(id) || 0;
          const rect = el.getBoundingClientRect();

          // 判斷邏輯：
          // 1. 如果此項目的佔比比目前最好的更高，則它勝出。
          // 2. 如果佔比一樣（例如都是 1.0 完整顯示），則選取 bounding box 頂部更靠近視窗頂部的（Topmost）。
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
        // 使用多個門檻值（thresholds）以獲得更平滑的佔比計算
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

  const days = [
    { date: '3/5', weekday: 'THU', weather: '12°C', icon: Sun, condition: '晴朗' },
    { date: '3/6', weekday: 'FRI', weather: '10°C', icon: Cloud, condition: '多雲' },
    { date: '3/7', weekday: 'SAT', weather: '11°C', icon: Sun, condition: '晴朗' },
    { date: '3/8', weekday: 'SUN', weather: '9°C', icon: Cloud, condition: '陰天' },
    { date: '3/9', weekday: 'MON', weather: '13°C', icon: Sun, condition: '晴朗' },
    { date: '3/10', weekday: 'TUE', weather: '12°C', icon: Sun, condition: '晴朗' },
    { date: '3/11', weekday: 'WED', weather: '11°C', icon: Cloud, condition: '多雲' },
  ];

  const currentDayWeather = days[selectedDay];

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

    if (editingItem) {
      setScheduleItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData as ScheduleItem } : item));
    } else {
      setScheduleItems(prev => [...prev, { ...formData as ScheduleItem, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此行程嗎？')) {
      setScheduleItems(prev => prev.filter(item => item.id !== id));
    }
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
    setScheduleItems(prev => prev.map(item => 
      item.id === activeTransportItem.id 
      ? { ...item, plannedTransport: transportFormData } 
      : item
    ));
    setIsTransportModalOpen(false);
  };

  const handleSaveNote = () => {
    if (!activeNoteItem) return;
    setScheduleItems(prev => prev.map(item => 
      item.id === activeNoteItem.id 
      ? { ...item, customNote: noteFormData } 
      : item
    ));
    setIsNoteModalOpen(false);
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
        return newList;
      }
      return prev;
    });
    setDraggedItemId(null);
  };

  const handleDetailDragStart = (e: React.DragEvent, id: string) => {
    // 檢查目標是否為輸入框或編輯器，若是則不觸發拖曳，保留選取文字功能
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

  // 過濾已被其他行程引用的交通預訂
  const availableTransports = transports.filter(t => {
    // 檢查此交通預訂是否已被任何行程引用 (排除目前正在編輯的行程所引用的那個)
    return !scheduleItems.some(item => {
      if (item.id === activeTransportItem?.id) return false;
      const pt = item.plannedTransport;
      if (!pt) return false;
      // 使用多個欄位比對以確定是同一個預訂
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">東京地區天氣預報</p>
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
                    
                    {/* Main Leg */}
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

                    {/* Transfers */}
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
                          key={detail.id} // 使用唯一 ID 作為 key，確保 React 能夠追蹤組件身份
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
                <button onClick={handleSave} disabled={!formData.event} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check size={18} /> {editingItem ? '儲存修改' : '加入行程'}
                </button>
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

                {/* Primary Segment */}
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

                {/* Transfers Segments */}
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
                        className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
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
                    onClick={() => {
                      if (window.confirm('確定要移除此交通規劃嗎？')) {
                        setTransportFormData({ price: 0, currency: 'JPY', transfers: [] });
                        setScheduleItems(prev => prev.map(item => item.id === activeTransportItem?.id ? { ...item, plannedTransport: undefined } : item));
                        setIsTransportModalOpen(false);
                      }
                    }} 
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
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
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
                        setScheduleItems(prev => prev.map(item => item.id === activeNoteItem?.id ? { ...item, customNote: undefined } : item));
                        setIsNoteModalOpen(false);
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