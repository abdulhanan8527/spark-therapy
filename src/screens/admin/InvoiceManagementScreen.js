/**
 * Invoice Management Screen
 * 
 * ANDROID PDF DOWNLOAD FIX:
 * To enable PDF download on Android, install the required native module:
 * 
 * Option 1 (Recommended): react-native-blob-util
 *   npm install react-native-blob-util
 *   cd ios && pod install && cd ..
 * 
 * Option 2: rn-fetch-blob (deprecated but works)
 *   npm install rn-fetch-blob
 *   cd ios && pod install && cd ..
 * 
 * Then rebuild the app:
 *   npx expo run:android
 * 
 * NOTE: Web platform works without additional setup
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Conditional import for PDF viewer - only for native platforms
let Pdf = null;
let RNFetchBlob = null;

// Function to dynamically load PDF modules only on native platforms
const loadPdfModules = () => {
  if (Platform.OS !== 'web') {
    try {
      // Use Function constructor to prevent Metro from analyzing the require
      const dynamicRequire = new Function('moduleName', 'return require(moduleName)');
      
      const pdfModule = dynamicRequire('react-native-pdf');
      const rnFetchBlobModule = dynamicRequire('rn-fetch-blob');
      
      // Handle different export styles
      if (pdfModule) {
        if (pdfModule.default) {
          Pdf = pdfModule.default;
        } else if (typeof pdfModule === 'function') {
          Pdf = pdfModule;
        } else {
          Pdf = pdfModule;
        }
      }
      
      if (rnFetchBlobModule) {
        RNFetchBlob = rnFetchBlobModule.default || rnFetchBlobModule;
      }
    } catch (error) {
      console.warn('PDF modules not available:', error);
    }
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import apiClient, { invoiceAPI, childAPI } from '../../services/api';

const InvoiceManagementScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    childId: '',
    amount: '',
    dueDate: '',
    description: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');

  // Load PDF modules when component mounts
  useEffect(() => {
    loadPdfModules();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING INVOICES ===');
      // Fetch all invoices from backend
      const response = await invoiceAPI.getAllInvoices();
      console.log('Invoice API response:', response);
      
      if (response.success) {
        // Handle nested data structure: response.data.data
        let invoicesData = response.data;
        
        // Check if data is double-nested
        if (invoicesData && invoicesData.data) {
          console.log('Found nested data.data structure');
          invoicesData = invoicesData.data;
        }
        
        // Check for invoices property
        if (invoicesData && invoicesData.invoices) {
          console.log('Found invoices property');
          invoicesData = invoicesData.invoices;
        }
        
        // Ensure it's an array
        const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
        console.log(`Setting ${invoicesArray.length} invoices in state:`, invoicesArray);
        setInvoices(invoicesArray);
      } else {
        console.error('Failed to fetch invoices:', response.message);
        Alert.alert('Error', response.message || 'Failed to fetch invoices');
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      Alert.alert('Error', error.message || 'Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH INVOICES COMPLETE ===');
    }
  };

  // Fetch children for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch children
        const childrenRes = await childAPI.getChildren();
        if (childrenRes.success) {
          setChildren(childrenRes.data.children || childrenRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchData();
  }, []);

  const handleGenerateInvoice = async () => {
    if (!newInvoice.childId || !newInvoice.amount || !newInvoice.dueDate || !newInvoice.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Prepare invoice data
      const invoiceData = {
        childId: newInvoice.childId,
        amount: parseFloat(newInvoice.amount),
        dueDate: newInvoice.dueDate,
        description: newInvoice.description,
        status: 'pending',
        issuedDate: new Date().toISOString(),
      };
      
      // Create invoice via API
      const response = await invoiceAPI.createInvoice(invoiceData);
      
      if (response.success) {
        Alert.alert('Success', 'Invoice generated successfully!');
        
        // Refresh the invoice list
        fetchInvoices();
        
        // Reset form
        setNewInvoice({
          childId: '',
          amount: '',
          dueDate: '',
          description: ''
        });
        setShowGenerateForm(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', error.message || 'Failed to create invoice');
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      if (Platform.OS === 'web') {
        // Web platform - open PDF in new tab
        try {
          // Construct the PDF URL using the API endpoint
          const token = await AsyncStorage.getItem('userToken');
          const baseUrl = apiClient?.defaults?.baseURL || 'http://localhost:5001/api';
          const pdfUrl = `${baseUrl}/invoices/${invoiceId}/pdf?token=${token}`;
          
          // Open the PDF in a new tab for viewing
          window.open(pdfUrl, '_blank');
          
          Alert.alert('Info', 'Invoice opened in a new tab');
        } catch (error) {
          console.error('View error:', error);
          Alert.alert('Error', 'Failed to load invoice. Please try again.');
        }
      } else {
        // Native platforms - use modal
        // Set the PDF URL using the API endpoint
        const baseUrl = apiClient?.defaults?.baseURL || 'http://localhost:5001/api';
        const pdfUrl = `${baseUrl}/invoices/${invoiceId}/pdf`;
        
        // Add auth token to the URL
        const token = await AsyncStorage.getItem('userToken');
        const fullPdfUrl = `${pdfUrl}?token=${token}`;
        
        setPdfUrl(fullPdfUrl);
        setPdfTitle(`Invoice ${invoiceId}`);
        setPdfModalVisible(true);
      }
    } catch (error) {
      console.error('View error:', error);
      Alert.alert('Error', 'Failed to load invoice. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      if (Platform.OS === 'web') {
        // Web platform - open PDF in new tab for download
        try {
          // Get the invoice to construct the download URL
          
          // Construct the download URL using the API endpoint
          const token = await AsyncStorage.getItem('userToken');
          const baseUrl = apiClient?.defaults?.baseURL || 'http://localhost:5001/api';
          const downloadUrl = `${baseUrl}/invoices/${invoiceId}/pdf?token=${token}`;
          
          // Open the PDF in a new tab for download
          window.open(downloadUrl, '_blank');
          
          Alert.alert('Success', 'Invoice PDF download started');
        } catch (error) {
          console.error('Download error:', error);
          Alert.alert('Error', 'Failed to download invoice PDF. Please try again.');
        }
      } else {
        // Native platforms - use expo-file-system and expo-sharing
        try {
          Alert.alert('Downloading...', 'Please wait while we prepare your invoice PDF');
          
          // Get auth token
          const token = await AsyncStorage.getItem('userToken');
          const baseUrl = apiClient?.defaults?.baseURL || 'http://localhost:5001/api';
          const downloadUrl = `${baseUrl}/invoices/${invoiceId}/pdf?token=${token}`;
          
          // Download file using expo-file-system
          const fileUri = FileSystem.documentDirectory + `invoice_${invoiceId}.pdf`;
          
          const downloadResult = await FileSystem.downloadAsync(
            downloadUrl,
            fileUri
          );
          
          if (downloadResult.status === 200) {
            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
              // Share the file (this allows user to save/open it)
              await Sharing.shareAsync(downloadResult.uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Save Invoice PDF',
                UTI: 'com.adobe.pdf'
              });
            } else {
              Alert.alert('Success', `Invoice saved to ${fileUri}`);
            }
          } else {
            Alert.alert('Error', 'Failed to download invoice PDF');
          }
        } catch (error) {
          console.error('Download error:', error);
          Alert.alert('Error', 'Failed to download invoice PDF: ' + error.message);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download invoice. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <Ionicons name="time" size={16} color="#8E8E93" />;
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return <Ionicons name="checkmark-circle" size={16} color="#34C759" />;
      case 'overdue':
        return <Ionicons name="alert-circle" size={16} color="#FF3B30" />;
      case 'upcoming':
      case 'pending':
        return <Ionicons name="time" size={16} color="#FF9500" />;
      default:
        return <Ionicons name="time" size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Pending';
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'upcoming':
        return 'Upcoming';
      case 'pending':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
    }
  };

  const getStatusStyle = (status) => {
    if (!status) return styles.upcomingStatus;
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return styles.paidStatus;
      case 'overdue':
        return styles.overdueStatus;
      case 'upcoming':
      case 'pending':
        return styles.upcomingStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(invoice => {
    const query = searchQuery.toLowerCase();
    
    // Safely access nested properties with optional chaining
    const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
    const parentName = invoice.parentId?.name?.toLowerCase() || '';
    const childFirstName = invoice.childId?.firstName?.toLowerCase() || '';
    const childLastName = invoice.childId?.lastName?.toLowerCase() || '';
    const childFullName = `${childFirstName} ${childLastName}`.trim();
    const description = invoice.description?.toLowerCase() || '';
    const status = invoice.status?.toLowerCase() || '';
    
    return (
      invoiceNumber.includes(query) ||
      parentName.includes(query) ||
      childFirstName.includes(query) ||
      childLastName.includes(query) ||
      childFullName.includes(query) ||
      description.includes(query) ||
      status.includes(query)
    );
  }) : [];

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Invoice Management</Text>
      
      {/* Search and Generate */}
      <View style={styles.section}>
        <View style={styles.searchAndGenerate}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search invoices..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.generateButton} 
            onPress={() => setShowGenerateForm(!showGenerateForm)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.generateButtonText}>
              {showGenerateForm ? 'Cancel' : 'Generate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Generate Invoice Form */}
      {showGenerateForm && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate New Invoice</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Child</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newInvoice.childId}
                  onValueChange={(value) => setNewInvoice({...newInvoice, childId: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Child" value="" />
                  {children.map((child) => (
                    <Picker.Item key={child._id || child.id} label={child.firstName + ' ' + child.lastName} value={child._id || child.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (PKR)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                value={newInvoice.amount}
                onChangeText={(text) => setNewInvoice({...newInvoice, amount: text})}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newInvoice.dueDate}
                onChangeText={(text) => setNewInvoice({...newInvoice, dueDate: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter invoice description..."
                value={newInvoice.description}
                onChangeText={(text) => setNewInvoice({...newInvoice, description: text})}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleGenerateInvoice}>
              <Ionicons name="cash" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Generate Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Invoices List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoices ({filteredInvoices.length})</Text>
        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <View key={invoice._id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceId}>{invoice.invoiceNumber || invoice._id}</Text>
                  <Text style={styles.invoiceParent}>{invoice.parentId?.name || 'Unknown Parent'}</Text>
                  <Text style={styles.invoiceChild}>
                    {invoice.childId?.firstName && invoice.childId?.lastName 
                      ? `${invoice.childId.firstName} ${invoice.childId.lastName}` 
                      : 'Unknown Child'}
                  </Text>
                </View>
                
                <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                  {getStatusIcon(invoice.status)}
                  <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.invoiceDescription}>{invoice.description || 'No description'}</Text>
              
              <View style={styles.invoiceDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>PKR {invoice.amount?.toFixed(2) || '0.00'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issued</Text>
                  <Text style={styles.detailValue}>
                    {invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                
                {invoice.status === 'paid' && invoice.paidDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Paid</Text>
                    <Text style={styles.detailValue}>
                      {new Date(invoice.paidDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleViewInvoice(invoice._id)}
                >
                  <Ionicons name="eye" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleDownloadInvoice(invoice._id)}
                >
                  <Ionicons name="download" size={16} color="#34C759" />
                  <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>
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
        ) : pdfUrl && Pdf && typeof Pdf === 'function' && Pdf !== null ? (
          <Pdf
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
  </>);
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
  searchAndGenerate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  invoiceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
    flex: 1,
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
  picker: {
    flex: 1,
    color: '#333',
  },
});

export default InvoiceManagementScreen;