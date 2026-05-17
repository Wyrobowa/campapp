export type GearCategory =
  | 'shelter'
  | 'sleeping'
  | 'cooking'
  | 'clothing'
  | 'tools'
  | 'first-aid'
  | 'other';

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
  packed: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  items: Omit<GearItem, 'packed'>[];
  isDefault: boolean;
}

export interface Trip {
  id: string;
  name: string;
  date: string;
  templateId?: string;
  items: GearItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
