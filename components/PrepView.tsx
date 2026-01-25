import React, { useState } from 'https://esm.sh/react@19.2.3';
import { ClipboardList, Briefcase, Phone, MessageSquare, Plus, CheckCircle2, Circle, ExternalLink, ShieldAlert, Users, Trash2, UserPlus, Info, Check, StickyNote, AlertTriangle, X, Palette, GripVertical, Settings, Globe, Calendar as CalendarIcon, Wallet, ShieldCheck } from 'https://esm.sh/lucide-react@0.563.0';
import { Member, TripConfig, ChecklistItem, NoteItem } from '../types.ts';

interface PrepViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  tripConfig: TripConfig;
  setTripConfig: React.Dispatch<React.SetStateAction<TripConfig>>;
  todo: ChecklistItem[];
  setTodo: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  packing: ChecklistItem[];
  setPacking: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
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

const PrepView: React.FC<PrepViewProps> = ({ members, setMembers, tripConfig, setTripConfig, todo, setTodo, packing, setPacking, notes, setNotes }) => {
  const [activePrepTab, setActivePrepTab] = useState<PrepTab>('checklist');
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const toggleList = (list: ChecklistItem[], setFn: any, id: string) => {
    if (isEditingChecklist) return;
    setFn(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addItem = (setFn: any) => {
    const text = window.prompt('請輸入項目內容：');
    if (text) setFn((prev: any) => [...prev, { id: Date.now().toString(), text, checked: false }]);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now().toString(), content: newNote }]);
    setNewNote('');
  };

  const tabs: { id: PrepTab; label: string; icon: any }[] = [
    { id: 'checklist', label: '清單', icon: ClipboardList },
    { id: 'emergency', label: '緊急', icon: ShieldAlert },
    { id: 'notes', label: '筆記', icon: StickyNote },
    { id: 'members', label: '成員', icon: Users },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

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
          {/* Deployment Status Section */}
          <section className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Deployment Status</h3>
                  <p className="text-[10px] text-slate-400 font-bold">正式環境部署資訊</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-emerald-500/30">
                Ready
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">正式網址 (WBC Official App)</p>
                <a 
                  href="https://tokyo-wbc-shared.web.app" 
                  target="_blank" 
                  className="text-blue-400 text-xs font-bold flex items-center gap-1.5 hover:underline"
                >
                  tokyo-wbc-shared.web.app <ExternalLink size={12} />
                </a>
              </div>
              <div className="pt-2 border-t border-white/5 flex gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-white font-bold block mb-1">重要提示</span>
                  部署完成後，請務必前往 <span className="text-orange-300">Firebase Console > Authentication > Settings</span>，將新網址加入 <span className="text-orange-300">Authorized Domains</span> 授權清單，以確保 Google Gemini API 與 Firebase 功能正常運作。
                </p>
              </div>
            </div>
          </section>

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
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl"><ClipboardList className="text-blue-600" size={20} /></div>
                待辦事項
              </h2>
              <div className="flex items-center gap-2">
                {isEditingChecklist && <button onClick={() => addItem(setTodo)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 active:scale-95 transition-all"><Plus size={14} /> 新增</button>}
                <button onClick={() => setIsEditingChecklist(!isEditingChecklist)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isEditingChecklist ? 'bg-slate-900 text-white' : 'text-blue-600 bg-blue-50'}`}>{isEditingChecklist ? '完成' : '編輯'}</button>
              </div>
            </div>
            <div className="space-y-3">
              {todo.map((item) => (
                <div key={item.id} onClick={() => toggleList(todo, setTodo, item.id)} className={`w-full bg-slate-50 rounded-2xl py-2.5 px-4 border border-slate-100 flex items-center gap-4 transition-all ${!isEditingChecklist ? 'active:scale-[0.98] cursor-pointer' : 'cursor-grab'} ${draggedItemId === item.id ? 'opacity-40 border-dashed' : ''}`}>
                  {item.checked ? <CheckCircle2 className="text-blue-500" /> : <Circle className="text-slate-200" />}
                  <span className={`font-bold text-left flex-1 text-sm ${item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activePrepTab === 'emergency' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
          <section className="bg-white rounded-[2.5rem] p-8 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><ShieldAlert size={20} /></div>
                  緊急求助聯絡
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">警察局</span>
                    <a href="tel:110" className="font-black text-2xl tracking-wider text-red-500">110</a>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">急救/火警</span>
                    <a href="tel:119" className="font-black text-2xl tracking-wider text-orange-500">119</a>
                  </div>
                </div>
             </div>
          </section>
        </div>
      )}

      {activePrepTab === 'notes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <section>
            <h2 className="text-xl font-black mb-4 px-2 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><StickyNote className="text-blue-600" size={20} /></div>
              重要筆記
            </h2>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6">
              <textarea placeholder="記錄筆記..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 resize-none" />
              <button onClick={addNote} disabled={!newNote.trim()} className="w-full mt-3 py-3 bg-slate-900 text-white rounded-2xl font-bold active:scale-[0.98]">新增筆記</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {notes.map(note => (
                <div key={note.id} className="bg-white px-5 py-3 rounded-3xl border border-slate-100 shadow-sm relative group">
                  <p className="text-slate-700 text-sm font-medium leading-relaxed pr-8">{note.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activePrepTab === 'members' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-600" /></div>
              成員清單
            </h2>
          </div>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black ${member.color}`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{member.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{member.note || '成員'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepView;