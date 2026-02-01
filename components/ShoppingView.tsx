import React, { useState, useRef, useMemo } from 'https://esm.sh/react@19.2.3';
import { ShoppingBag, Plus, Trash2, Edit3, MapPin, X, Check, Camera, Image as ImageIcon, CreditCard, AlertCircle, AlertTriangle, Coins, PieChart, Target, User, Info, GripVertical, Lock, LockOpen } from 'https://esm.sh/lucide-react@0.563.0';
import { EXCHANGE_RATE } from '../constants';
import { ShoppingItem, Member } from '../types';

interface ShoppingViewProps {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  members: Member[];
  isEditable: boolean;
  activeCurrencies: string[];
}

const CATEGORIES = [
  { id: '藥妝', label: '藥妝', color: 'bg-blue-100 text-blue-600' },
  { id: '食品', label: '食品', color: 'bg-blue-100 text-blue-600' },
  { id: '服飾', label: '服飾', color: 'bg-blue-100 text-blue-600' },
  { id: '其他', label: '其他', color: 'bg-slate-100 text-slate-600' },
];

const ShoppingView: React.FC<ShoppingViewProps> = ({ items, setItems, members, isEditable, activeCurrencies }) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'stats'>('list');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(members[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('全部');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemToUncheck, setItemToUncheck] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  const [customRate, setCustomRate] = useState<string>('');
  const [isRateLocked, setIsRateLocked] = useState(false);

  const effectiveRate = useMemo(() => {
    const rateNum = parseFloat(customRate);
    return (isRateLocked && !isNaN(rateNum) && rateNum > 0) ? rateNum : EXCHANGE_RATE;
  }, [isRateLocked, customRate]);

  const [formData, setFormData] = useState<Partial<ShoppingItem>>({
    name: '',
    category: '食品',
    location: '',
    quantity: 1,
    note: '',
    jpyPrice: 0,
    twdPrice: 0,
    actualJpy: 0,
    actualTwd: 0,
    actualCurrency: activeCurrencies[0],
    image: '',
    checked: false,
    memberId: members[0]?.id
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const memberFilteredItems = activeMemberId 
      ? items.filter(i => i.memberId === activeMemberId)
      : items;
      
    const checkedItems = memberFilteredItems.filter(i => i.checked);
    
    const totalJpy = checkedItems.reduce((acc, i) => {
      const baseJpy = i.actualJpy || i.jpyPrice || 0;
      return acc + (baseJpy * i.quantity);
    }, 0);
    
    const totalActualTwd = checkedItems.reduce((acc, i) => {
      const itemActualTwd = i.actualTwd || (i.actualJpy ? i.actualJpy * effectiveRate : (i.jpyPrice * effectiveRate));
      return acc + (itemActualTwd * i.quantity);
    }, 0);
    
    const originalTwdBudget = checkedItems.reduce((acc, i) => {
      const baseTwd = i.twdPrice || (i.jpyPrice * effectiveRate);
      return acc + (baseTwd * i.quantity);
    }, 0);
    
    const savings = originalTwdBudget - totalActualTwd;
    const completionRate = memberFilteredItems.length > 0 ? (checkedItems.length / memberFilteredItems.length) * 100 : 0;
    
    return {
      totalJpy,
      totalTwd: Math.round(totalActualTwd),
      savings: Math.round(savings),
      completionRate,
      checkedCount: checkedItems.length,
      totalCount: memberFilteredItems.length
    };
  }, [items, activeMemberId, effectiveRate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (item?.checked) {
      setItemToUncheck(id);
    } else {
      setItems(prev => {
        const itemIndex = prev.findIndex(i => i.id === id);
        if (itemIndex === -1) return prev;
        
        const updatedItem = { ...prev[itemIndex], checked: true };
        const others = prev.filter(i => i.id !== id);
        const unchecked = others.filter(i => !i.checked);
        const checked = others.filter(i => i.checked);
        return [...unchecked, updatedItem, ...checked];
      });
    }
  };

  const confirmUncheck = () => {
    if (itemToUncheck) {
      setItems(prev => {
        const itemIndex = prev.findIndex(i => i.id === itemToUncheck);
        if (itemIndex === -1) return prev;
        
        const updatedItem = { ...prev[itemIndex], checked: false };
        const others = prev.filter(i => i.id !== itemToUncheck);
        const unchecked = others.filter(i => !i.checked);
        const checked = others.filter(i => i.checked);
        return [updatedItem, ...unchecked, ...checked];
      });
      setItemToUncheck(null);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(prev => prev.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: activeFilter !== '全部' ? activeFilter : '食品',
      location: '',
      quantity: 1,
      note: '',
      jpyPrice: 0,
      twdPrice: 0,
      actualJpy: 0,
      actualTwd: 0,
      actualCurrency: activeCurrencies[0],
      image: '',
      checked: false,
      memberId: activeMemberId || members[0]?.id
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ShoppingItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    const jpy = Number(formData.jpyPrice) || 0;
    const twd = Number(formData.twdPrice) || (jpy * effectiveRate);
    const actJpy = Number(formData.actualJpy) || 0;
    const actTwd = Number(formData.actualTwd) || 0;

    const itemData = {
      ...formData,
      quantity: Number(formData.quantity) || 1,
      jpyPrice: jpy,
      twdPrice: Math.round(twd),
      actualJpy: actJpy,
      actualTwd: Math.round(actTwd),
      actualCurrency: formData.actualCurrency
    } as ShoppingItem;

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i));
    } else {
      setItems(prev => [{ ...itemData, id: Date.now().toString() }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const getCount = (catId: string) => {
    const memberFiltered = activeMemberId 
      ? items.filter(i => i.memberId === activeMemberId)
      : items;
    if (catId === '全部') return memberFiltered.length;
    return memberFiltered.filter(i => i.category === catId).length;
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesMember = !activeMemberId || i.memberId === activeMemberId;
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (i.location && i.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = activeFilter === '全部' || i.category === activeFilter;
      return matchesMember && matchesSearch && matchesFilter;
    });
  }, [items, activeMemberId, searchTerm, activeFilter]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Use setTimeout to delay setting the ID. This ensures the browser captures
    // the opaque element for the drag ghost before the dimming style is applied.
    setTimeout(() => setDraggedItemId(id), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!isEditMode || !draggedItemId || draggedItemId === targetId) return;

    setItems(prev => {
      const newList = [...prev];
      const draggedIndex = newList.findIndex(i => i.id === draggedItemId);
      const targetIndex = newList.findIndex(i => i.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);
      return newList;
    });
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <>
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="pb-20 pt-0">
        <div className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md -mx-4 px-4 py-2.5 border-b border-slate-200 shadow-sm">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setActiveSubTab('list')} 
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all active:scale-[0.98] ${activeSubTab === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <ShoppingBag size={16} className={activeSubTab === 'list' ? 'text-blue-600' : 'text-slate-400'} />
                <span className={`text-xs font-bold`}>購物清單</span>
              </button>
              <button 
                onClick={() => setActiveSubTab('stats')} 
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all active:scale-[0.98] ${activeSubTab === 'stats' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <PieChart size={16} className={activeSubTab === 'stats' ? 'text-blue-600' : 'text-slate-400'} />
                <span className={`text-xs font-bold`}>花費統計</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar py-1">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setActiveMemberId(member.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all shrink-0 ${
                      activeMemberId === member.id 
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100' 
                      : 'bg-white/50 text-slate-500'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${member.color} ${activeMemberId === member.id ? 'ring-2 ring-blue-50' : 'opacity-60'}`}></div>
                    {member.name}
                  </button>
                ))}
              </div>
              
              {activeSubTab === 'list' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditMode && (
                    <button 
                      onClick={handleOpenAddModal}
                      className="p-1.5 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100 active:scale-90 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  )}

                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 border ${
                      isEditMode 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {isEditMode ? <Check size={14} /> : <Edit3 size={14} />}
                    <span>{isEditMode ? '完成' : '編輯'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {activeSubTab === 'list' ? (
            <>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
                <button
                  onClick={() => setActiveFilter('全部')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                    activeFilter === '全部' 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-400 shadow-sm'
                  }`}
                >
                  全部 <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeFilter === '全部' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{getCount('全部')}</span>
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                      activeFilter === cat.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-400 shadow-sm'
                    }`}
                  >
                    {cat.label} <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{getCount(cat.id)}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const catInfo = CATEGORIES.find(c => c.id === item.category);
                  const displayTwd = item.twdPrice;
                  const hasActual = item.actualJpy || item.actualTwd;

                  return (
                    <div 
                      key={item.id}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                      onDragEnd={handleDragEnd}
                      className={`group relative bg-white rounded-[2rem] overflow-hidden shadow-sm border transition-all flex flex-col ${isEditMode ? 'border-blue-400 ring-2 ring-blue-50 cursor-grab active:cursor-grabbing' : 'border-slate-100 active:scale-[0.98]'} ${draggedItemId === item.id ? 'opacity-40 grayscale scale-95 border-dashed border-blue-300' : ''}`}
                    >
                      <div className="relative aspect-square bg-slate-50 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                            <ImageIcon size={48} strokeWidth={1} />
                            <span className="text-[10px] font-bold uppercase mt-2">No Image</span>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 z-10">
                          <span className="text-[8px] font-black px-2 py-1 rounded-lg shadow-sm border border-white/20 bg-blue-50/80 text-blue-600 backdrop-blur-md uppercase">
                            {catInfo?.label || item.category}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => toggleItem(item.id, e)}
                          className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                        >
                          {item.checked ? <Check size={18} className="text-blue-500" strokeWidth={3} /> : <div className="w-4 h-4 rounded border-2 border-slate-200"></div>}
                        </button>

                        {item.checked && (
                          <div className="absolute inset-0 z-5 bg-blue-600/5 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                            <div className="border-[3px] border-blue-500/80 rounded-2xl px-4 py-1.5 rotate-[-12deg] bg-white/95 shadow-xl">
                               <span className="text-blue-600 font-black text-xl italic tracking-widest uppercase">已購入</span>
                            </div>
                          </div>
                        )}

                        {item.quantity > 1 && (
                          <div className="absolute bottom-2 right-2 z-10 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                            x{item.quantity}
                          </div>
                        )}

                        {isEditMode && (
                          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-100 text-slate-300 shadow-sm">
                            <GripVertical size={14} />
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-black text-slate-800 leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
                          {item.name}
                        </h3>

                        <div className="space-y-1.5 mb-3 flex-1">
                          {item.location && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                              <MapPin size={10} className="text-blue-400" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          )}
                          
                          {item.note && (
                            <div className="py-2 px-2.5 bg-blue-50/30 rounded-xl text-[10px] text-blue-700 flex gap-2 border border-blue-100/20">
                              <Info size={12} className="shrink-0 mt-0.5 text-blue-400" />
                              <span className="font-medium line-clamp-2 leading-tight">{item.note}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-50 mt-auto">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-[10px] font-black text-slate-800">¥</span>
                                <span className="text-lg font-black text-slate-800 tracking-tight">
                                  {item.jpyPrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-black text-slate-500">
                                  ${Math.round(displayTwd).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {item.checked && (
                              <button 
                                onClick={(e) => handleEditItem(item, e)}
                                className="mt-2 p-2 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-100 flex items-center justify-between gap-2 transition-colors active:scale-[0.98]"
                              >
                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest shrink-0">實付</span>
                                <div className="flex items-center justify-between bg-white/80 rounded-lg border border-blue-100 px-2 py-1 flex-1 min-w-0 shadow-inner overflow-hidden min-h-[24px]">
                                  {hasActual ? (
                                    <>
                                      <span className={`text-[10px] font-black whitespace-nowrap ${item.actualCurrency === 'JPY' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        ¥{item.actualJpy?.toLocaleString()}
                                      </span>
                                      <span className={`text-[10px] font-black whitespace-nowrap ${item.actualCurrency === 'TWD' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        ${item.actualTwd?.toLocaleString()}
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditMode && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <button 
                              onClick={(e) => handleEditItem(item, e)}
                              className="flex items-center justify-center gap-1 py-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 size={12} /> <span className="text-[10px] font-bold">編輯</span>
                            </button>
                            <button 
                              onClick={(e) => deleteItem(item.id, e)}
                              className="flex items-center justify-center gap-1 py-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={12} /> <span className="text-[10px] font-bold">刪除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-200">
                  <Coins size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <ShoppingBag size={18} className="text-blue-600" />
                      </div>
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">
                        {activeMemberId ? `${members.find(m => m.id === activeMemberId)?.name} 的` : '全體'}購物支出 (TWD)
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100">
                        <input 
                          type="number" 
                          step="0.001"
                          value={customRate}
                          disabled={isRateLocked}
                          onChange={(e) => setCustomRate(e.target.value)}
                          className={`w-12 bg-transparent text-[10px] font-bold border-none p-0 focus:ring-0 text-right ${isRateLocked ? 'text-slate-400' : 'text-slate-800'}`}
                          placeholder={EXCHANGE_RATE.toString()}
                        />
                        <button onClick={() => setIsRateLocked(!isRateLocked)} className={`p-1 rounded-lg transition-all ${isRateLocked ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isRateLocked ? <Lock size={10} /> : <LockOpen size={10} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">NT$ {stats.totalTwd.toLocaleString()}</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">日幣合計</p>
                      <p className="text-lg font-bold text-slate-800">¥ {stats.totalJpy.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <p className="text-[10px] text-emerald-600/60 font-bold mb-1 uppercase tracking-tight">預算節省</p>
                      <p className="text-lg font-bold text-emerald-600">NT$ {stats.savings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Target size={20} /></div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">採購完成率</h3>
                  </div>
                  <span className="text-xl font-black text-blue-600">{Math.round(stats.completionRate)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${stats.completionRate}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>已購 {stats.checkedCount} / {stats.totalCount} 件</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><PieChart size={18} /></div>
                  <span className="text-sm uppercase tracking-tight">分類支出佔比</span>
                </h3>
                <div className="space-y-4">
                  {CATEGORIES.map(cat => {
                    const memberFiltered = activeMemberId ? items.filter(i => i.memberId === activeMemberId) : items;
                    const catItems = memberFiltered.filter(i => i.category === cat.id && i.checked);
                    const catTotal = catItems.reduce((acc, i) => {
                      const itemTwd = i.actualTwd || (i.actualJpy ? i.actualJpy * effectiveRate : i.jpyPrice * effectiveRate);
                      return acc + (itemTwd * i.quantity);
                    }, 0);
                    const count = catItems.reduce((acc, i) => acc + i.quantity, 0);
                    if (count === 0) return null;
                    return (
                      <div key={cat.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-blue-500`}></div>
                          <div>
                            <span className="text-[11px] font-black text-slate-800 block leading-none mb-1">{cat.label}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{count} 件商品</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700">NT$ {Math.round(catTotal).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {itemToUncheck && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setItemToUncheck(null)}></div>
            <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-200">
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">確認取消購入？</h3>
              <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">「{items.find(i => i.id === itemToUncheck)?.name}」將變回未購買狀態。</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmUncheck} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all">確認取消</button>
                <button onClick={() => setItemToUncheck(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all">返回</button>
              </div>
            </div>
          </div>
        )}

        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setItemToDelete(null)}></div>
            <div className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-200">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">確定要刪除嗎？</h3>
              <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">「{items.find(i => i.id === itemToDelete)?.name}」刪除後將無法復原。</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all">確定刪除</button>
                <button onClick={() => setItemToDelete(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all">取消</button>
              </div>
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
                    <div className="p-2 bg-blue-50 rounded-xl"><ShoppingBag size={20} /></div>
                    {editingItem ? '編輯採購項目' : '新增必買項目'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 hide-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">商品照片</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden">
                      {formData.image ? (
                        <><img src={formData.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white" size={32} /></div></>
                      ) : (
                        <><Camera className="text-slate-200 mb-2" size={32} /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">點擊上傳商品參考圖</span></>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">商品名稱</label>
                    <input placeholder="輸入商品名稱" value={formData.name} onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><User size={12} /> 所屬成員</label>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                      {members.map(member => (
                        <button key={member.id} type="button" onClick={() => setFormData(prev => ({...prev, memberId: member.id}))} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 ${formData.memberId === member.id ? 'bg-white border-slate-900 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${member.color}`}></div>
                          <span className="text-[11px] font-bold">{member.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">分類</label>
                      <select value={formData.category} onChange={e => setFormData(prev => ({...prev, category: e.target.value}))} className="w-full bg-slate-50 border-none rounded-2xl px-3 py-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-600 appearance-none">
                        {CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">地點</label>
                      <input placeholder="購買地" value={formData.location} onChange={e => setFormData(prev => ({...prev, location: e.target.value}))} className="w-full bg-slate-50 border-none rounded-2xl px-3 py-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">數量</label>
                      <input type="number" placeholder="1" value={formData.quantity || ''} onChange={e => setFormData(prev => ({...prev, quantity: Number(e.target.value)}))} className="w-full bg-slate-50 border-none rounded-2xl px-3 py-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">預計售價 (JPY ¥)</label>
                      <input type="number" placeholder="0" value={formData.jpyPrice || ''} onChange={e => setFormData(prev => ({...prev, jpyPrice: Number(e.target.value)}))} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">預計售價 (TWD NT$)</label>
                      <input type="number" placeholder="0" value={formData.twdPrice || ''} onChange={e => setFormData(prev => ({...prev, twdPrice: Number(e.target.value)}))} className="w-full bg-slate-100/50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600" />
                    </div>
                  </div>
                  {(editingItem?.checked || formData.checked) && (
                    <div className="bg-blue-50/50 p-5 rounded-[2rem] border-2 border-blue-100/50 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">實付記錄 (選填啟用同步)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[9px] font-bold uppercase ml-1 ${formData.actualCurrency === 'JPY' ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                            實際日幣 (¥)
                          </label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={formData.actualJpy || ''} 
                            onChange={e => {
                              const val = Number(e.target.value);
                              setFormData(prev => ({
                                ...prev, 
                                actualJpy: val, 
                                actualTwd: val > 0 ? Math.round(val * effectiveRate) : 0,
                                actualCurrency: 'JPY'
                              }));
                            }} 
                            className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 ${formData.actualCurrency === 'JPY' ? 'border-blue-300 ring-2 ring-blue-50' : 'border-blue-100'}`} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[9px] font-bold uppercase ml-1 ${formData.actualCurrency === 'TWD' ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                            實際台幣 (NT$)
                          </label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={formData.actualTwd || ''} 
                            onChange={e => {
                              const val = Number(e.target.value);
                              setFormData(prev => ({
                                ...prev, 
                                actualTwd: val, 
                                actualJpy: val > 0 ? Math.round(val / effectiveRate) : 0,
                                actualCurrency: 'TWD'
                              }));
                            }} 
                            className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 ${formData.actualCurrency === 'TWD' ? 'border-blue-300 ring-2 ring-blue-50' : 'border-blue-100'}`} 
                          />
                        </div>
                      </div>
                      
                      {activeCurrencies.length > 2 && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                           {activeCurrencies.filter(c => c !== 'JPY' && c !== 'TWD').map(c => (
                             <button
                               key={c}
                               type="button"
                               onClick={() => setFormData(prev => ({ ...prev, actualCurrency: c }))}
                               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.actualCurrency === c ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                             >
                               使用 {c}
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">備註</label>
                    <textarea placeholder="填寫細節、尺寸或備註..." value={formData.note} onChange={e => setFormData(prev => ({...prev, note: e.target.value}))} className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 resize-none" />
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                  <button onClick={handleSave} disabled={!formData.name} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Check size={18} /> {editingItem ? '儲存修改' : '加入清單'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShoppingView;