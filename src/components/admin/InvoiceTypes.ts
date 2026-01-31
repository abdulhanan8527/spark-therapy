// Invoice Types

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'pending-review' | 'rejected';

export type PaymentMethod = 'online' | 'manual' | 'bank-transfer';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptUrl?: string;
  paymentDate?: string;
  transactionId?: string;
  reviewNotes?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxRate: number; // Percentage
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  status: InvoiceStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}