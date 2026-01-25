import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, Repeat, Plus, Users, Landmark, X, Check, Calendar, MapPin, Tag, CreditCard, Lock, LockOpen } from 'lucide-react';
import { EXCHANGE_RATE as DEFAULT_RATE } from '../constants';
import { Member, Transaction } from '../types';

interface ExpenseViewProps {
  members: Member[];
}

const CATEGORIES = [
  { label: '美食', icon: '🍜' },
  { label: '交通', icon: '🚃' },
  { label: '購物', icon: '🛍️' },
  { label: '住宿', icon: '🏨' },
  { label: '門票', icon: '🎟️' },
  { label: '其他', icon: '✨' },
];

const ExpenseView: React.FC<ExpenseViewProps> = ({ members }) => {
  // Persistence for Exchange Rate
  const [exchangeRate, setExchangeRate] = useState<string>(() => {
    const saved = localStorage.getItem('tokyo_wbc_exchange_rate');
    return saved !== null ? saved : DEFAULT_RATE.toString();
  });
  const [isRateLocked, setIsRateLocked] = useState<boolean>(() => {
    return localStorage.getItem('tokyo_wbc_rate_locked') === 'true';
  });

  // State for bill splitting currency toggle
  const [splitCurrency, setSplitCurrency] = useState<'JPY' | 'TWD'>('JPY');

  useEffect(() => {
    localStorage.setItem('tokyo_wbc_exchange_rate', exchangeRate);
    localStorage.setItem('tokyo_wbc_rate_locked', isRateLocked.toString());
  }, [exchangeRate, isRateLocked]);

  const [expenses, setExpenses] = useState<Transaction[]>([
    { id: '1', date: '2026-03-05', category: '美食', amount: 3500, twdAmount: 3500 * DEFAULT_RATE, currency: 'JPY', payer: members[0]?.id || '1', location: '一蘭拉麵', splitWith: members.map(m => m.id) },
    { id: '2', date: '2026-03-05', category: '交通', amount: 1500, twdAmount: 1500 * DEFAULT_RATE, currency: 'JPY', payer: members[1]?.id || '2', location: 'Suica 加值', splitWith: members.map(m => m.id) },
    { id: '3', date: '2026-03-06', category: '購物', amount: 12000, twdAmount: 12000 * DEFAULT_RATE, currency: 'JPY', payer: members[0]?.id || '1', location: 'Don Quijote', splitWith: members.map(m => m.id) },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    category: '美食',
    currency: 'JPY',
    amount: 0,
    location: '',
    payer: members[0]?.id || '',
    splitWith: members.map(m => m.id),
  });

  const effectiveRate = useMemo(() => {
    const rate = parseFloat(exchangeRate);
    return isNaN(rate) ? DEFAULT_RATE : rate;
  }, [exchangeRate]);

  const totalJpy = useMemo(() => 
    expenses.reduce((acc, curr) => acc + (curr.currency === 'JPY' ? curr.amount : 0), 0)
  , [expenses]);

  const totalTwdDirect = useMemo(() => 
    expenses.reduce((acc, curr) => acc + (curr.currency === 'TWD' ? curr.amount : 0), 0)
  , [expenses]);

  const totalTwdTotal = (totalJpy * effectiveRate) + totalTwdDirect;

  // Real bill splitting logic based on balances (Paid - Owed)
  const memberBalancesJpy = useMemo(() => {
    const balances: Record<string, number> = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(e => {
      const jpyAmount = e.currency === 'JPY' ? e.amount : e.amount / effectiveRate;
      
      // Add to payer's paid total
      if (balances[e.payer] !== undefined) {
        balances[e.payer] += jpyAmount;
      }

      // Subtract from each split participant's balance
      const participants = e.splitWith || members.map(m => m.id);
      if (participants.length > 0) {
        const share = jpyAmount / participants.length;
        participants.forEach(pId => {
          if (balances[pId] !== undefined) {
            balances[pId] -= share;
          }
        });
      }
    });
    return balances;
  }, [expenses, members, effectiveRate]);

  // For display of "Who paid how much" in JPY
  const memberPaidJpy = useMemo(() => {
    const paid: Record<string, number> = {};
    members.forEach(m => paid[m.id] = 0);
    expenses.forEach(e => {
      const jpyAmount = e.currency === 'JPY' ? e.amount : e.amount / effectiveRate;
      if (paid[e.payer] !== undefined) {
        paid[e.payer] += jpyAmount;
      }
    });
    return paid;
  }, [expenses, members, effectiveRate]);

  const totalEffectiveJpy = totalJpy + (totalTwdDirect / effectiveRate);
  const averageSpendingJpy = members.length > 0 ? totalEffectiveJpy / members.length : 0;

  const getDisplaySplitAmount = (jpyAmount: number) => {
    return splitCurrency === 'JPY' ? jpyAmount : jpyAmount * effectiveRate;
  };

  const currencySymbol = splitCurrency === 'JPY' ? '¥' : '$';

  // Settlement Path Calculation (Based on balances)
  const settlementPaths = useMemo(() => {
    if (members.length < 2) return [];

    let currentBalances = members.map(m => ({
      id: m.id,
      name: m.name,
      balance: memberBalancesJpy[m.id] || 0
    }));

    let creditors = currentBalances.filter(b => b.balance > 0.1).sort((a, b) => b.balance - a.balance);
    let debtors = currentBalances.filter(b => b.balance < -0.1).sort((a, b) => a.balance - b.balance);

    const paths: string[] = [];
    let cIdx = 0;
    let dIdx = 0;

    let tempCreditors = creditors.map(c => ({ ...c }));
    let tempDebtors = debtors.map(d => ({ ...d }));

    while (cIdx < tempCreditors.length && dIdx < tempDebtors.length) {
      const creditor = tempCreditors[cIdx];
      const debtor = tempDebtors[dIdx];
      const amountToPayJpy = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amountToPayJpy > 0.1) {
        const displayAmount = getDisplaySplitAmount(amountToPayJpy);
        paths.push(`${debtor.name} 支付給 ${creditor.name} ${currencySymbol}${Math.round(displayAmount).toLocaleString()}`);
      }

      creditor.balance -= amountToPayJpy;
      debtor.balance += amountToPayJpy;

      if (creditor.balance <= 0.1) cIdx++;
      if (debtor.balance >= -0.1) dIdx++;
    }

    return paths;
  }, [members, memberBalancesJpy, splitCurrency, effectiveRate, currencySymbol]);

  const handleAddExpense = () => {
    if (!formData.amount || !formData.location || !formData.payer) return;

    const amount = Number(formData.amount);
    const twdAmount = formData.currency === 'JPY' ? amount * effectiveRate : amount;

    const newExpense: Transaction = {
      id: Date.now().toString(),
      date: formData.date || new Date().toISOString().split('T')[0],
      category: formData.category || '其他',
      amount: amount,
      twdAmount: Math.round(twdAmount),
      currency: formData.currency as 'JPY' | 'TWD',
      location: formData.location || '未知地點',
      payer: formData.payer || members[0]?.id || '',
      splitWith: formData.splitWith && formData.splitWith.length > 0 ? formData.splitWith : members.map(m => m.id),
    };

    setExpenses([newExpense, ...expenses]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '美食',
      currency: 'JPY',
      amount: 0,
      location: '',
      payer: members[0]?.id || '',
      splitWith: members.map(m => m.id),
    });
  };

  const toggleSplitMember = (memberId: string) => {
    const currentSplit = formData.splitWith || [];
    if (currentSplit.includes(memberId)) {
      setFormData({ ...formData, splitWith: currentSplit.filter(id => id !== memberId) });
    } else {
      setFormData({ ...formData, splitWith: [...currentSplit, memberId] });
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Total Overview Card - Gray + White + Blue */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-200">
          <Landmark size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Wallet size={18} className="text-blue-600" />
              </div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">總支出預估 (TWD)</p>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">匯率</p>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                <input 
                  type="number" 
                  step="0.001"
                  value={exchangeRate}
                  disabled={isRateLocked}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className={`w-12 bg-transparent text-sm font-bold border-none p-0 focus:ring-0 text-right ${isRateLocked ? 'text-slate-500' : 'text-slate-800'}`}
                />
                <button 
                  onClick={() => setIsRateLocked(!isRateLocked)}
                  className={`p-1 rounded-lg transition-all ${isRateLocked ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {isRateLocked ? <Lock size={12} /> : <LockOpen size={12} />}
                </button>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tight">NT$ {Math.round(totalTwdTotal).toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">日幣總計</p>
              <p className="text-lg font-bold text-slate-800">¥ {Math.round(totalJpy).toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">台幣總計</p>
              <p className="text-lg font-bold text-slate-800">$ {Math.round(totalTwdDirect).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Splitting Section */}
      <section>
        <div className="flex flex-col gap-3 mb-3 px-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-600" /></div>
              分帳明細
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setSplitCurrency('JPY')}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${splitCurrency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                JPY
              </button>
              <button 
                onClick={() => setSplitCurrency('TWD')}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${splitCurrency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                TWD
              </button>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 bg-white/50 border border-slate-100 px-3 py-1 rounded-full w-fit">
            平均 {currencySymbol}{Math.round(getDisplaySplitAmount(averageSpendingJpy)).toLocaleString()} / 人 (僅供參考)
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{member.name}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">總支付</div>
              <div className="text-lg font-black text-slate-800">{currencySymbol} {Math.round(getDisplaySplitAmount(memberPaidJpy[member.id] || 0)).toLocaleString()}</div>
            </div>
          ))}
        </div>
        {settlementPaths.length > 0 && (
          <div className="mt-4 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-2">
               <div className="p-1.5 bg-blue-50 rounded-lg">
                 <Repeat size={14} className="text-blue-600" />
               </div>
               結算建議 ({splitCurrency === 'JPY' ? '日幣' : '台幣'}基準)
             </div>
             <div className="space-y-2">
               {settlementPaths.map((path, idx) => (
                 <div key={idx} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                   {path}
                 </div>
               ))}
             </div>
          </div>
        )}
      </section>

      {/* Transactions List */}
      <section>
        <div className="flex justify-between items-center mb-3 px-2">
          <h2 className="text-lg font-bold">帳務明細</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-slate-900 text-white rounded-full active:scale-95 transition-transform"
          >
            <Plus size={18}/>
          </button>
        </div>
        <div className="space-y-3">
          {expenses.map((exp) => {
            const payer = members.find(m => m.id === exp.payer);
            const catInfo = CATEGORIES.find(c => c.label === exp.category) || CATEGORIES[CATEGORIES.length - 1];
            return (
              <div key={exp.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">
                  {catInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate text-slate-800">{exp.location}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{exp.date.split('-').slice(1).join('/')}</span>
                    <div className={`w-1 h-1 rounded-full bg-slate-300`}></div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${payer?.color || 'bg-slate-400'}`}></div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{payer?.name || '未知'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg text-slate-900">
                    {exp.currency === 'JPY' ? '¥' : '$'}{exp.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {exp.currency === 'JPY' ? `≈ NT$ ${Math.round(exp.amount * effectiveRate).toLocaleString()}` : `≈ ¥ ${Math.round(exp.amount / effectiveRate).toLocaleString()}`}
                  </div>
                </div>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-bold">
              尚無支出記錄
            </div>
          )}
        </div>
      </section>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-xl"><Wallet size={20} className="text-slate-600" /></div>
                  新增支出項目
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 hide-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Calendar size={12} /> 日期
                    </label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Tag size={12} /> 分類
                    </label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.label} value={cat.label}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <MapPin size={12} /> 消費地點 / 項目
                  </label>
                  <input 
                    placeholder="例如：一蘭拉麵、藥妝採購"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      幣別
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                      <button 
                        onClick={() => setFormData({...formData, currency: 'JPY'})}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.currency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >
                        JPY
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, currency: 'TWD'})}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.currency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >
                        TWD
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <CreditCard size={12} /> 金額
                    </label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">付款人</label>
                  <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar">
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => setFormData({...formData, payer: member.id})}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${
                          formData.payer === member.id 
                            ? 'bg-white border-black text-black shadow-sm' 
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">分帳成員</label>
                  <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar">
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => toggleSplitMember(member.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${
                          formData.splitWith?.includes(member.id) 
                            ? 'bg-white border-black text-black shadow-sm' 
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">取消</button>
                <button 
                  onClick={handleAddExpense} 
                  disabled={!formData.amount || !formData.location || !formData.payer || (formData.splitWith?.length === 0)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
                >
                  <Check size={18} /> 儲存帳目
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseView;