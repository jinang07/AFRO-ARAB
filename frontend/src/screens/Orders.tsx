import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const FULL_LIFECYCLE: OrderStatus[] = [
  'QUOTATION_SENT',
  'QUOTATION_APPROVED',
  'MOU_SIGN',
  'POST_QUOTATION_FOLLOW_UPS',
  'ORDER_CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'PAYMENT_TERMS',
  'PAYMENT_RECEIVED',
  'COMMISSION_RECEIVED',
  'ORDER_COMPLETED'
];

const STAGE_LABELS: Record<OrderStatus, string> = {
  'QUOTATION_SENT': 'Quotation Sent',
  'QUOTATION_APPROVED': 'Quotation Approved',
  'MOU_SIGN': 'MOU Sign',
  'POST_QUOTATION_FOLLOW_UPS': 'Post Quotation Follow ups',
  'ORDER_CONFIRMED': 'Order Confirmed',
  'PROCESSING': 'Processing',
  'SHIPPED': 'Shipped',
  'DELIVERED': 'Delivered',
  'PAYMENT_TERMS': 'Payment Terms',
  'PAYMENT_RECEIVED': 'Payment Received',
  'COMMISSION_RECEIVED': 'Commission Received',
  'ORDER_COMPLETED': 'Order Completed',
  'CANCELLED': 'Cancelled',
  'FOLLOW_UPS': 'Follow up',
  'CONFIRMED': 'Confirmed'
};

const Orders: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; orderId: string | null }>({
    isOpen: false,
    orderId: null
  });

  // Data for selects
  const [agents, setAgents] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    amount: '',
    commission: '',
    supplier: '',
    buyer: '',
    status: 'QUOTATION_SENT' as OrderStatus,
    expectedDeliveryDate: '',
    assignedAgent: ''
  });

  const isAdmin = user.role === 'ADMIN';
  const isAgent = user.role === 'AGENT';
  const isSupplier = user.role === 'SUPPLIER';
  const isPartner = user.role === 'PARTNER';

  useEffect(() => {
    fetchOrders();
    if (isAdmin || isAgent || isPartner) {
      fetchSuppliers();
      fetchBuyers();
    }
    if (isAdmin) {
      fetchAgents();
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders/');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await api.get('/users/');
      setAgents(data.filter((u: any) => u.role === 'AGENT'));
    } catch (err) { }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await api.get('/suppliers/');
      setSuppliers(data);
    } catch (err) { }
  };

  const fetchBuyers = async () => {
    try {
      const data = await api.get('/buyers/');
      setBuyers(data);
    } catch (err) { }
  };

  const getVisibleStages = () => {
    if (isAdmin) return FULL_LIFECYCLE;
    return FULL_LIFECYCLE.filter(s => s !== 'COMMISSION_RECEIVED');
  };

  const openAddModal = () => {
    if (!isAdmin && !isAgent) return;
    setEditingOrder(null);
    setFormData({
      productName: '',
      quantity: '',
      amount: '',
      commission: '',
      supplier: '',
      buyer: '',
      status: 'QUOTATION_SENT',
      expectedDeliveryDate: '',
      assignedAgent: isAgent ? String(user.id) : ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (!isAdmin && !isAgent) return;
    setEditingOrder(order);
    setFormData({
      productName: order.productName,
      quantity: order.quantity,
      amount: order.amount,
      commission: order.commission || '0',
      supplier: String(order.supplier),
      buyer: String(order.buyer),
      status: order.status,
      expectedDeliveryDate: order.expectedDeliveryDate || '',
      assignedAgent: order.assignedAgent ? String(order.assignedAgent) : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/orders/${id}/`);
      fetchOrders();
      if (selectedOrder?.id === id) setSelectedOrder(null);
      setDeleteConfirmation({ isOpen: false, orderId: null });
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        productName: formData.productName,
        quantity: formData.quantity,
        amount: formData.amount,
        commission: formData.commission || '0.00',
        supplier: formData.supplier,
        buyer: formData.buyer,
        status: formData.status,
      };

      if (formData.expectedDeliveryDate) payload.expectedDeliveryDate = formData.expectedDeliveryDate;
      if (formData.assignedAgent) payload.assignedAgent = formData.assignedAgent;

      if (!editingOrder) {
        payload.createdBy = user.id;
      }

      if (editingOrder) {
        await api.put(`/orders/${editingOrder.id}/`, payload);
      } else {
        await api.post('/orders/', payload);
      }
      fetchOrders();
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save order. Make sure you set the expected delivery date correctly (YYYY-MM-DD).');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224194]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {isSupplier ? 'Contract Archive' : 'Order Hub'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {isAgent ? `Account Managed by ${user.username}` : isSupplier ? `Supplier Entity: ${user.username}` : 'Global Fulfillment Lifecycle'}
          </p>
        </div>
        {(isAdmin || isAgent) && (
          <button
            onClick={openAddModal}
            className="bg-[#224194] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-[#224194]/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-plus"></i> Initiate Flow
          </button>
        )}
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map(order => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              className={`bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'border-[#224194] ring-4 ring-[#224194]/5' : 'border-slate-100 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black text-[#224194] uppercase tracking-widest">{order.readableId || `ORD-${order.id}`}</span>
                  <h3 className="font-bold text-slate-900 text-md mt-1">{order.productName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                    Created: {new Date(order.createdAt || order.orderDate).toLocaleDateString()} • Expected: {order.expectedDeliveryDate || 'UNSET'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(isAdmin || isAgent) && (
                    <div className="flex gap-2">
                      <span className="text-[8px] font-black text-[#224194] bg-[#224194]/10 px-2 py-1 rounded uppercase tracking-tighter self-center mr-2">
                        {order.agentName || 'No Agent'}
                      </span>
                      <button onClick={(e) => openEditModal(e, order)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-[#224194] flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-pen-nib text-xs"></i>
                      </button>
                      {isAdmin && (
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ isOpen: true, orderId: order.id }); }} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      )}
                    </div>
                  )}
                  {isAgent && (
                    <span className="text-[9px] font-black text-[#2e9782] bg-[#2e9782]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">Active Duty</span>
                  )}
                  {isSupplier && (
                    <span className="text-[9px] font-black text-[#224194] bg-[#224194]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">Master Agreement</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Supplier</p>
                  <p className="text-[11px] font-bold text-slate-900 truncate">{isSupplier ? 'Me (Secured)' : order.supplierName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Customer Entity</p>
                  <p className="text-[11px] font-bold text-slate-900 truncate flex items-center gap-1">
                    {isSupplier ? (
                      <>
                        <i className="fa-solid fa-user-shield text-[9px] text-[#224194]"></i>
                        Verified Client
                      </>
                    ) : order.buyerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">₹{order.amount}</div>
                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Settlement Value</div>
                  </div>
                  {isAdmin && (
                    <div className="text-right border-l border-slate-200 pl-3">
                      <div className="text-xs font-black text-[#224194]">₹{order.commission || '0.00'}</div>
                      <div className="text-[8px] text-[#224194]/60 font-bold uppercase tracking-widest">Platform Fee</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-[#2e9782]/20 text-[#2e9782]' : 'bg-[#224194]/20 text-[#224194] animate-pulse'
                    }`}>
                    {STAGE_LABELS[order.status] || order.status}
                  </div>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-in zoom-in-95 duration-300">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-timeline"></i>
                    Fulfillment Lifecycle Status
                  </h4>
                  <div className="space-y-4 relative ml-2">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                    {getVisibleStages().map((s, idx) => {
                      const isDone = FULL_LIFECYCLE.indexOf(order.status) >= FULL_LIFECYCLE.indexOf(s);
                      const isCurrent = order.status === s;
                      return (
                        <div key={s} className="flex items-center gap-5 relative z-10">
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-500 ${isDone ? 'bg-[#224194] scale-110' : 'bg-slate-200'}`}></div>
                          <div className={`flex-1 transition-all ${isCurrent ? 'bg-[#224194]/5 p-2 rounded-xl border border-[#224194]/10' : ''}`}>
                            <span className={`text-[10px] block ${isCurrent ? 'font-black text-[#224194] uppercase tracking-tight' : 'font-medium text-slate-400'}`}>
                              {STAGE_LABELS[s]}
                            </span>
                            {isCurrent && <span className="text-[8px] text-[#224194]/60 font-bold uppercase tracking-widest">Active Terminal State</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <button className="py-4 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all">Download Manifest</button>
                    <button className="py-4 bg-[#f49022]/10 text-[#f49022] rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border border-[#f49022]/20 active:scale-95 transition-all">Support Desk</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-50">
            <i className="fa-solid fa-file-invoice text-4xl mb-4 text-slate-300"></i>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Pipeline Clear</p>
          </div>
        )}
      </div>

      {isModalOpen && (isAdmin || isAgent) && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {editingOrder ? 'Update Pipeline' : 'Initiate Supply'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Order Gateway</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
                {isAdmin && (
                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-black text-[#224194] uppercase tracking-widest block mb-1.5 ml-1">Supervisor Agent</label>
                    <select
                      className="w-full bg-[#224194]/5 border border-[#224194]/10 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#224194] outline-none appearance-none"
                      value={formData.assignedAgent}
                      onChange={e => setFormData({ ...formData, assignedAgent: e.target.value })}
                    >
                      <option value="">Select Responsible Agent</option>
                      {agents.map((a: any) => <option key={a.id} value={a.id}>{a.username}</option>)}
                    </select>
                  </div>
                )}

                {editingOrder && (
                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-black text-[#2e9782] uppercase tracking-widest block mb-1.5 ml-1">Order Status</label>
                    <select
                      required
                      className="w-full bg-[#2e9782]/5 border border-[#2e9782]/10 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                    >
                      {FULL_LIFECYCLE.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Product</label>
                    <input
                      required
                      value={formData.productName}
                      onChange={e => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Volume/Quantity</label>
                    <input
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#f49022] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Contract Total (₹)</label>
                    <input required value={formData.amount} type="number" step="0.01" onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#2e9782] uppercase tracking-widest block mb-1.5 ml-1">Platform Margin (₹)</label>
                    <input required={isAdmin} value={formData.commission} type="number" step="0.01" onChange={e => setFormData({ ...formData, commission: e.target.value })} className="w-full bg-[#2e9782]/5 border border-[#2e9782]/10 rounded-[1.25rem] px-4 py-4 text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Supplier Entity</label>
                    <select
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#224194] outline-none appearance-none"
                      value={formData.supplier}
                      onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Customer / Buyer</label>
                    <select
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#224194] outline-none appearance-none"
                      value={formData.buyer}
                      onChange={e => setFormData({ ...formData, buyer: e.target.value })}
                    >
                      <option value="">Select Customer</option>
                      {buyers.map(b => <option key={b.id} value={b.id}>{b.companyName}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Expected Delivery Date</label>
                  <input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({ ...formData, expectedDeliveryDate: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold outline-none" />
                </div>

                <button type="submit" className="w-full py-5 bg-[#224194] text-white rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#224194]/20 active:scale-95 transition-all mt-6">
                  {editingOrder ? 'Update Master Flow' : 'Authorize Supply Initialization'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Order"
        message="Are you sure you want to permanently remove this order? This action cannot be undone."
        confirmLabel="Delete Order"
        onConfirm={() => deleteConfirmation.orderId && handleDelete(deleteConfirmation.orderId)}
        onCancel={() => setDeleteConfirmation({ isOpen: false, orderId: null })}
      />
    </div>
  );
};

export default Orders;
