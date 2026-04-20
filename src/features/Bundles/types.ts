export interface BundleItem {
  id?: string;
  name: string;
  price: number;
  currency: string;
  category?: string;
}

export interface Bundle {
  id: string;
  name: string;
  items: BundleItem[];
  totalPrice: number;
  recurring?: boolean;
  recurringDays?: string[];
  theme?: 'light' | 'purple';
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BundleCardProps {
  bundle: Bundle;
  onEdit: (bundle: Bundle) => void;
  onDelete: (id: string) => void;
}
