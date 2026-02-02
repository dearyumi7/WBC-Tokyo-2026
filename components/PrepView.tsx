import React, { useState, useRef } from 'https://esm.sh/react@19.2.3';
import { ClipboardList, Briefcase, Phone, MessageSquare, Plus, CheckCircle2, Circle, ExternalLink, ShieldAlert, Users, Trash2, UserPlus, Info, Check, StickyNote, AlertTriangle, X, Palette, GripVertical, Settings, Globe, Calendar as CalendarIcon, Wallet, ShieldCheck, Edit3, PhoneCall, Camera, Ticket as CouponIcon, Image as ImageIcon } from 'https://esm.sh/lucide-react@0.563.0';
import { Member, TripConfig, ChecklistItem, CouponItem } from '../types.ts';

type PrepTab = 'checklist' | 'emergency' | 'coupons' | 'members' | 'settings';

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
}

interface PrepViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  tripConfig: TripConfig;
  setTripConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
  todo: ChecklistItem[];
  setTodo: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  packing: ChecklistItem[];
  setPacking: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  coupons: CouponItem[];
  setCoupons: React.Dispatch<React.SetStateAction<CouponItem[]>>;
}

const MEMBER_COLORS = [
  'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 
  'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-slate-500',
  'bg-orange-500', 'bg-teal-500', 'bg-rose-500', 'bg-cyan-500'
];

const CURRENCY_OPTIONS = [
  { code: 'JPY', symbol: '¥', label: '日幣' },
  { code: 'TWD', symbol: '$', label: '台幣' },
  { code: 'USD', symbol: '$', label: '美金' },
  { code: 'EUR', symbol: '€', label: '歐元' },
  { code: 'HKD', symbol: '$', label: '港幣' },
  { code: 'KRW', symbol: '₩', label: '韓元' },
];

const PrepView: React.FC<PrepViewProps> = ({ members, setMembers, tripConfig, setTripConfig, todo, setTodo, packing, setPacking, coupons, setCoupons }) => {
  const [activePrepTab, setActivePrepTab] = useState<PrepTab>('checklist');
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [isEditingCoupons, setIsEditingCoupons] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // 優惠券相關狀態
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [previewCoupon, setPreviewCoupon] = useState<CouponItem | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [couponFormData, setCouponFormData] = useState({ title: '', image: '' });
  const [couponToDeleteId, setCouponToDeleteId] = useState<string | null>(null);
  const couponFileInputRef = useRef<HTMLInputElement>(null);

  // 緊急聯絡人狀態 (初始資料)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: '警察局', number: '110' },
    { id: '2', name: '急救/火警', number: '119' }
  ]);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [isAddEmergencyModalOpen, setIsAddEmergencyModalOpen] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState<EmergencyContact | null>(null);
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyNumber, setNewEmergencyNumber] = useState('');
  const [emergencyToDeleteId, setEmergencyToDeleteId] = useState<string | null>(null);

  // 待辦事項彈窗狀態
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodoItem, setEditingTodoItem] = useState<ChecklistItem | null>(null);
  const [todoInputText, setTodoInputText] = useState('');
  const [todoToDeleteId, setTodoToDeleteId] = useState<string | null>(null);

  // 成員彈窗相關狀態
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNote, setNewMemberNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMBER_COLORS[0]);
  const [memberToDeleteId, setMemberToDeleteId] = useState<string | null>(null);

  const toggleList = (list: ChecklistItem[], setFn: any, id: string) => {
    if (isEditingChecklist) return;
    setFn(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // 優惠券處理邏輯
  const handleOpenCouponModal = (coupon?: CouponItem) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponFormData({ title: coupon.title, image: coupon.image });
    } else {
      setEditingCoupon(null);
      setCouponFormData({ title: '', image: '' });
    }
    setIsCouponModalOpen(true);
  };

  const handleCouponImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCouponFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCoupon = () => {
    if (!couponFormData.title || !couponFormData.image) return;

    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, ...couponFormData } : c));
    } else {
      setCoupons([{ id: Date.now().toString(), ...couponFormData }, ...coupons]);
    }
    setIsCouponModalOpen(false);
  };

  const confirmDeleteCoupon = () => {
    if (couponToDeleteId) {
      setCoupons(coupons.filter(c => c.id !== couponToDeleteId));
      setCouponToDeleteId(null);
      setIsCouponModalOpen(false);
    }
  };

  const handleStartAddMember = () => {
    setEditingMember(null);
    setNewMemberName('');
    setNewMemberNote('');
    setSelectedColor(MEMBER_COLORS[0]);
    setIsAddMemberModalOpen(true);
  };

  const handleStartEditMember = (member: Member) => {
    setEditingMember(member);
    setNewMemberName(member.name);
    setNewMemberNote(member.note || '');
    setSelectedColor(member.color || MEMBER_COLORS[0]);
    setIsAddMemberModalOpen(true);
  };

  const handleSaveMember = () => {
    if (newMemberName && newMemberName.trim()) {
      if (editingMember) {
        setMembers(members.map(m => m.id === editingMember.id ? { 
          ...m, 
          name: newMemberName.trim(), 
          color: selectedColor, 
          note: newMemberNote.trim() || '成員' 
        } : m));
      } else {
        setMembers([...members, { 
          id: Date.now().toString(), 
          name: newMemberName.trim(), 
          color: selectedColor, 
          note: newMemberNote.trim() || '成員' 
        }]);
      }
      setNewMemberName('');
      setNewMemberNote('');
      setSelectedColor(MEMBER_COLORS[0]);
      setEditingMember(null);
      setIsAddMemberModalOpen(false);
    }
  };

  const confirmDeleteMember = () => {
    if (memberToDeleteId) {
      if (members.length <= 1) {
        alert("至少需保留一位成員");
        setMemberToDeleteId(null);
        return;
      }
      setMembers(members.filter(m => m.id !== memberToDeleteId));
      setMemberToDeleteId(null);
    }
  };

  // 緊急聯絡人處理邏輯
  const handleStartAddEmergency = () => {
    setEditingEmergency(null);
    setNewEmergencyName('');
    setNewEmergencyNumber('');
    setIsAddEmergencyModalOpen(true);
  };

  const handleStartEditEmergency = (contact: EmergencyContact) => {
    setEditingEmergency(contact);
    setNewEmergencyName(contact.name);
    setNewEmergencyNumber(contact.number);
    setIsAddEmergencyModalOpen(true);
  };

  const handleSaveEmergency = () => {
    if (newEmergencyName && newEmergencyName.trim() && newEmergencyNumber && newEmergencyNumber.trim()) {
      if (editingEmergency) {
        setEmergencyContacts(emergencyContacts.map(c => c.id === editingEmergency.id ? { 
          ...c, 
          name: newEmergencyName.trim(), 
          number: newEmergencyNumber.trim() 
        } : c));
      } else {
        setEmergencyContacts([...emergencyContacts, { 
          id: Date.now().toString(), 
          name: newEmergencyName.trim(), 
          number: newEmergencyNumber.trim() 
        }]);
      }
      setIsAddEmergencyModalOpen(false);
      setEditingEmergency(null);
      setNewEmergencyName('');
      setNewEmergencyNumber('');
    }
  };

  const confirmDeleteEmergency = () => {
    if (emergencyToDeleteId) {
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== emergencyToDeleteId));
      setEmergencyToDeleteId(null);
    }
  };

  // 待辦事項處理邏輯
  const handleStartAddTodo = () => {
    setEditingTodoItem(null);
    setTodoInputText('');
    setIsTodoModalOpen(true);
  };

  const handleStartEditTodo = (item: ChecklistItem) => {
    setEditingTodoItem(item);
    setTodoInputText(item.text);
    setIsTodoModalOpen(true);
  };

  const handleSaveTodo = () => {
    if (todoInputText && todoInputText.trim()) {
      if (editingTodoItem) {
        setTodo(todo.map(t => t.id === editingTodoItem.id ? { ...t, text: todoInputText.trim() } : t));
      } else {
        setTodo([...todo, { id: Date.now().toString(), text: todoInputText.trim(), checked: false }]);
      }
      setIsTodoModalOpen(false);
      setEditingTodoItem(null);
      setTodoInputText('');
    }
  };

  const confirmDeleteTodo = () => {
    if (todoToDeleteId) {
      setTodo(todo.filter(item => item.id !== todoToDeleteId));
      setTodoToDeleteId(null);
    }
  };

  const tabs: { id: PrepTab; label: string; icon: any }[] = [
    { id: 'checklist', label: '清單', icon: ClipboardList },
    { id: 'emergency', label: '緊急', icon: ShieldAlert },
    { id: 'coupons', label: '票券', icon: CouponIcon },
    { id: 'members', label: '成員', icon: Users },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  const toggleCurrency = (code: string) => {
    setTripConfig(prev => {
      const currencies = [...prev.currencies];
      if (currencies.includes(code)) {
        if (currencies.length <= 1) return prev;
        return { ...prev, currencies: currencies.filter(c => c !== code) };
      } else {
        return { ...prev, currencies: [...currencies, code] };
      }
    });
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActivePrepTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-w-fit ${activePrepTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <tab.icon size={16} className="shrink-0" /> {tab.label}
          </button>
        ))}
      </div>

      {activePrepTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <section className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Globe size={20} /></div>
              <h3 className="text-lg font-black text-slate-800">基本設定</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">旅行名稱</label>
                <input placeholder="輸入旅行名稱..." value={tripConfig.name} onChange={(e) => setTripConfig(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">開始日期</label>
                  <input type="date" value={tripConfig.startDate} onChange={(e) => setTripConfig(prev => ({ ...prev, startDate: e.target.value }))} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">結束日期</label>
                  <input type="date" value={tripConfig.endDate} onChange={(e) => setTripConfig(prev => ({ ...prev, endDate: e.target.value }))} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Wallet size={20} /></div>
              <h3 className="text-lg font-black text-slate-800">幣別同步設定</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CURRENCY_OPTIONS.map(curr => (
                <button key={curr.code} onClick={() => toggleCurrency(curr.code)} className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${tripConfig.currencies.includes(curr.code) ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-50' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{curr.code}</span>
                    <span className="text-xs font-bold leading-none">{curr.label}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${tripConfig.currencies.includes(curr.code) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {curr.symbol}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {activePrepTab === 'checklist' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-300">
          <section className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl"><ClipboardList className="text-blue-600" size={20} /></div>
                待辦事項
              </h2>
              <div className="flex items-center gap-2">
                {isEditingChecklist && (
                  <button 
                    onClick={handleStartAddTodo} 
                    className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                )}
                <button 
                  onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                    isEditingChecklist 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {isEditingChecklist ? <Check size={14} /> : <Edit3 size={14} />}
                  <span>{isEditingChecklist ? '完成' : '編輯'}</span>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {todo.map((item) => (
                <div key={item.id} onClick={() => toggleList(todo, setTodo, item.id)} className={`w-full bg-slate-50 rounded-2xl py-2.5 px-4 border border-slate-100 flex items-center gap-4 transition-all ${!isEditingChecklist ? 'active:scale-[0.98] cursor-pointer' : ''}`}>
                  {item.checked ? <CheckCircle2 className="text-blue-500" /> : <Circle className="text-slate-200" />}
                  <span className={`font-bold text-left flex-1 text-sm ${item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>{item.text}</span>
                  {isEditingChecklist && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEditTodo(item); }}
                        className="p-2 bg-blue-50 text-blue-500 rounded-full active:scale-90 transition-transform"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTodoToDeleteId(item.id); }}
                        className="p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {todo.length === 0 && (
                <div className="text-center py-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  目前無待辦事項
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activePrepTab === 'emergency' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><ShieldAlert className="text-blue-600" size={20} /></div>
              緊急求助聯絡
            </h2>
            <div className="flex items-center gap-2">
              {isEditingEmergency && (
                <button 
                  onClick={handleStartAddEmergency} 
                  className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"
                >
                  <Plus size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsEditingEmergency(!isEditingEmergency)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                  isEditingEmergency 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {isEditingEmergency ? <Check size={14} /> : <Edit3 size={14} />}
                <span>{isEditingEmergency ? '完成' : '編輯'}</span>
              </button>
            </div>
          </div>
          
          <section className="bg-white rounded-[2.5rem] p-8 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
                <div className="space-y-2">
                  {emergencyContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={() => handleStartEditEmergency(contact)}
                      className="flex justify-between items-center border-b border-slate-100 pb-2 relative cursor-pointer hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900">{contact.name}</span>
                        <span className="font-black text-2xl tracking-wider text-blue-600">
                          {contact.number}
                        </span>
                      </div>
                      
                      {isEditingEmergency ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEmergencyToDeleteId(contact.id); }}
                          className="p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300">
                          <PhoneCall size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </section>
        </div>
      )}

      {activePrepTab === 'coupons' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><CouponIcon className="text-blue-600" size={20} /></div>
              商店折價券
            </h2>
            <div className="flex items-center gap-2">
              {isEditingCoupons && (
                <button 
                  onClick={() => handleOpenCouponModal()} 
                  className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"
                >
                  <Plus size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsEditingCoupons(!isEditingCoupons)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                  isEditingCoupons 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {isEditingCoupons ? <Check size={14} /> : <Edit3 size={14} />}
                <span>{isEditingCoupons ? '完成' : '編輯'}</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {coupons.map(coupon => (
              <div 
                key={coupon.id} 
                onClick={() => {
                  if (isEditingCoupons) {
                    handleOpenCouponModal(coupon);
                  } else {
                    setPreviewCoupon(coupon);
                  }
                }}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all active:scale-[0.98] cursor-pointer group hover:border-blue-400 relative"
              >
                <div className="aspect-square bg-slate-50 relative overflow-hidden">
                  <img src={coupon.image} className="w-full h-full object-cover" alt={coupon.title} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {isEditingCoupons && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCouponToDeleteId(coupon.id); }}
                      className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform shadow-sm z-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-black text-slate-800 truncate">{coupon.title}</p>
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="col-span-2 text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <CouponIcon size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-sm font-bold text-slate-400">目前尚無折價券，點擊編輯進入新增</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activePrepTab === 'members' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-600" /></div>
              成員清單
            </h2>
            <div className="flex items-center gap-2">
              {isEditingMembers && (
                <button 
                  onClick={handleStartAddMember} 
                  className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 active:scale-90 transition-all"
                >
                  <Plus size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsEditingMembers(!isEditingMembers)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${
                  isEditingMembers 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {isEditingMembers ? <Check size={14} /> : <Edit3 size={14} />}
                <span>{isEditingMembers ? '完成' : '編輯'}</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {members.map(member => (
              <div 
                key={member.id} 
                onClick={() => handleStartEditMember(member)}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative cursor-pointer hover:border-blue-200 transition-all active:scale-[0.99]"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black ${member.color}`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{member.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{member.note || '成員'}</p>
                </div>
                {isEditingMembers && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMemberToDeleteId(member.id); }}
                    className="absolute right-5 p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 圖片預覽 Overlay */}
      {previewCoupon && (
        <div 
          className="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setPreviewCoupon(null)}
        >
          <button className="absolute top-12 right-6 p-3 bg-white/10 text-white rounded-full backdrop-blur-md">
            <X size={24} />
          </button>
          <div className="w-full max-w-lg aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <img src={previewCoupon.image} className="w-full h-full object-contain bg-slate-50" alt={previewCoupon.title} />
          </div>
          <p className="mt-6 text-white font-black text-xl tracking-tight">{previewCoupon.title}</p>
          <p className="mt-2 text-white/50 text-xs font-bold uppercase tracking-widest">點擊背景關閉</p>
        </div>
      )}

      {/* 折價券編輯/新增彈窗 */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><CouponIcon size={20} /></div>
                  {editingCoupon ? '編輯折價券' : '新增折價券'}
                </h3>
                <button onClick={() => setIsCouponModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 hide-scrollbar">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">折價券照片</label>
                  <div 
                    onClick={() => couponFileInputRef.current?.click()} 
                    className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                  >
                    {couponFormData.image ? (
                      <>
                        <img src={couponFormData.image} className="w-full h-full object-cover" alt="Coupon preview" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={32} />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-200 mb-2" size={32} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">點擊上傳折價券截圖</span>
                      </>
                    )}
                    <input type="file" ref={couponFileInputRef} onChange={handleCouponImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">商店/名稱</label>
                  <input 
                    placeholder="例如：唐吉訶德、大國藥妝..." 
                    value={couponFormData.title} 
                    onChange={e => setCouponFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsCouponModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button 
                  onClick={handleSaveCoupon} 
                  disabled={!couponFormData.title || !couponFormData.image}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> {editingCoupon ? '儲存修改' : '加入票券'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 優惠券刪除確認彈窗 */}
      {couponToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCouponToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除此票券？</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteCoupon} 
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                確認刪除
              </button>
              <button 
                onClick={() => setCouponToDeleteId(null)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 待辦事項編輯/新增彈窗 */}
      {isTodoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsTodoModalOpen(false); setEditingTodoItem(null); }}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><ClipboardList size={20} /></div>
                  {editingTodoItem ? '編輯待辦事項' : '新增待辦事項'}
                </h3>
                <button onClick={() => { setIsTodoModalOpen(false); setEditingTodoItem(null); }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">項目內容</label>
                  <input 
                    autoFocus
                    placeholder="輸入內容..." 
                    value={todoInputText} 
                    onChange={e => setTodoInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveTodo()}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setIsTodoModalOpen(false); setEditingTodoItem(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button 
                  onClick={handleSaveTodo} 
                  disabled={!todoInputText.trim()}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> {editingTodoItem ? '更新項目' : '確認新增'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 緊急聯絡人編輯/新增彈窗 */}
      {isAddEmergencyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsAddEmergencyModalOpen(false); setEditingEmergency(null); }}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><ShieldAlert size={20} /></div>
                  {editingEmergency ? '編輯聯絡人' : '新增聯絡人'}
                </h3>
                <button onClick={() => { setIsAddEmergencyModalOpen(false); setEditingEmergency(null); }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">聯絡人名稱 (如：警察局、飯店)</label>
                  <input 
                    autoFocus
                    placeholder="輸入名稱..." 
                    value={newEmergencyName} 
                    onChange={e => setNewEmergencyName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">聯絡電話</label>
                  <input 
                    type="tel"
                    placeholder="輸入電話號碼..." 
                    value={newEmergencyNumber} 
                    onChange={e => setNewEmergencyNumber(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setIsAddEmergencyModalOpen(false); setEditingEmergency(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button 
                  onClick={handleSaveEmergency} 
                  disabled={!newEmergencyName.trim() || !newEmergencyNumber.trim()}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> {editingEmergency ? '更新聯絡人' : '確認新增'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成員編輯/新增彈窗 */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsAddMemberModalOpen(false); setEditingMember(null); }}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><UserPlus size={20} /></div>
                  {editingMember ? '編輯成員' : '新增成員'}
                </h3>
                <button onClick={() => { setIsAddMemberModalOpen(false); setEditingMember(null); }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 hide-scrollbar">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">成員姓名</label>
                  <input 
                    autoFocus
                    placeholder="輸入姓名..." 
                    value={newMemberName} 
                    onChange={e => setNewMemberName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveMember()}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">代表顏色</label>
                  <div className="grid grid-cols-6 gap-3 p-1">
                    {MEMBER_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-full aspect-square rounded-xl transition-all ${color} ${selectedColor === color ? 'ring-4 ring-blue-100 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                      >
                        {selectedColor === color && <Check className="text-white mx-auto" size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">分工事項 / 備註</label>
                  <input 
                    placeholder="例如：訂機票、聯絡行程..." 
                    value={newMemberNote} 
                    onChange={e => setNewMemberNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveMember()}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setIsAddMemberModalOpen(false); setEditingMember(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button 
                  onClick={handleSaveMember} 
                  disabled={!newMemberName.trim()}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={18} /> {editingMember ? '更新資料' : '確認新增'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 緊急聯絡人刪除確認彈窗 */}
      {emergencyToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEmergencyToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除聯絡人？</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              「{emergencyContacts.find(c => c.id === emergencyToDeleteId)?.name}」刪除後將無法復原。
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteEmergency} 
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                確認刪除
              </button>
              <button 
                onClick={() => setEmergencyToDeleteId(null)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 待辦事項刪除確認彈窗 */}
      {todoToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setTodoToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除待辦事項？</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              「{todo.find(item => item.id === todoToDeleteId)?.text}」刪除後將無法復原。
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteTodo} 
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                確認刪除
              </button>
              <button 
                onClick={() => setTodoToDeleteId(null)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成員刪除確認彈窗 */}
      {memberToDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMemberToDeleteId(null)}></div>
          <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除成員嗎？</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              「{members.find(m => m.id === memberToDeleteId)?.name}」刪除後將無法復原。
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteMember} 
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                確認刪除
              </button>
              <button 
                onClick={() => setMemberToDeleteId(null)} 
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepView;