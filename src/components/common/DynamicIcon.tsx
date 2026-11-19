import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  HeartHandshake,
  Package,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Landmark,
  Wallet,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Plane,
  Home,
  Heart,
  HelpCircle,
  CircleDot,
  ArrowLeftRight,
  Coffee,
  Film,
  Building,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  HeartHandshake,
  Package,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Landmark,
  Wallet,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Plane,
  Home,
  Heart,
  Coffee,
  Film,
  Building,
  ArrowLeftRight,
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const IconComponent = ICON_MAP[name] || CircleDot;
  return <IconComponent className={className} size={size} />;
};
