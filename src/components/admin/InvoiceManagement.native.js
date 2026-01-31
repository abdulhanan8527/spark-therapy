import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PaymentReview from './PaymentReview.native';
import { invoiceAPI, childAPI, userAPI } from '../../../services/api';

const InvoiceManagement = () => {
  const [view, setView] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 15, // Default tax rate
    notes: '',
  });
  const [items, setItems] = useState([
    { id: 'item1', description: 'Speech Therapy Session', quantity: 1, unitPrice: 500, subtotal: 500 }
  ]);
  
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch children (as clients)
      const childrenRes = await childAPI.getChildren();
      if (childrenRes.success && Array.isArray(childrenRes.data)) {
        // Map children to client format
        const mappedClients = childrenRes.data.map(child => ({
          id: child._id,
          name: `${child.firstName} ${child.lastName}`,
          email: child.parent?.email || 'N/A',
          phone: child.parent?.phone || 'N/A',
          parentId: child.parentId,
          parentName: child.parent?.name || 'N/A',
          parentEmail: child.parent?.email || 'N/A',
          parentPhone: child.parent?.phone || 'N/A'
        }));
        setClients(mappedClients);
      } else {
        setClients([]);
      }
      
      // Fetch invoices
      const invoicesRes = await invoiceAPI.getAllInvoices();
      if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
        setInvoices(invoicesRes.data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
      setClients([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };
  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle client selection
  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name
      }));
    }
  };

  // Save invoice to backend
  const saveInvoiceToBackend = async (invoiceData) => {
    try {
      const invoicePayload = {
        childId: invoiceData.clientId,
        parentId: clients.find(c => c.id === invoiceData.clientId)?.parentId,
        amount: invoiceData.totalAmount,
        description: invoiceData.notes,
        issuedDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        invoiceNumber: `INV-${Date.now()}`,
        status: invoiceData.status
      };
      
      const response = await invoiceAPI.createInvoice(invoicePayload);
      if (response.success) {
        // Reload invoices after creating
        loadData();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  // Add new item row
  const addItemRow = () => {
    const newItem = {
      id: `item${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Update item
  const updateItem = (id, field, value) => {
    const numericValue = typeof value === 'string' && !isNaN(value) ? parseFloat(value) : value;
    
    setItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: numericValue };
          
          // Recalculate subtotal if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Remove item
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = formData.discountType === 'percentage' 
      ? subtotal * (formData.discountValue / 100)
      : formData.discountValue;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (formData.taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  // Submit invoice
  const handleSubmit = () => {
    // Validate form
    if (!formData.clientId) {
      Alert.alert('Error', 'Please select a client');
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      Alert.alert('Error', 'Please fill in all item descriptions');
      return;
    }
    
    const totals = calculateTotals();
    
    // Show preview before saving
    setView('preview');
  };

  // Save invoice
  const saveInvoice = async () => {
    try {
      const totals = calculateTotals();
      
      const newInvoice = {
        id: `inv-${Date.now()}`,
        clientId: formData.clientId,
        clientName: formData.clientName,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        items: [...items],
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        taxRate: formData.taxRate,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        notes: formData.notes,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to backend
      await saveInvoiceToBackend(newInvoice);
      
      // Reset form
      setFormData({
        clientId: '',
        clientName: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discountType: 'percentage',
        discountValue: 0,
        taxRate: 15,
        notes: '',
      });
      setItems([
        { id: 'item1', description: 'Speech Therapy Session', quantity: 1, unitPrice: 500, subtotal: 500 }
      ]);
      setSelectedClient(null);
      
      // Return to list view
      setView('list');
      
      Alert.alert('Success', 'Invoice created successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', error.message || 'Failed to save invoice');
    }
  };

  // Send invoice
  const sendInvoice = async (invoiceId) => {
    try {
      // Update invoice status on backend
      const invoice = invoices.find(inv => inv._id === invoiceId || inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Prepare update payload
      const updatePayload = {
        ...invoice,
        status: 'sent'
      };
      
      // Remove backend-specific fields that shouldn't be updated
      delete updatePayload._id;
      delete updatePayload.__v;
      
      const response = await invoiceAPI.updateInvoice(invoice._id || invoiceId, updatePayload);
      if (response.success) {
        // Reload invoices to get updated data
        loadData();
        Alert.alert('Success', 'Invoice sent to client successfully!');
      } else {
        throw new Error(response.message || 'Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      Alert.alert('Error', error.message || 'Failed to send invoice');
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await invoiceAPI.deleteInvoice(invoiceId);
              if (response.success) {
                // Reload invoices to get updated data
                loadData();
                Alert.alert('Success', 'Invoice deleted successfully!');
              } else {
                throw new Error(response.message || 'Failed to delete invoice');
              }
            } catch (error) {
              console.error('Error deleting invoice:', error);
              Alert.alert('Error', error.message || 'Failed to delete invoice');
            }
          }
        }
      ]
    );
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

  // Get status variant for styling
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

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'sent': return 'Sent';
      case 'overdue': return 'Overdue';
      case 'draft': return 'Draft';
      case 'pending-review': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const renderListView = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading invoices...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>{invoices.length}</Text>
          <Text style={styles.statLabel}>Total Invoices</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNumber, { color: '#166534' }]}>
            {Array.isArray(invoices) ? invoices.filter(i => (i.status || i.Status) === 'paid').length : 0}
          </Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef9c3' }]}>
          <Text style={[styles.statNumber, { color: '#854d0e' }]}>
            {Array.isArray(invoices) ? invoices.filter(i => (i.status || i.Status) === 'sent').length : 0}
          </Text>
          <Text style={styles.statLabel}>Sent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statNumber, { color: '#b91c1c' }]}>
            {Array.isArray(invoices) ? invoices.filter(i => (i.status || i.Status) === 'overdue').length : 0}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Invoices List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Invoices</Text>
        
        {Array.isArray(invoices) && invoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No invoices created yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first invoice to get started</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setView('form')}
            >
              <Text style={styles.primaryButtonText}>Create Invoice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={Array.isArray(invoices) ? invoices : []}
            keyExtractor={item => item._id || item.id}
            renderItem={({ item: invoice }) => (
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <View style={styles.invoiceTitleRow}>
                      <Text style={styles.invoiceTitle}>INV-{invoice._id?.substring(0, 8) || invoice.id.substring(4)}</Text>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusVariant(invoice.status).backgroundColor }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusVariant(invoice.status).textColor }
                        ]}>
                          {getStatusLabel(invoice.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.clientText}>Client: {invoice.clientName || invoice.child?.firstName + ' ' + invoice.child?.lastName}</Text>
                    <View style={styles.invoiceDetailsRow}>
                      <Text style={styles.detailText}>Date: {formatDate(invoice.issuedDate || invoice.invoiceDate)}</Text>
                      <Text style={styles.detailText}>Due: {formatDate(invoice.dueDate)}</Text>
                      <Text style={[styles.detailText, styles.amountText]}>
                        {formatCurrency(invoice.amount || invoice.totalAmount)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedInvoice(invoice);
                        setView('preview');
                      }}
                      style={styles.iconButton}
                    >
                      <Ionicons name="eye-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    {invoice.status === 'draft' && (
                      <TouchableOpacity 
                        onPress={() => sendInvoice(invoice._id || invoice.id)}
                        style={styles.iconButton}
                      >
                        <Ionicons name="send-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => deleteInvoice(invoice._id || invoice.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

  const renderFormView = () => (
    <View style={styles.container}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Create New Invoice</Text>
        <TouchableOpacity onPress={() => setView('list')}>
          <Ionicons name="close-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.formScroll}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Client *</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                if (clients.length === 0) {
                  Alert.alert('No Clients', 'There are no clients available. Please add children first.');
                  return;
                }
                Alert.alert(
                  'Select Client',
                  'Choose a client from the list:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    ...clients.map(client => ({
                      text: `${client.name} (${client.parentName})`,
                      onPress: () => handleClientSelect(client.id)
                    }))
                  ]
                );
              }}
            >
              <Text style={styles.selectButtonText}>
                {formData.clientId ? clients.find(c => c.id === formData.clientId)?.name : 'Select a client'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Invoice Date</Text>
            <TextInput
              style={styles.input}
              value={formData.invoiceDate}
              onChangeText={(value) => handleInputChange('invoiceDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.dateField}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput
              style={styles.input}
              value={formData.dueDate}
              onChangeText={(value) => handleInputChange('dueDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Services/Items</Text>
            <TouchableOpacity onPress={addItemRow} style={styles.addButton}>
              <Ionicons name="add" size={16} color="#8b5cf6" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="Service description"
                />
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  value={item.quantity.toString()}
                  onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
                  placeholder="Qty"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={item.unitPrice.toString()}
                  onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                  placeholder="Price"
                  keyboardType="numeric"
                />
                <Text style={styles.subtotalText}>{formatCurrency(item.subtotal)}</Text>
                {items.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeItem(item.id)}
                    style={styles.removeItemButton}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Discount</Text>
            <View style={styles.discountRow}>
              <TouchableOpacity
                style={[styles.discountTypeButton, formData.discountType === 'percentage' ? styles.activeDiscountType : {}]}
                onPress={() => handleInputChange('discountType', 'percentage')}
              >
                <Text style={[styles.discountTypeText, formData.discountType === 'percentage' ? styles.activeDiscountTypeText : {}]}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.discountTypeButton, formData.discountType === 'fixed' ? styles.activeDiscountType : {}]}
                onPress={() => handleInputChange('discountType', 'fixed')}
              >
                <Text style={[styles.discountTypeText, formData.discountType === 'fixed' ? styles.activeDiscountTypeText : {}]}>PKR</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.discountInput]}
                value={formData.discountValue.toString()}
                onChangeText={(value) => handleInputChange('discountValue', parseFloat(value) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={formData.taxRate.toString()}
              onChangeText={(value) => handleInputChange('taxRate', parseFloat(value) || 0)}
              placeholder="15"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculateTotals().subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>-{formatCurrency(calculateTotals().discountAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({formData.taxRate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculateTotals().taxAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBottom]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculateTotals().totalAmount)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Additional notes or terms"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => setView('list')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.primaryButton}
          >
            <Ionicons name="document-text-outline" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Preview & Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderPreviewView = () => selectedInvoice && (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setView(selectedInvoice ? 'list' : 'form')}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Invoice Preview</Text>
          <TouchableOpacity
            onPress={() => {
              setView(selectedInvoice ? 'list' : 'form');
              setSelectedInvoice(null);
            }}
          >
            <Ionicons name="close-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.invoicePreviewContainer}>
            {/* Invoice Header */}
            <View style={styles.invoicePreviewHeader}>
              <View>
                <Text style={styles.invoicePreviewMainTitle}>INVOICE</Text>
                <Text style={styles.invoicePreviewSubtitle}>INV-{selectedInvoice._id?.substring(0, 8) || selectedInvoice.id.substring(4)}</Text>
              </View>
              <View style={styles.invoicePreviewCompanyInfo}>
                <Text style={styles.companyName}>SPARK Therapy Services</Text>
                <Text style={styles.companyAddress}>123 Therapy Lane</Text>
                <Text style={styles.companyAddress}>Cape Town, South Africa</Text>
                <Text style={styles.companyAddress}>info@sparktherapy.co.za</Text>
              </View>
            </View>
            
            {/* Client & Invoice Info */}
            <View style={styles.invoicePreviewInfo}>
              <View>
                <Text style={styles.infoTitle}>Bill To:</Text>
                <Text style={styles.infoText}>{selectedInvoice.clientName || selectedInvoice.child?.firstName + ' ' + selectedInvoice.child?.lastName}</Text>
                <Text style={styles.infoText}>
                  Parent: {clients.find(c => c.id === selectedInvoice.clientId || c._id === selectedInvoice.parentId)?.parentName || selectedInvoice.parent?.name}
                </Text>
                <Text style={styles.infoText}>
                  {clients.find(c => c.id === selectedInvoice.clientId || c._id === selectedInvoice.parentId)?.email || selectedInvoice.parent?.email}
                </Text>
              </View>
              <View>
                <View style={styles.infoGrid}>
                  <Text style={styles.infoLabel}>Invoice Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedInvoice.issuedDate || selectedInvoice.invoiceDate)}</Text>
                  <Text style={styles.infoLabel}>Due Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedInvoice.dueDate)}</Text>
                </View>
              </View>
            </View>
            
            {/* Items Table - Use real invoice data when available, fallback to items for draft invoices */}
            <View style={styles.itemsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Description</Text>
                <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>Qty</Text>
                <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>Unit Price</Text>
                <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>Total</Text>
              </View>
              {(selectedInvoice.items || [{ description: selectedInvoice.description, quantity: 1, unitPrice: selectedInvoice.amount, subtotal: selectedInvoice.amount }]).map((item, index) => (
                <View key={item.id || `item-${index}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.description || item.serviceDescription || selectedInvoice.description}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>{item.quantity || 1}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>{formatCurrency(item.unitPrice || item.rate || selectedInvoice.amount)}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>{formatCurrency(item.subtotal || item.total || selectedInvoice.amount)}</Text>
                </View>
              ))}
            </View>
            
            {/* Totals - Use real invoice data when available, fallback to calculated values */}
            <View style={styles.totalsPreviewContainer}>
              <View style={styles.totalPreviewRow}>
                <Text style={styles.totalPreviewLabel}>Subtotal:</Text>
                <Text style={styles.totalPreviewValue}>{formatCurrency(selectedInvoice.subtotal || selectedInvoice.amount || calculateTotals().subtotal)}</Text>
              </View>
              <View style={styles.totalPreviewRow}>
                <Text style={styles.totalPreviewLabel}>Discount:</Text>
                <Text style={styles.totalPreviewValue}>-{formatCurrency(selectedInvoice.discountAmount || 0)}</Text>
              </View>
              <View style={styles.totalPreviewRow}>
                <Text style={styles.totalPreviewLabel}>Tax ({selectedInvoice.taxRate || formData.taxRate}%):</Text>
                <Text style={styles.totalPreviewValue}>{formatCurrency(selectedInvoice.taxAmount || 0)}</Text>
              </View>
              <View style={[styles.totalPreviewRow, styles.totalPreviewBottom]}>
                <Text style={styles.totalPreviewLabel}>Total:</Text>
                <Text style={styles.totalPreviewValue}>{formatCurrency(selectedInvoice.totalAmount || selectedInvoice.amount)}</Text>
              </View>
            </View>
            
            {(selectedInvoice.notes || selectedInvoice.description) && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{selectedInvoice.notes || selectedInvoice.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity
            onPress={() => {
              setView(selectedInvoice ? 'list' : 'form');
              setSelectedInvoice(null);
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          {selectedInvoice.status && selectedInvoice.status !== 'draft' ? (
            <TouchableOpacity
              onPress={() => sendInvoice(selectedInvoice._id || selectedInvoice.id)}
              style={styles.primaryButton}
            >
              <Ionicons name="send-outline" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Send Invoice</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={saveInvoice}
              style={styles.primaryButton}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Save Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <View>
          <Text style={styles.screenTitle}>Invoice Management</Text>
          <Text style={styles.screenSubtitle}>Create and manage invoices for clients</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setView('payment-review')}
            style={styles.paymentReviewButton}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.paymentReviewButtonText}>Payment Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView('form')}
            style={styles.createInvoiceButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createInvoiceButtonText}>Create New Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {view === 'list' && renderListView()}
      {view === 'form' && renderFormView()}
      {view === 'preview' && renderPreviewView()}
      {view === 'payment-review' && <PaymentReview />}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  paymentReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  createInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createInvoiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 14,
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
  clientText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  invoiceDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  amountText: {
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formScroll: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    fontSize: 12,
    color: '#8b5cf6',
    marginLeft: 4,
  },
  itemsContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  descriptionInput: {
    flex: 1,
    marginRight: 8,
  },
  quantityInput: {
    width: 60,
    marginRight: 8,
  },
  priceInput: {
    width: 80,
    marginRight: 8,
  },
  subtotalText: {
    flex: 0.5,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  removeItemButton: {
    padding: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountTypeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  activeDiscountType: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  discountTypeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeDiscountTypeText: {
    color: '#fff',
  },
  discountInput: {
    flex: 1,
  },
  totalsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalBottom: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  invoicePreviewContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  invoicePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  invoicePreviewMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  invoicePreviewSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  invoicePreviewCompanyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 12,
    color: '#666',
  },
  invoicePreviewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoGrid: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  itemsTable: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  tableHeaderRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#333',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  totalsPreviewContainer: {
    marginLeft: 'auto',
    width: '50%',
    marginBottom: 24,
  },
  totalPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalPreviewBottom: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalPreviewLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPreviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notesSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default InvoiceManagement;