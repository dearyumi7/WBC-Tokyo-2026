import React, { useState } from 'https://esm.sh/react@19.2.3';
import { ClipboardList, Briefcase, Phone, MessageSquare, Plus, CheckCircle2, Circle, ExternalLink, ShieldAlert, Users, Trash2, UserPlus, Info, Check, StickyNote, AlertTriangle, X, Palette, GripVertical, Settings, Globe, Calendar as CalendarIcon, Wallet } from 'https://esm.sh/lucide-react@0.563.0';
import { Member, TripConfig } from '../types';

interface PrepViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  tripConfig: TripConfig;
  setTripConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
}

type PrepTab = 'checklist' | 'emergency' | 'notes' | 'members' | 'settings';

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

const PrepView: React.FC<PrepViewProps> = ({ members, setMembers, tripConfig, setTripConfig }) => {
  const [activePrepTab, setActivePrepTab] = useState<PrepTab>('checklist');
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  // Checklist State
  const [todo, setTodo] = useState([
    { id: '1', text: '申請 Visit Japan Web', checked: true },
    { id: '2', text: '購買旅遊平安險', checked: false },
    { id: '3', text: '兌換日幣現鈔', checked: false },
    { id: '4', text: '下載 Tokyo Subway 路線圖', checked: false },
  ]);

  const [packing, setPacking] = useState([
    { id: '1', text: '護照 / 簽證', checked: true },
    { id: '2', text: '球賽門票 (電子檔/紙本)', checked: false },
    { id: '3', text: '加油棒 / 球衣', checked: false },
    { id: '4', text: '行動電源', checked: true },
  ]);

  // Notes State
  const [notes, setNotes] = useState([
    { id: '1', content: '記得帶 Suica 卡，裡面還有餘額' },
    { id: '2', content: '巨蛋內不能帶寶特瓶進場 (超過500ml)' },
  ]);
  const [newNote, setNewNote] = useState('');

  const toggleList = (list: any[], setFn: any, id: string) => {
    if (isEditingChecklist) return;
    setFn(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addItem = (setFn: any) => {
    const text = window.prompt('請輸入項目內容：');
    if (text) {
      setFn((prev: any) => [...prev, { id: Date.now().toString(), text, checked: false }]);
    }
  };

  const deleteItem = (setFn: any, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFn((prev: any) => prev.filter((item: any) => item.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditingChecklist) return;
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string, list: any[], setFn: any) => {
    e.preventDefault();
    if (!isEditingChecklist || !draggedItemId || draggedItemId === targetId) return;

    const newList = [...list];
    const draggedIndex = newList.findIndex(item => item.id === draggedItemId);
    const targetIndex = newList.findIndex(item => item.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);
      setFn(newList);
    }
    setDraggedItemId(null);
  };

  const addMember = () => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: '新成員',
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length],
      note: ''
    };
    setMembers([...members, newMember]);
    setEditingMember(newMember);
  };

  const removeMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (members.length <= 1) {
      alert('至少需要一名成員。');
      return;
    }
    if (window.confirm('確定要刪除這位成員嗎？')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now().toString(), content: newNote }]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const toggleCurrency = (code: string) => {
    setTripConfig(prev => {
      const currencies = [...prev.currencies];
      if (currencies.includes(code)) {
        if (currencies.length <= 1) return prev; // Keep at least one
        return { ...prev, currencies: currencies.filter(c => c !== code) };
      } else {
        return { ...prev, currencies: [...currencies, code] };
      }
    });
  };

  const tabs: { id: PrepTab; label: string; icon: any }[] = [
    { id: 'checklist', label: '清單', icon: ClipboardList },
    { id: 'emergency', label: '緊急', icon: ShieldAlert },
    { id: 'notes', label: '筆記', icon: StickyNote },
    { id: 'members', label: '成員', icon: Users },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Sub-tabs Navigation */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActivePrepTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-w-fit ${activePrepTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            <tab.icon size={16} className="shrink-0" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Settings View */}
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
                <input 
                  placeholder="輸入旅行名稱..." 
                  value={tripConfig.name}
                  onChange={(e) => setTripConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <CalendarIcon size={10} /> 開始日期
                  </label>
                  <input 
                    type="date"
                    value={tripConfig.startDate}
                    onChange={(e) => setTripConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <CalendarIcon size={10} /> 結束日期
                  </label>
                  <input 
                    type="date"
                    value={tripConfig.endDate}
                    onChange={(e) => setTripConfig(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Wallet size={20} /></div>
              <h3 className="text-lg font-black text-slate-800">幣別同步設定</h3>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight px-1 -mt-4">
              勾選的幣別會顯示在記帳與購物頁面中
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CURRENCY_OPTIONS.map(curr => (
                <button
                  key={curr.code}
                  onClick={() => toggleCurrency(curr.code)}
                  className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                    tripConfig.currencies.includes(curr.code)
                    ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-50'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{curr.code}</span>
                    <span className="text-xs font-bold leading-none">{curr.label}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                    tripConfig.currencies.includes(curr.code) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {curr.symbol}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Checklist View */}
      {activePrepTab === 'checklist' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-300">
          <section className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl"><ClipboardList className="text-blue-600" size={20} /></div>
                待辦事項
              </h2>
              <div className="flex items-center gap-2">
                {isEditingChecklist && (
                  <button 
                    onClick={() => addItem(setTodo)} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 active:scale-95 transition-all"
                  >
                    <Plus size={14} /> 新增
                  </button>
                )}
                <button 
                  onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isEditingChecklist ? 'bg-slate-900 text-white' : 'text-blue-600 bg-blue-50'}`}
                >
                  {isEditingChecklist ? '完成' : '編輯'}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {todo.map((item) => (
                <div 
                  key={item.id} 
                  draggable={isEditingChecklist}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id, todo, setTodo)}
                  onClick={() => toggleList(todo, setTodo, item.id)}
                  className={`w-full bg-slate-50 rounded-2xl py-2.5 px-4 border border-slate-100 flex items-center gap-4 transition-all ${!isEditingChecklist ? 'active:scale-[0.98] hover:bg-slate-100/50 cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${draggedItemId === item.id ? 'opacity-40 border-dashed' : ''}`}
                >
                  {isEditingChecklist && <GripVertical size={16} className="text-slate-300 shrink-0" />}
                  {item.checked ? <CheckCircle2 className="text-blue-500" /> : <Circle className="text-slate-200" />}
                  <span className={`font-bold text-left flex-1 text-sm ${item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                  {isEditingChecklist && (
                    <button onClick={(e) => deleteItem(setTodo, item.id, e)} className="text-red-400 p-1 active:scale-90 transition-transform">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl"><Briefcase className="text-blue-600" size={20} /></div>
                行李清單
              </h2>
              <div className="flex items-center gap-2">
                {isEditingChecklist && (
                  <button 
                    onClick={() => addItem(setPacking)} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 active:scale-95 transition-all"
                  >
                    <Plus size={14} /> 新增
                  </button>
                )}
                <button 
                  onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isEditingChecklist ? 'bg-slate-900 text-white' : 'text-blue-600 bg-blue-50'}`}
                >
                  {isEditingChecklist ? '完成' : '編輯'}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {packing.map((item) => (
                <div 
                  key={item.id} 
                  draggable={isEditingChecklist}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id, packing, setPacking)}
                  onClick={() => toggleList(packing, setPacking, item.id)}
                  className={`w-full bg-slate-50 rounded-2xl py-2.5 px-4 border border-slate-100 flex items-center gap-4 transition-all ${!isEditingChecklist ? 'active:scale-[0.98] hover:bg-slate-100/50 cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${draggedItemId === item.id ? 'opacity-40 border-dashed' : ''}`}
                >
                  {isEditingChecklist && <GripVertical size={16} className="text-slate-300 shrink-0" />}
                  {item.checked ? <CheckCircle2 className="text-blue-500" /> : <Circle className="text-slate-200" />}
                  <span className={`font-bold text-left flex-1 text-sm ${item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                  {isEditingChecklist && (
                    <button onClick={(e) => deleteItem(setPacking, item.id, e)} className="text-red-400 p-1 active:scale-90 transition-transform">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Emergency View */}
      {activePrepTab === 'emergency' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
          <section className="bg-white rounded-[2.5rem] p-8 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <ShieldAlert size={20} />
                  </div>
                  緊急求助聯絡
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">警察局 (事件 / 竊盜)</span>
                    <a href="tel:110" className="font-black text-2xl tracking-wider text-red-500 active:scale-95 transition-transform">110</a>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">救護車 / 火警 / 急診</span>
                    <a href="tel:119" className="font-black text-2xl tracking-wider text-orange-500 active:scale-95 transition-transform">119</a>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">海上緊急事件</span>
                    <a href="tel:118" className="font-black text-2xl tracking-wider text-blue-500 active:scale-95 transition-transform">118</a>
                  </div>
                  <div className="pt-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">台北駐日經濟文化代表處</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600">24小時緊急聯絡電話</span>
                      <a href="tel:03-3280-7811" className="font-black text-lg text-slate-900 underline decoration-slate-200 underline-offset-4">03-3280-7811</a>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-100">
                  Visit Japan Web 緊急指引 <ExternalLink size={16} />
                </button>
             </div>
          </section>
        </div>
      )}

      {/* Notes View */}
      {activePrepTab === 'notes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <section>
            <h2 className="text-xl font-black mb-4 px-2 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl">
                <StickyNote className="text-blue-600" size={20} />
              </div>
              重要筆記
            </h2>
            
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6">
              <textarea 
                placeholder="在這裡記錄重要事項或備忘錄..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <button 
                onClick={addNote}
                disabled={!newNote.trim()}
                className="w-full mt-3 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98]"
              >
                <Plus size={18} /> 新增筆記
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {notes.map(note => (
                <div key={note.id} className="bg-white px-5 py-3 rounded-3xl border border-slate-100 shadow-sm group relative">
                  <p className="text-slate-700 text-sm font-medium leading-relaxed pr-8">
                    {note.content}
                  </p>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-2 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">目前沒有筆記</p>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase">點擊上方區域開始記錄吧！</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Members View */}
      {activePrepTab === 'members' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300 pb-10">
          <section>
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-xl font-black flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-600" /></div>
                出遊成員
              </h2>
              <button 
                onClick={() => setIsEditingMembers(!isEditingMembers)} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isEditingMembers 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isEditingMembers ? <Check size={16} /> : null}
                {isEditingMembers ? '完成' : '編輯'}
              </button>
            </div>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  onClick={() => isEditingMembers && setEditingMember({...member})}
                  className={`bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative transition-all ${isEditingMembers ? 'cursor-pointer active:scale-95 hover:border-blue-200' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-inner shrink-0 ${member.color}`}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{member.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {member.note || '成員'}
                    </p>
                  </div>
                  {isEditingMembers && (
                    <button 
                      onClick={(e) => removeMember(member.id, e)} 
                      className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditingMembers && (
                <div className="flex justify-center mt-1 pb-1">
                  <button 
                    onClick={addMember} 
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-dashed border-blue-400 text-blue-400 bg-blue-400 bg-opacity-5 hover:bg-opacity-10 active:scale-90 transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Member Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingMember(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">編輯成員資訊</h3>
                <button onClick={() => setEditingMember(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg ${editingMember.color}`}>
                    {editingMember.name.charAt(0) || '?'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">成員姓名</label>
                  <input 
                    placeholder="請輸入姓名" 
                    value={editingMember.name} 
                    onChange={e => setEditingMember({...editingMember, name: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">註記 / 稱呼</label>
                  <input 
                    placeholder="例如：主揪、攝影師" 
                    value={editingMember.note || ''} 
                    onChange={e => setEditingMember({...editingMember, note: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Palette size={12} /> 圖像顏色
                  </label>
                  <div className="grid grid-cols-6 gap-3 p-1">
                    {MEMBER_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingMember({...editingMember, color})}
                        className={`w-full aspect-square rounded-xl transition-all ${color} ${editingMember.color === color ? 'ring-4 ring-slate-200 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setEditingMember(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button onClick={handleUpdateMember} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> 儲存設定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepView;