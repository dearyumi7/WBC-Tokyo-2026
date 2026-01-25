import React, { useState } from 'https://esm.sh/react@19.2.3';
import { ClipboardList, Users, Trash2, Plus, Mail, ShieldAlert, StickyNote, Check, X, ShieldCheck } from 'https://esm.sh/lucide-react@0.563.0';
import { Member } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

interface PrepViewProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  isEditable?: boolean;
}

const MEMBER_COLORS = ['bg-blue-600', 'bg-pink-500', 'bg-emerald-500', 'bg-slate-800', 'bg-purple-600', 'bg-red-500'];

const PrepView: React.FC<PrepViewProps> = ({ members, setMembers, isEditable = false }) => {
  const [activePrepTab, setActivePrepTab] = useState<'checklist' | 'emergency' | 'notes' | 'members'>('members');
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const handleSaveMember = async () => {
    if (!editingMember || !db || !isEditable) return;
    try {
      await setDoc(doc(db, 'members', editingMember.id), {
        ...editingMember,
        note: editingMember.note?.toLowerCase().trim() || ''
      });
      setEditingMember(null);
    } catch (e: any) {
      alert(`儲存失敗：${e.message}`);
    }
  };

  const removeMember = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable || !db) return;
    if (window.confirm('確定刪除此成員？其編輯權限也將一併移除。')) {
      await deleteDoc(doc(db, 'members', id));
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
        {[
          { id: 'checklist', label: '清單', icon: ClipboardList },
          { id: 'emergency', label: '緊急', icon: ShieldAlert },
          { id: 'notes', label: '筆記', icon: StickyNote },
          { id: 'members', label: '成員權限', icon: Users },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActivePrepTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black transition-all min-w-fit ${activePrepTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activePrepTab === 'members' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black">旅伴與編輯權限</h2>
            {isEditable && (
              <button onClick={() => setEditingMember({ id: Date.now().toString(), name: '', color: MEMBER_COLORS[members.length % MEMBER_COLORS.length], note: '' })} className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100">
                <Plus size={18}/>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} onClick={() => isEditable && setEditingMember({...member})} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative active:scale-[0.98] transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 ${member.color}`}>
                  {member.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 truncate">{member.name || '新成員'}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase truncate">
                    <Mail size={10} /> {member.note || '無綁定 Email'}
                  </div>
                </div>
                {member.note && <ShieldCheck size={16} className="text-blue-500 opacity-50" />}
                {isEditable && <button onClick={(e) => removeMember(member.id, e)} className="p-3 text-red-400"><Trash2 size={20} /></button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingMember(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-6">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> 設定權限
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">成員姓名</label>
                <input autoFocus placeholder="例如：Yumi" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Email (權限關鍵)</label>
                <input placeholder="必須與登入的 Email 完全一致" value={editingMember.note || ''} onChange={e => setEditingMember({...editingMember, note: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
              </div>
              <p className="text-[9px] text-slate-400 font-medium px-1">
                * 填寫 Email 後，該旅伴登入時將自動切換為「Editor 編輯模式」。
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setEditingMember(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">取消</button>
              <button onClick={handleSaveMember} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">儲存權限</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepView;