export type Customer = {
  id: string;
  name: string;
  phone?: string;         // +225 07 xx xx xx
  email?: string;
  address?: string;
  tags?: string[];        // VIP, Gros, etc.
  notes?: string;
  balance?: number;       // solde dû (crédit)
  lastPurchaseAt?: string; // ISO
  createdAt: string;      // ISO
  updatedAt: string;      // ISO
};