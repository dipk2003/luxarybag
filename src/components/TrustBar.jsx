import React from 'react';
import { Truck, Shield, RotateCcw, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/contexts/ModeContext';

const TrustBar = () => {
  const { settings } = useStore();
  const iconSet = [Truck, CreditCard, CheckCircle, RotateCcw, Shield];
  const features = settings.trustBarItems?.length
    ? settings.trustBarItems.map((text, index) => ({
        icon: iconSet[index % iconSet.length],
        text,
      }))
    : [
        { icon: Truck, text: 'Free Delivery' },
        { icon: CreditCard, text: 'COD Available' },
        { icon: CheckCircle, text: '100% Quality' },
        { icon: RotateCcw, text: 'Easy Returns' },
        { icon: Shield, text: 'Secure Payment' },
      ];

  return (
    <div className="bg-yellow-600 py-2.5 overflow-hidden border-b border-yellow-700">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center justify-between text-white text-sm font-medium">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <feature.icon className="w-4 h-4 text-yellow-200" />
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden relative flex overflow-x-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap py-1"
            animate={{ x: [0, -500] }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: 'linear',
            }}
          >
            {[...features, ...features, ...features].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-white text-xs font-medium">
                <feature.icon className="w-3.5 h-3.5 text-yellow-200" />
                <span>{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
