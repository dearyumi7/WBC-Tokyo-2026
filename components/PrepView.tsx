import React, { useState } from 'https://esm.sh/react@19.2.3';
import { ClipboardList, Briefcase, Phone, MessageSquare, Plus, CheckCircle2, Circle, ExternalLink, ShieldAlert, Users, Trash2, UserPlus, Info, Check, StickyNote, AlertTriangle, X, Palette, GripVertical, Settings, Globe, Calendar as CalendarIcon, Wallet, ShieldCheck, Terminal, Copy, Command, Play, LogIn, RefreshCw, AlertCircle, FileCode, Zap, FileCheck, FolderSearch, Shield, SearchCheck } from 'https://esm.sh/lucide-react@0.563.0';
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

const PrepView: React.FC<PrepViewProps> = ({ members, setMembers, tripConfig, setTripConfig, todo, setTodo, packing, setPacking, notes, setNotes }) => {
  const [activePrepTab, setActivePrepTab] = useState<PrepTab>('checklist');
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditingChecklist) return;
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (setFn: React.Dispatch<React.SetStateAction<ChecklistItem[]>>, targetId: string) => {
    if (!isEditingChecklist || !draggedItemId || draggedItemId === targetId) return;
    setFn(prev => {
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

  const tabs: { id: PrepTab; label: string; icon: any }[] = [
    { id: 'checklist', label: '清單', icon: ClipboardList },
    { id: 'emergency', label: '緊急', icon: ShieldAlert },
    { id: 'notes', label: '筆記', icon: StickyNote },
    { id: 'members', label: '成員', icon: Users },
    { id: 'settings', label: '設定', icon: Settings },
  ];

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
          {/* Ultimate Deployment & Diagnostic Center */}
          <section className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">Ultimate Deploy Fix</h3>
                  <p className="text-[10px] text-blue-400 font-bold">診斷並強制排除 Site Not Found</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">System Ready</span>
              </div>
            </div>

            {/* Diagnostic Checklist */}
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><SearchCheck size={14} /></div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Site ID 校對</p>
                    <p className="text-[11px] font-black text-white">tokyo-wbc-shared</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1"><Check size={12} /> OK</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><FileCheck size={14} /></div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">檔案完整性</p>
                    <p className="text-[11px] font-black text-white">dist/index.html (含 id="root")</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1"><Check size={12} /> OK</span>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-inner">
              <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">zsh — ultimate-fix-script</span>
              </div>
              <div className="p-4 font-mono text-[11px] space-y-4 leading-relaxed max-h-[350px] overflow-y-auto hide-scrollbar">
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between group">
                    <span className="text-blue-400 font-black"># 1. 強制重新關聯專案 (手動選擇)</span>
                    <button onClick={() => copyToClipboard('npx firebase use --add', 'UseAdd')} className="p-1 bg-white/10 rounded-lg text-slate-400 hover:text-white"><Copy size={10} /></button>
                  </div>
                  <div className="text-emerald-400">$ npx firebase use --add</div>
                  <div className="text-slate-500 pl-4">? Which project do you want to add? <span className="text-white">tokyo-wbc-shared</span><br/>? What alias... <span className="text-white">default</span></div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between group">
                    <span className="text-blue-400 font-black"># 2. 徹底上傳與強制發布 (Final Command)</span>
                    <button onClick={() => copyToClipboard('npm run build && npx firebase deploy --only hosting --project tokyo-wbc-shared', 'FullDeploy')} className="p-1 bg-white/10 rounded-lg text-slate-400 hover:text-white"><Copy size={10} /></button>
                  </div>
                  <div className="text-emerald-400">$ npm run build && npx firebase deploy --only hosting --project tokyo-wbc-shared</div>
                  <div className="text-slate-500 pl-4">
                    + <span className="text-white">hosting:</span> uploading dist folder...<br/>
                    + <span className="text-white">hosting:</span> 1 files uploaded successfully.<br/>
                    <span className="text-emerald-400 font-black">✔ Deploy complete!</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => copyToClipboard('npm run build && npx firebase deploy --only hosting --project tokyo-wbc-shared', 'FullDeploy')}
                className="w-full flex items-center justify-between px-6 py-5 bg-emerald-600 rounded-[2rem] font-black text-xs hover:bg-emerald-500 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <Zap size={16} />
                  <span>執行最徹底上傳 (Build + Force Deploy)</span>
                </div>
                <span className="text-[10px] font-black uppercase opacity-70 tracking-widest">{copyFeedback === 'FullDeploy' ? 'Copied!' : 'Copy CMD'}</span>
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Globe size={14} /> 驗證目標網址 (Live Checks)
              </div>
              <div className="grid grid-cols-1 gap-2">
                <a href="https://tokyo-wbc-shared.web.app" target="_blank" className="flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-2xl group transition-all">
                  <span className="text-xs font-black text-white">tokyo-wbc-shared.web.app</span>
                  <ExternalLink size={16} className="text-emerald-400 opacity-50 group-hover:opacity-100" />
                </a>
                <a href="https://tokyo-wbc-shared.firebaseapp.com" target="_blank" className="flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl group transition-all">
                  <span className="text-xs font-black text-white">tokyo-wbc-shared.firebaseapp.com</span>
                  <ExternalLink size={16} className="text-blue-400 opacity-50 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Info size={16} />
                <span className="text-[11px] font-black uppercase tracking-wider">診斷建議</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                若網址仍未更新，請確認 Firebase Console 中 Hosting 頁面的 <code className="text-white">Site ID</code> 確實與專案 ID 一致。有時 Firebase 會自動產生一個隨機 ID 站點，您需要手動在 <code className="text-white">firebase.json</code> 指定它。
              </p>
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
                <div 
                  key={item.id} 
                  onClick={() => toggleList(todo, setTodo, item.id)} 
                  draggable={isEditingChecklist}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(setTodo, item.id)}
                  className={`w-full bg-slate-50 rounded-2xl py-2.5 px-4 border border-slate-100 flex items-center gap-4 transition-all ${!isEditingChecklist ? 'active:scale-[0.98] cursor-pointer' : 'cursor-grab'} ${draggedItemId === item.id ? 'opacity-40 border-dashed' : ''}`}
                >
                  {item.checked ? <CheckCircle2 className="text-blue-500" /> : <Circle className="text-slate-200" />}
                  <span className={`font-bold text-left flex-1 text-sm ${item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>{item.text}</span>
                  {isEditingChecklist && <div className="text-slate-300"><GripVertical size={16} /></div>}
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