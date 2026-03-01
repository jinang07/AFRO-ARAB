import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { api } from '../services/api';

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
    'QUOTATION_APPROVED': 'Approved',
    'MOU_SIGN': 'MOU Sign',
    'POST_QUOTATION_FOLLOW_UPS': 'Follow-ups',
    'ORDER_CONFIRMED': 'Confirmed',
    'PROCESSING': 'Processing',
    'SHIPPED': 'Shipped',
    'DELIVERED': 'Delivered',
    'PAYMENT_TERMS': 'Payment Terms',
    'PAYMENT_RECEIVED': 'Payment Received',
    'COMMISSION_RECEIVED': 'Commission Received',
    'ORDER_COMPLETED': 'Order Completed',
    'CANCELLED': 'Cancelled',
    'FOLLOW_UPS': 'Follow-ups',
    'CONFIRMED': 'Confirmed'
};

const CompletedOrders: React.FC<{ user: User }> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = user.role === 'ADMIN';
    const isSupplier = user.role === 'SUPPLIER';
    const isPartner = user.role === 'PARTNER';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await api.get('/orders/');
            // Only keep completed orders
            setOrders(data.filter((o: Order) => o.status === 'ORDER_COMPLETED'));
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e9782]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Order Archive
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Completed Lifecycle History
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            className={`bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'border-[#2e9782] ring-4 ring-[#2e9782]/5' : 'border-slate-100 shadow-sm'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-[#2e9782] uppercase tracking-widest">{order.readableId || `ORD-${order.id}`}</span>
                                    <h3 className="font-bold text-slate-900 text-md mt-1">{order.productName}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                                        Created: {new Date(order.createdAt || order.orderDate).toLocaleDateString()} • Fulfilled
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-[#2e9782] bg-[#2e9782]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">Completed</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Supplier</p>
                                    <p className="text-[11px] font-bold text-slate-900 truncate">
                                        {isSupplier ? 'Me (Secured)' : user.role === 'AGENT' ? 'Verified Supplier' : order.supplierName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Customer Entity</p>
                                    <p className="text-[11px] font-bold text-slate-900 truncate flex items-center gap-1">
                                        {isSupplier || isPartner ? 'Verified Client' : order.buyerName}
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
                                            <div className="text-xs font-black text-[#2e9782]">₹{order.commission || '0.00'}</div>
                                            <div className="text-[8px] text-[#2e9782]/60 font-bold uppercase tracking-widest">Agent Commission</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedOrder?.id === order.id && (
                                <div className="mt-8 pt-8 border-t border-slate-100 animate-in zoom-in-95 duration-300">
                                    <div className="bg-[#2e9782]/10 p-4 rounded-2xl border border-[#2e9782]/20">
                                        <p className="text-xs text-[#2e9782] font-black uppercase tracking-tight text-center">
                                            This order has successfully completed its lifecycle.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-50">
                        <i className="fa-solid fa-box-archive text-4xl mb-4 text-slate-300"></i>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Archive Empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedOrders;
