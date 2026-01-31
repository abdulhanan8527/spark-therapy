import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Linking, Platform } from 'react-native';
import { DollarSign, Download, Eye, CheckCircle, Clock, AlertCircle, Printer } from '../../components/SimpleIcons';
import { getPDFComponents } from '../../utils/PdfUtils';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceAPI, childAPI } from '../../services/api';

const InvoicesScreen = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfComponents, setPdfComponents] = useState({ Pdf: null, RNFetchBlob: null });

  useEffect(() => {
    fetchInitialData();
    // Load PDF components based on platform
    loadPDFComponents();
  }, []);

  const loadPDFComponents = () => {
    const components = getPDFComponents();
    setPdfComponents(components);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch children first
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success) {
        setChildren(childrenRes.data);
      }

      // Fetch all invoices for parent
      const invoicesRes = await invoiceAPI.getInvoicesByParentId(user.id);
      if (invoicesRes.success) {
        // Ensure invoices is always an array
        const invoicesData = invoicesRes.data || [];
        // Make sure invoicesData is an array
        const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
        setInvoices(invoicesArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch invoices. Please try again later.');
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

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      if (Platform.OS === 'web') {
        // Web platform - open PDF in new tab
        try {
          // Get the invoice to construct the download URL
          const invoice = invoices.find(inv => inv._id === invoiceId);
          
          if (!invoice) {
            Alert.alert('Error', 'Invoice not found');
            return;
          }
          
          // Construct the download URL using the API endpoint
          const token = await AsyncStorage.getItem('userToken');
          const downloadUrl = `${invoiceAPI.defaults.baseURL}/invoices/${invoiceId}/pdf?token=${token}`;
          
          // Open the PDF in a new tab for download
          window.open(downloadUrl, '_blank');
          
          Alert.alert('Success', 'Invoice PDF download started');
        } catch (error) {
          console.error('Download error:', error);
          Alert.alert('Error', 'Failed to download invoice PDF. Please try again.');
        }
      } else {
        // Native platforms
        Alert.alert(
          'Download Invoice',
          'Would you like to download this invoice as a PDF?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download',
              onPress: async () => {
                try {
                  // Show loading indicator
                  Alert.alert('Downloading...', 'Please wait while we prepare your invoice PDF');
                  
                  // Get the PDF from the backend
                  const response = await invoiceAPI.downloadInvoicePDF(invoiceId);
                  
                  if (response && response.data && pdfComponents.RNFetchBlob) {
                    // Convert the response data to base64 for PDF saving
                    const base64 = response.data.toString('base64');
                    
                    // Determine the file system path based on platform
                    let path;
                    if (Platform.OS === 'android') {
                      path = `${pdfComponents.RNFetchBlob.fs.dirs.DownloadDir}/invoice_${invoiceId}.pdf`;
                    } else {
                      path = `${pdfComponents.RNFetchBlob.fs.dirs.DocumentDir}/invoice_${invoiceId}.pdf`;
                    }
                    
                    // Write the PDF to device storage
                    await pdfComponents.RNFetchBlob.fs.writeFile(path, base64, 'base64');
                    
                    Alert.alert('Success', `Invoice PDF saved to ${path}`);
                  } else {
                    Alert.alert('Error', 'Failed to download invoice PDF');
                  }
                } catch (error) {
                  console.error('Download error:', error);
                  Alert.alert('Error', 'Failed to download invoice PDF. Please try again.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download invoice. Please try again.');
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      if (Platform.OS === 'web') {
        // Web platform - open PDF in new tab
        try {
          // Get the invoice to show its details
          const invoice = invoices.find(inv => inv._id === invoiceId);
          
          if (!invoice) {
            Alert.alert('Error', 'Invoice not found');
            return;
          }
          
          // Construct the PDF URL using the API endpoint
          const token = await AsyncStorage.getItem('userToken');
          const pdfUrl = `${invoiceAPI.defaults.baseURL}/invoices/${invoiceId}/pdf?token=${token}`;
          
          // Open the PDF in a new tab for viewing
          window.open(pdfUrl, '_blank');
          
          Alert.alert('Info', 'Invoice opened in a new tab');
        } catch (error) {
          console.error('View error:', error);
          Alert.alert('Error', 'Failed to load invoice. Please try again.');
        }
      } else {
        // Native platforms - use modal
        // Get the invoice to show its details
        const invoice = invoices.find(inv => inv._id === invoiceId);
        
        if (!invoice) {
          Alert.alert('Error', 'Invoice not found');
          return;
        }
        
        // Set the PDF URL using the API endpoint
        const pdfUrl = `${invoiceAPI.defaults.baseURL}/invoices/${invoiceId}/pdf`;
        
        // Add auth token to the URL
        const token = await AsyncStorage.getItem('userToken');
        const fullPdfUrl = `${pdfUrl}?token=${token}`;
        
        setPdfUrl(fullPdfUrl);
        setPdfTitle(`Invoice ${invoice.invoiceNumber || `INV-${invoiceId.substring(0, 8).toUpperCase()}`}`);
        setPdfModalVisible(true);
      }
    } catch (error) {
      console.error('View error:', error);
      Alert.alert('Error', 'Failed to load invoice. Please try again.');
    }
  };

  const handlePayInvoice = (invoiceId) => {
    Alert.alert('Payment', 'Redirecting to secure gateway...');
  };

  const filteredInvoices = selectedChild
    ? (Array.isArray(invoices) ? invoices.filter(invoice => invoice.childId === selectedChild || invoice.child?._id === selectedChild) : [])
    : (Array.isArray(invoices) ? invoices : []);

  const totalDue = Array.isArray(filteredInvoices) ? filteredInvoices.reduce((sum, invoice) => sum + (invoice.status !== 'paid' ? invoice.amount : 0), 0) : 0;
  const overdueAmount = Array.isArray(filteredInvoices) ? filteredInvoices.reduce((sum, invoice) => sum + (invoice.status === 'overdue' ? invoice.amount : 0), 0) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Invoices</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Due</Text>
            <Text style={styles.summaryAmount}>PKR {totalDue.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryAmount, { color: overdueAmount > 0 ? '#FF3B30' : '#333' }]}>
              PKR {overdueAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Child Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Child</Text>
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
                All
              </Text>
            </TouchableOpacity>

            {children.map((child) => (
              <TouchableOpacity
                key={child._id}
                style={[
                  styles.childButton,
                  selectedChild === child._id && styles.selectedChildButton
                ]}
                onPress={() => setSelectedChild(child._id)}
              >
                <Text style={[
                  styles.childButtonText,
                  selectedChild === child._id && styles.selectedChildButtonText
                ]}>
                  {child.firstName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Invoices List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <View style={styles.invoicesList}>
            {filteredInvoices.map((invoice) => (
              <View key={invoice._id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.invoiceId}>{invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8).toUpperCase()}`}</Text>
                    <Text style={styles.childName}>{invoice.child?.firstName} {invoice.child?.lastName}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                    {getStatusIcon(invoice.status)}
                    <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                  </View>
                </View>

                <Text style={styles.invoiceDescription}>{invoice.description}</Text>

                <View style={styles.invoiceDetails}>
                  <View>
                    <Text style={styles.detailLabel}>Issued</Text>
                    <Text style={styles.detailValue}>{new Date(invoice.issuedDate).toLocaleDateString()}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Due Date</Text>
                    <Text style={styles.detailValue}>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.amountValue}>PKR {invoice.amount.toFixed(2)}</Text>
                  </View>
                </View>

                {invoice.status === 'paid' && invoice.paidDate && (
                  <View style={styles.paidInfo}>
                    <Text style={styles.paidLabel}>Paid on {new Date(invoice.paidDate).toLocaleDateString()}</Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewInvoice(invoice._id)}
                  >
                    <Eye size={16} color="#007AFF" />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadInvoice(invoice._id)}
                  >
                    <Download size={16} color="#34C759" />
                    <Text style={styles.actionText}>Download</Text>
                  </TouchableOpacity>

                  {invoice.status !== 'paid' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.payButton]}
                      onPress={() => handlePayInvoice(invoice._id)}
                    >
                      <DollarSign size={16} color="#fff" />
                      <Text style={styles.payText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {filteredInvoices.length === 0 && (
              <View style={styles.emptyState}>
                <DollarSign size={40} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No invoices found</Text>
                <Text style={styles.emptyStateSubtext}>Everything is up to date!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* PDF Viewer Modal */}
      <Modal
        visible={pdfModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setPdfModalVisible(false)}
      >
        <View style={styles.pdfModalContainer}>
          <View style={styles.pdfHeader}>
            <Text style={styles.pdfTitle} numberOfLines={1} ellipsizeMode="middle">
              {pdfTitle}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPdfModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {Platform.OS === 'web' ? (
            <View style={styles.pdfContainer}>
              <iframe 
                src={pdfUrl} 
                style={styles.pdf}
                title={pdfTitle}
                frameBorder="0"
                onLoad={() => console.log('PDF loaded')}
                onError={(error) => {
                  console.log('PDF Error:', error);
                  Alert.alert('Error', 'Failed to load PDF');
                }}
              />
            </View>
          ) : pdfUrl && pdfComponents.Pdf ? (
            <pdfComponents.Pdf
              source={{ uri: pdfUrl }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log('PDF Error:', error);
                Alert.alert('Error', 'Failed to load PDF: ' + error.message);
              }}
              onPressLink={(uri) => {
                console.log('Link pressed:', uri);
              }}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#343a40',
  },
  childSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  childButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  selectedChildButton: {
    backgroundColor: '#007AFF',
  },
  childButtonText: {
    color: '#495057',
    fontWeight: '600',
  },
  selectedChildButtonText: {
    color: '#fff',
  },
  invoicesList: {
    gap: 16,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  childName: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidStatus: {
    backgroundColor: '#d1e7dd',
  },
  overdueStatus: {
    backgroundColor: '#f8d7da',
  },
  upcomingStatus: {
    backgroundColor: '#fff3cd',
  },
  defaultStatus: {
    backgroundColor: '#e9ecef',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    color: '#1a1a1a',
  },
  invoiceDescription: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 16,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6c757d',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#212529',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '800',
  },
  paidInfo: {
    backgroundColor: '#d1e7dd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#198754',
  },
  paidLabel: {
    fontSize: 13,
    color: '#0f5132',
    fontWeight: '700',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flex: 1,
  },
  actionText: {
    fontSize: 13,
    color: '#343a40',
    fontWeight: '700',
    marginLeft: 6,
  },
  payButton: {
    backgroundColor: '#007AFF',
    flex: 1.5,
  },
  payText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
  // PDF Modal Styles
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    width: '100%',
    height: '100%',
  },
});

export default InvoicesScreen;