import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { feeAPI, invoiceAPI } from '../../services/api';

const FeeManagementScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [feeData, setFeeData] = useState({
    summary: {
      totalRevenue: 0,
      overdue: 0,
      upcoming: 0,
      paidThisMonth: 0,
    },
    invoices: []
  });
  const [loading, setLoading] = useState(true);
  
  const loadFeeData = async () => {
    try {
      setLoading(true);
      
      // Load invoices
      const invoicesResponse = await invoiceAPI.getAllInvoices();
      if (invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
        setFeeData(prev => ({
          ...prev,
          invoices: invoicesResponse.data.map(invoice => ({
            id: invoice._id,
            parentId: invoice.parentId,
            parentName: invoice.parentName,
            childName: invoice.childName,
            amount: invoice.amount,
            dueDate: invoice.dueDate,
            status: invoice.status,
            issuedDate: invoice.issuedDate,
            paidDate: invoice.paidDate,
          }))
        }));
      }
      
      // Load fee summary - we'll calculate it from the invoices
      const invoices = invoicesResponse.success && Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [];
      
      const summary = invoices.reduce((acc, invoice) => {
        acc.totalRevenue += invoice.amount || 0;
        
        if (invoice.status === 'overdue') {
          acc.overdue += invoice.amount || 0;
        } else if (invoice.status === 'upcoming') {
          acc.upcoming += invoice.amount || 0;
        } else if (invoice.status === 'paid') {
          acc.paidThisMonth += invoice.amount || 0;
        }
        
        return acc;
      }, { totalRevenue: 0, overdue: 0, upcoming: 0, paidThisMonth: 0 });
      
      setFeeData(prev => ({
        ...prev,
        summary
      }));
    } catch (error) {
      console.error('Error loading fee data:', error);
      Alert.alert('Error', 'Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadFeeData();
  }, []);

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const response = await invoiceAPI.updateInvoice(invoiceId, { status: 'paid', paidDate: new Date().toISOString().split('T')[0] });
      
      if (response.success) {
        // Update the local state to reflect the change
        setFeeData(prev => ({
          ...prev,
          invoices: prev.invoices.map(invoice => 
            invoice.id === invoiceId 
              ? { ...invoice, status: 'paid', paidDate: new Date().toISOString().split('T')[0] }
              : invoice
          ),
          summary: {
            ...prev.summary,
            paidThisMonth: prev.summary.paidThisMonth + (prev.invoices.find(inv => inv.id === invoiceId)?.amount || 0),
            overdue: prev.summary.overdue - (prev.invoices.find(inv => inv.id === invoiceId)?.amount || 0)
          }
        }));
        
        Alert.alert('Success', 'Invoice marked as paid!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      Alert.alert('Error', 'Failed to mark invoice as paid');
    }
  };

  const handleSendReminder = (invoiceId) => {
    // In a real app, this would send an email/SMS reminder
    Alert.alert('Reminder Sent', 'Payment reminder has been sent to the parent.');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
      case 'overdue':
        return <Ionicons name="alert-circle" size={16} color="#FF3B30" />;
      case 'upcoming':
        return <Ionicons name="time" size={16} color="#FF9500" />;
      default:
        return <Ionicons name="time" size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return styles.paidStatus;
      case 'overdue':
        return styles.overdueStatus;
      case 'upcoming':
        return styles.upcomingStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const filteredInvoices = Array.isArray(feeData.invoices) ? feeData.invoices.filter(invoice =>
    invoice.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.childName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Fee Management</Text>
      
      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="cash" size={24} color="#FF3B30" />
            </View>
            <View>
              <Text style={styles.summaryValue}>PKR {feeData.summary.overdue}</Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar" size={24} color="#FF9500" />
            </View>
            <View>
              <Text style={styles.summaryValue}>PKR {feeData.summary.upcoming}</Text>
              <Text style={styles.summaryLabel}>Upcoming</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
            <View>
              <Text style={styles.summaryValue}>PKR {feeData.summary.paidThisMonth}</Text>
              <Text style={styles.summaryLabel}>Paid This Month</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="cash" size={24} color="#007AFF" />
            </View>
            <View>
              <Text style={styles.summaryValue}>PKR {feeData.summary.totalRevenue}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Invoices List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoices ({filteredInvoices.length})</Text>
        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceId}>{invoice.id}</Text>
                  <Text style={styles.invoiceParent}>{invoice.parentName}</Text>
                  <Text style={styles.invoiceChild}>{invoice.childName}</Text>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                  {getStatusIcon(invoice.status)}
                  <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                </View>
              </View>
              
              <View style={styles.invoiceDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>PKR {invoice.amount}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issued</Text>
                  <Text style={styles.detailValue}>{invoice.issuedDate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>{invoice.dueDate}</Text>
                </View>
                
                {invoice.status === 'paid' && invoice.paidDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Paid</Text>
                    <Text style={styles.detailValue}>{invoice.paidDate}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                {invoice.status !== 'paid' && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleMarkAsPaid(invoice.id)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text style={styles.actionText}>Mark Paid</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleSendReminder(invoice.id)}
                    >
                      <Ionicons name="calendar" size={16} color="#FF9500" />
                      <Text style={styles.actionText}>Send Reminder</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
          
          {filteredInvoices.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cash" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No invoices found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search criteria</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  invoicesList: {
    gap: 12,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  invoiceParent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  invoiceChild: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidStatus: {
    backgroundColor: '#e8f5e9',
  },
  overdueStatus: {
    backgroundColor: '#ffebee',
  },
  upcomingStatus: {
    backgroundColor: '#fff3e0',
  },
  defaultStatus: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#333',
  },
  invoiceDetails: {
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});

export default FeeManagementScreen;