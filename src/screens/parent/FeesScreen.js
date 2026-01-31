import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle } from '../../components/SimpleIcons';
import { useAuth } from '../../contexts/AuthContext';
import { childAPI, invoiceAPI } from '../../services/api';

const FeesScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalDue: 0,
    overdue: 0,
    upcoming: 0,
    paidThisMonth: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch children
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(childrenRes.data);
        if (childrenRes.data.length > 0) {
          setSelectedChild(childrenRes.data[0]);
        }
      }
      
      // Fetch invoices
      const invoicesRes = await invoiceAPI.getInvoicesByParentId(user.id);
      if (invoicesRes.success) {
        const invoiceData = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
        setInvoices(invoiceData);
        
        // Calculate summary
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const totalDue = invoiceData.reduce((sum, inv) => 
          inv.status !== 'paid' ? sum + inv.amount : sum, 0);
        
        const overdue = invoiceData.reduce((sum, inv) => 
          inv.status === 'overdue' ? sum + inv.amount : sum, 0);
        
        const upcoming = invoiceData.reduce((sum, inv) => 
          inv.status === 'pending' ? sum + inv.amount : sum, 0);
        
        const paidThisMonth = invoiceData.reduce((sum, inv) => {
          if (inv.status === 'paid' && inv.paidDate) {
            const paidDate = new Date(inv.paidDate);
            return paidDate >= startOfMonth ? sum + inv.amount : sum;
          }
          return sum;
        }, 0);
        
        setSummary({
          totalDue,
          overdue,
          upcoming,
          paidThisMonth
        });
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      Alert.alert('Error', 'Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle size={16} color="#34C759" />;
      case 'overdue':
        return <AlertCircle size={16} color="#FF3B30" />;
      case 'pending':
      case 'upcoming':
        return <Clock size={16} color="#FF9500" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return styles.paidStatus;
      case 'overdue':
        return styles.overdueStatus;
      case 'pending':
      case 'upcoming':
        return styles.upcomingStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const filteredInvoices = selectedChild 
    ? invoices.filter(invoice => invoice.childId === selectedChild._id)
    : invoices;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading fee information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Fee Management</Text>
      
      {/* Fee Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <DollarSign size={24} color="#FF3B30" />
              </View>
              <View>
                <Text style={styles.summaryAmount}>PKR {summary.overdue.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Overdue</Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Calendar size={24} color="#FF9500" />
              </View>
              <View>
                <Text style={styles.summaryAmount}>PKR {summary.upcoming.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Upcoming</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <CheckCircle size={24} color="#34C759" />
              </View>
              <View>
                <Text style={styles.summaryAmount}>PKR {summary.paidThisMonth.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Paid This Month</Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <DollarSign size={24} color="#007AFF" />
              </View>
              <View>
                <Text style={styles.summaryAmount}>PKR {summary.totalDue.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Total Due</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Child Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Child</Text>
        <View style={styles.childSelector}>
          <TouchableOpacity
            style={[
              styles.childButton,
              !selectedChild && styles.selectedChildButton
            ]}
            onPress={() => setSelectedChild(null)}
          >
            <Text style={[
              styles.childButtonText,
              !selectedChild && styles.selectedChildButtonText
            ]}>
              All Children
            </Text>
          </TouchableOpacity>
          
          {children.map((child) => (
            <TouchableOpacity
              key={child._id}
              style={[
                styles.childButton,
                selectedChild?._id === child._id && styles.selectedChildButton
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text style={[
                styles.childButtonText,
                selectedChild?._id === child._id && styles.selectedChildButtonText
              ]}>
                {child.firstName} {child.lastName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity style={styles.paymentMethod}>
            <CreditCard size={24} color="#007AFF" />
            <Text style={styles.paymentMethodText}>Credit Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.paymentMethod}>
            <DollarSign size={24} color="#34C759" />
            <Text style={styles.paymentMethodText}>Bank Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invoices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoices</Text>
        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <View key={invoice._id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceId}>{invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8).toUpperCase()}`}</Text>
                <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                  {getStatusIcon(invoice.status)}
                  <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.invoiceDescription}>{invoice.description}</Text>
              
              <View style={styles.invoiceDetails}>
                <Text style={styles.invoiceAmount}>PKR {invoice.amount.toFixed(2)}</Text>
                <Text style={styles.invoiceDate}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
              </View>
              
              {invoice.status !== 'paid' && (
                <TouchableOpacity style={styles.payButton}>
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
              
              {invoice.status === 'paid' && invoice.paidDate && (
                <Text style={styles.paidDate}>Paid on {new Date(invoice.paidDate).toLocaleDateString()}</Text>
              )}
            </View>
          ))}
          
          {filteredInvoices.length === 0 && (
            <View style={styles.emptyState}>
              <DollarSign size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No invoices found</Text>
              <Text style={styles.emptyStateSubtext}>All caught up!</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  summaryItemLast: {
    marginRight: 0,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  childButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedChildButton: {
    backgroundColor: '#007AFF',
  },
  childButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginRight: 8,
  },
  paymentMethodLast: {
    marginRight: 0,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
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
    marginBottom: 8,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  invoiceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paidDate: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});

export default FeesScreen;