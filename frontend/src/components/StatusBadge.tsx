  const StatusBadge = ({ status } : {
    status: string
  }) => {
    const styles: { [key: string]: string } = {
      Paid: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      Overdue: 'bg-rose-100 text-rose-700',
      Confirmed: 'bg-blue-100 text-blue-700',
      Processing: 'bg-indigo-100 text-indigo-700',
      Shipped: 'bg-violet-100 text-violet-700',
      Delivered: 'bg-emerald-100 text-emerald-700',
      'In Transit': 'bg-sky-100 text-sky-700',
      Active: 'bg-emerald-100 text-emerald-700',
      Expired: 'bg-slate-100 text-slate-700',
      Invoice: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      Payment: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      'Credit Note': 'bg-rose-50 text-rose-600 border border-rose-100',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };
export default StatusBadge;
