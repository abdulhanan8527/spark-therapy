import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentReview = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data for payments pending review
  const [payments] = useState([
    {
      id: 'pay1',
      invoiceId: 'inv4',
      method: 'manual',
      amount: 2100,
      status: 'pending',
      receiptUrl: '/receipt-pay1.jpg',
      paymentDate: '2025-12-12',
      reviewNotes: ''
    },
    {
      id: 'pay2',
      invoiceId: 'inv5',
      method: 'bank-transfer',
      amount: 1850,
      status: 'pending',
      receiptUrl: '/receipt-pay2.png',
      paymentDate: '2025-12-11',
      reviewNotes: 'Transfer reference: TRX123456'
    }
  ]);

  // Mock data for invoices
  const invoices = [
    {
      id: 'inv4',
      clientId: 'client3',
      clientName: 'Sophia Williams',
      invoiceDate: '2025-12-08',
      dueDate: '2026-01-08',
      items: [
        { id: 'item1', description: 'Speech Therapy Session', quantity: 4, unitPrice: 500, subtotal: 2000 },
        { id: 'item2', description: 'Consultation Fee', quantity: 1, unitPrice: 100, subtotal: 100 }
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 15,
      subtotal: 2100,
      discountAmount: 0,
      taxAmount: 315,
      totalAmount: 2415,
      notes: 'December therapy sessions',
      status: 'pending-review',
      pdfUrl: '/invoice-inv4.pdf',
      createdAt: '2025-12-08T09:30:00Z',
      updatedAt: '2025-12-12T11:15:00Z'
    },
    {
      id: 'inv5',
      clientId: 'client4',
      clientName: 'James Smith',
      invoiceDate: '2025-12-05',
      dueDate: '2026-01-05',
      items: [
        { id: 'item1', description: 'Occupational Therapy Session', quantity: 3, unitPrice: 600, subtotal: 1800 },
        { id: 'item2', description: 'Assessment Report', quantity: 1, unitPrice: 50, subtotal: 50 }
      ],
      discountType: 'fixed',
      discountValue: 0,
      taxRate: 15,
      subtotal: 1850,
      discountAmount: 0,
      taxAmount: 277.5,
      totalAmount: 2127.5,
      notes: 'OT sessions for December',
      status: 'pending-review',
      pdfUrl: '/invoice-inv5.pdf',
      createdAt: '2025-12-05T14:20:00Z',
      updatedAt: '2025-12-11T16:45:00Z'
    }
  ];

  // Get invoice by ID
  const getInvoiceById = (id) => {
    return invoices.find(invoice => invoice.id === id);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
      }).format(amount);
    }
    return `PKR ${amount.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA');
  };

  // Approve payment
  const approvePayment = (paymentId) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            // In a real app, this would make an API call
            setSelectedPayment(null);
            Alert.alert('Success', 'Payment approved successfully!');
          }
        }
      ]
    );
  };

  // Reject payment
  const rejectPayment = (paymentId) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    // In a real app, this would make an API call
    setSelectedPayment(null);
    setRejectionReason('');
    Alert.alert('Success', 'Payment rejected successfully!');
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'paid': return { backgroundColor: '#e8f5e9', textColor: '#2e7d32' };
      case 'sent': return { backgroundColor: '#e3f2fd', textColor: '#1565c0' };
      case 'overdue': return { backgroundColor: '#ffebee', textColor: '#c62828' };
      case 'draft': return { backgroundColor: '#fafafa', textColor: '#424242' };
      case 'pending-review': return { backgroundColor: '#fff8e1', textColor: '#f57f17' };
      case 'rejected': return { backgroundColor: '#ffebee', textColor: '#c62828' };
      default: return { backgroundColor: '#f5f5f5', textColor: '#616161' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Payment Review</Text>
        <Text style={styles.subHeader}>Review and approve manual payment receipts</Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyStateText}>No payments pending review</Text>
          <Text style={styles.emptyStateSubtext}>All manual payments have been reviewed</Text>
        </View>
      ) : (
        <ScrollView style={styles.paymentsList}>
          {payments.map(payment => {
            const invoice = getInvoiceById(payment.invoiceId);
            const statusStyle = getStatusVariant('pending-review');
            
            return (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleContainer}>
                      <Text style={styles.paymentTitle}>Payment #{payment.id.substring(3)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.textColor }]}>Pending Review</Text>
                      </View>
                    </View>
                    
                    {invoice && (
                      <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceText}>
                          Invoice: <Text style={styles.invoiceValue}>INV-{invoice.id.substring(3)}</Text>
                        </Text>
                        <Text style={styles.invoiceText}>
                          Client: <Text style={styles.invoiceValue}>{invoice.clientName}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => viewPaymentDetails(payment)}
                    style={styles.viewButton}
                  >
                    <Ionicons name="eye-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{formatCurrency(payment.amount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(payment.paymentDate)}</Text>
                  </View>
                  {payment.reviewNotes ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Notes:</Text>
                      <Text style={styles.detailValue}>{payment.reviewNotes}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Payment Detail Modal */}
      <Modal
        visible={!!selectedPayment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPayment(null)}
      >
        {selectedPayment && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Review - #{selectedPayment.id.substring(3)}</Text>
              <TouchableOpacity onPress={() => setSelectedPayment(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Receipt Preview</Text>
                <View style={styles.receiptPreview}>
                  <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
                  <Text style={styles.receiptText}>Bank Transfer Receipt</Text>
                  <Text style={styles.receiptSubtext}>Receipt file would be displayed here</Text>
                </View>
              </View>
              
              {(() => {
                const invoice = getInvoiceById(selectedPayment.invoiceId);
                return invoice ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Details</Text>
                    <View style={styles.invoiceDetailCard}>
                      <View style={styles.invoiceHeaderRow}>
                        <Text style={styles.invoiceDetailTitle}>INV-{invoice.id.substring(3)}</Text>
                        <View style={[styles.statusBadge, getStatusVariant(invoice.status)]}>
                          <Text style={styles.statusText}>
                            {invoice.status === 'pending-review' 
                              ? 'Pending Review' 
                              : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.invoiceDetailRow}>
                        <Text style={styles.invoiceLabel}>Client:</Text>
                        <Text style={styles.invoiceValue}>{invoice.clientName}</Text>
                      </View>
                      <View style={styles.invoiceDetailRow}>
                        <Text style={styles.invoiceLabel}>Invoice Date:</Text>
                        <Text style={styles.invoiceValue}>{formatDate(invoice.invoiceDate)}</Text>
                      </View>
                      <View style={styles.invoiceDetailRow}>
                        <Text style={styles.invoiceLabel}>Due Date:</Text>
                        <Text style={styles.invoiceValue}>{formatDate(invoice.dueDate)}</Text>
                      </View>
                      <View style={styles.invoiceDetailRow}>
                        <Text style={styles.invoiceLabel}>Amount:</Text>
                        <Text style={styles.invoiceValue}>{formatCurrency(invoice.totalAmount)}</Text>
                      </View>
                    </View>
                  </View>
                ) : null;
              })()}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedPayment(null);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => {
                  // Show rejection modal or input
                  Alert.prompt(
                    'Reject Payment',
                    'Please provide a reason for rejecting this payment:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reject',
                        onPress: (reason) => {
                          if (reason && reason.trim()) {
                            rejectPayment(selectedPayment.id);
                          } else {
                            Alert.alert('Error', 'Please provide a reason for rejection');
                          }
                        }
                      }
                    ],
                    'plain-text'
                  );
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={() => approvePayment(selectedPayment.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentsList: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  invoiceInfo: {
    marginBottom: 8,
  },
  invoiceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  invoiceValue: {
    fontWeight: '500',
    color: '#333',
  },
  paymentDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  viewButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  receiptPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 120,
  },
  receiptText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  receiptSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  invoiceDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  invoiceDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  invoiceLabel: {
    fontSize: 14,
    color: '#666',
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default PaymentReview;