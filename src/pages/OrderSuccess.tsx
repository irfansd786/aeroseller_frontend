import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, PackageCheck, Download, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 3);
  const formattedDate = estDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleDownloadInvoice = () => {
    const invoiceContent = `AeroSeller Tax Invoice\nOrder ID: ${orderId}\nDate: ${new Date().toLocaleDateString()}\nStatus: Paid & Confirmed\nThank you for shopping with AeroSeller!`;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [1.15, 1], opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 120 }}
        className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-lg shadow-emerald-600/20"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white">Order Confirmed!</h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Thank you for shopping with <strong>AeroSeller</strong>. Your order has been placed and is being packed.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-850 pb-3">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Order ID</span>
            <p className="text-sm font-black text-emerald-600">{orderId}</p>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1 text-xs font-bold text-neutral-700 dark:text-zinc-300 hover:text-emerald-600 bg-neutral-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Invoice
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-zinc-400">
          <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block">Estimated Delivery</span>
            <span>{formattedDate} (Standard Express)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to="/profile?tab=orders"
          className="flex-1 aero-btn-primary text-xs flex items-center justify-center gap-2 py-3.5"
        >
          <PackageCheck className="w-4 h-4" /> Track Order
        </Link>
        <Link
          to="/"
          className="flex-1 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-800 dark:text-zinc-200 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

    </div>
  );
};
