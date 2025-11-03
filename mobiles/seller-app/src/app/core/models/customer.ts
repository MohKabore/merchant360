export type Customer = {
  id: string;

  firstName: string;         // ex: "Mohamed"
  lastName: string;          // ex: "Kabore"

  phone?: string;            // affichage: "+225 01 23 45 67"
  email?: string;
  address?: string;
  tags?: string[];           // ["VIP"], ["Gros"], ["Fidèle"]

  notes?: any;

  // Métriques commerciales
  ordersCount?: number;      // nb de commandes
  totalSpent?: number;       // montant cumulé
  avgBasket?: number;        // panier moyen (totalSpent / ordersCount)
  lastPurchaseAt?: string;   // ISO, si achat fait
  rankPct?: number;          // percentile 0..100 (100 = top)

  balance?: number;          // solde dû (crédit)

  createdAt: string;         // ISO
  updatedAt: string;         // ISO
};