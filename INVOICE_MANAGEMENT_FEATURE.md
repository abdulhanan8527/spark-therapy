# Invoice Management Feature Documentation

## Overview
The Invoice Management feature enables administrators to create, manage, and send customized invoices to clients (parents) for therapy services. Parents can view their invoices, make payments through secure online gateways, or upload bank transfer receipts for administrator review.

## Features

### Admin Side (Web Dashboard)

#### 1. Invoice Creation & Management
- Dedicated "Invoice Management" section in the admin dashboard
- Create new invoices with:
  - Client selection (auto-populated from client profiles)
  - Invoice date (defaults to current date)
  - Due date (selectable via date picker)
  - Dynamic service/items table with auto-calculations
  - Discount options (percentage or fixed amount)
  - Tax configuration
  - Notes/Additional description field
- Preview invoices before saving
- Generate professional PDF invoices
- Send invoices via email/SMS with payment links

#### 2. Invoice Listing
- View all invoices per client
- Columns: Invoice ID, Date, Amount, Status, Actions
- Status indicators: Draft, Sent, Paid, Overdue, Pending Review, Rejected
- Actions: View, Edit, Send Reminder, Delete
- Bulk actions for sending reminders to overdue invoices

#### 3. Payment Review
- Separate section for reviewing manual payments
- View uploaded bank transfer receipts
- Approve or reject payments with reason comments
- Automatic notifications to parents on approval/rejection

### Parent Side (Mobile App)

#### 1. Invoice Viewing
- Dedicated "Invoices & Payments" section in parent dashboard
- List all invoices for their child
- View invoice details and PDF previews
- Status indicators for each invoice

#### 2. Payment Options
- One-click online payments via secure payment gateways (Payfast/Stripe)
- Manual bank transfer option with receipt upload
- Upload form supports JPG/PNG/PDF files
- Real-time status updates via push notifications

## Technical Implementation

### Data Models

#### Invoice
- ID, Client ID, Client Name
- Invoice Date, Due Date
- Items (description, quantity, unit price, subtotal)
- Discount (type and value)
- Tax rate and amounts
- Total amount
- Notes
- Status (draft, sent, paid, overdue, cancelled, pending-review, rejected)
- PDF URL
- Created/Updated timestamps

#### Payment
- ID, Invoice ID
- Payment method (online, manual, bank-transfer)
- Amount, Status
- Receipt URL (for uploads)
- Transaction ID
- Review notes

### Components

#### Admin Components
1. `InvoiceManagement.tsx` - Main invoice management interface
2. `PaymentReview.tsx` - Manual payment review interface
3. `InvoiceTypes.ts` - TypeScript interfaces and types

#### Parent Components
1. `InvoicesPayments.tsx` - Parent invoice viewing and payment interface

### Payment Gateways
- Primary: Payfast (South Africa)
- Alternatives: Stripe, PayPal
- Features: Secure tokenization, multi-currency support, webhooks, PCI-DSS compliance

## User Flows

### Admin Flow
1. Select client from dashboard
2. Create invoice via form with services/items
3. Preview and save invoice
4. Send invoice to parent via email/SMS
5. Monitor payment status
6. Review manual payment receipts
7. Approve/reject manual payments

### Parent Flow
1. View invoice in mobile app
2. Choose payment method:
   - Online payment: Enter card details, confirm payment
   - Manual transfer: Upload bank receipt
3. Receive status updates via notifications
4. View payment confirmation/rejection reasons

## Security & Compliance
- PCI-DSS compliant payment processing
- GDPR-compliant data handling
- Secure file storage for PDFs/receipts (AWS S3 recommended)
- Encrypted transmission of sensitive data

## Reporting
- Export invoice reports (CSV/PDF) for accounting purposes
- Track payment statuses and histories
- Generate financial summaries

## Future Enhancements
- Recurring invoices for regular clients
- Integration with accounting software (Xero, QuickBooks)
- Multi-language support for international expansion
- Advanced analytics and financial reporting