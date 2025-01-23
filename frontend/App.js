import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, AppRegistry, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://192.168.1.198:5000/api/transactions'); // Replace with your IP
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Add a new transaction
  const addTransaction = async () => {
    try {
      const response = await axios.post('http://192.168.1.198:5000/api/transactions', {
        type,
        category,
        amount: parseFloat(amount),
      });
      setTransactions([response.data, ...transactions]);
      setCategory('');
      setAmount('');
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://192.168.1.198:5000/api/transactions/${id}`); // Replace with your IP
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate summary (income, expenses, balance)
  const getSummary = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  };

  const { income, expenses, balance } = getSummary();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <Text style={styles.title}>Finance Tracker</Text>

        {/* Input fields for adding a transaction */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              style={styles.picker}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Income" value="income" />
              <Picker.Item label="Expense" value="expense" />
            </Picker>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addTransaction}>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Display summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Income: ${income.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Expenses: ${expenses.toFixed(2)}</Text>
          <Text style={styles.summaryText}>Balance: ${balance.toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* List of transactions */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionCategory}>{item.category}</Text>
              <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>
              <Text style={styles.transactionType}>({item.type})</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTransaction(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light green background
  },
  scrollContainer: {
    paddingTop: 60, // Added padding to avoid the iPhone notch/dynamic island
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30, // Increased margin
    textAlign: 'center',
    color: '#2E7D32', // Dark green text
  },
  formContainer: {
    marginBottom: 30, // Increased margin
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20, // Increased margin
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20, // Increased margin
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Green button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10, // Added margin to separate from the Picker
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginBottom: 30, // Increased margin
    padding: 20, // Increased padding
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 14,
    color: '#666',
  },
  transactionType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // Red button
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

// Register the root component
AppRegistry.registerComponent('main', () => App);

export default App;