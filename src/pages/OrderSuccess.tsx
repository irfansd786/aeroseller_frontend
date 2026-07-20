import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ord-unknown';

  return (
    <div className="max-w-full mx-auto px-4 py-20 text-center space-y-6">
      
      {/* Icon with scale bounce animation */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [1.1, 1], opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center text-primary mx-auto shadow-md"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Order Success!</h1>
        <p className="text-xs text-neutral-450">
          Thank you for shopping with AeroCart. Your transaction was processed securely.
        </p>
      </div>

      {/* Order info badge */}
      <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-850 p-4 rounded-2xl font-mono text-xs text-zinc-700 dark:text-zinc-350">
        <span className="block text-[10px] text-neutral-450 uppercase font-sans font-bold">Transaction Reference</span>
        <span className="text-sm font-extrabold text-primary">{orderId}</span>
      </div>

      <p className="text-xs text-neutral-450 leading-relaxed">
        We have received your shipment requests. An invoice details record has been posted to your Profile dashboard.
      </p>

      {/* Navigation options */}
      <div className="flex flex-col gap-3 pt-4">
        <Link
          to="/profile?tab=orders"
          className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-102"
        >
          View Order History <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/"
          className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-neutral-805 dark:text-zinc-200 text-xs font-bold py-3 rounded-full flex items-center justify-center gap-1.5 transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

    </div>
  );
};
