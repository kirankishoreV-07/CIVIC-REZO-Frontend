// Test script to debug NewsService in React Native environment
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import NewsService from './src/services/NewsService';

export default function NewsDebugApp() {
  const [newsResult, setNewsResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testNewsService = async () => {
    addLog('🧪 Testing NewsService...');
    setNewsResult(null);
    
    try {
      // Test getLocationNews
      addLog('📰 Testing getLocationNews()...');
      const result = await NewsService.getLocationNews();
      
      addLog(`📊 Result: success=${result.success}, count=${result.news?.length || 0}, source=${result.source}`);
      
      if (result.news && result.news.length > 0) {
        addLog(`📰 First headline: ${result.news[0].headline}`);
      }
      
      setNewsResult(result);
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const testTopNews = async () => {
    addLog('🧪 Testing getTopNews(10)...');
    
    try {
      const result = await NewsService.getTopNews(10);
      addLog(`📊 Top News Result: success=${result.success}, count=${result.news?.length || 0}, source=${result.source}`);
      
      if (result.news && result.news.length > 0) {
        addLog(`📰 First top headline: ${result.news[0].headline}`);
      }
      
    } catch (error) {
      addLog(`❌ Top News Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>News Service Debug</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Test getLocationNews()" onPress={testNewsService} />
        <Button title="Test getTopNews(10)" onPress={testTopNews} />
        <Button title="Clear Logs" onPress={() => setLogs([])} />
      </View>

      {newsResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Result:</Text>
          <Text>Success: {newsResult.success ? 'Yes' : 'No'}</Text>
          <Text>Source: {newsResult.source}</Text>
          <Text>Count: {newsResult.news?.length || 0}</Text>
          <Text>Location: {newsResult.location || 'Unknown'}</Text>
        </View>
      )}

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  resultContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  logTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
