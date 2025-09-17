import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const NewsCard = ({ article, onPress, style }) => {
  if (!article) return null;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(article)}
      activeOpacity={0.95}
    >
      {/* News Label */}
      <View style={styles.newsLabel}>
        <Ionicons name="newspaper" size={14} color="#fff" />
        <Text style={styles.newsLabelText}>CITY NEWS</Text>
      </View>

      <View style={styles.content}>
        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.headline} numberOfLines={3}>
            {article.headline}
          </Text>
          <Text style={styles.summary} numberOfLines={2}>
            {article.summary}
          </Text>
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.sourceInfo}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(article.category) }]} />
              <Text style={styles.categoryText}>{article.category}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timeText}>{getTimeAgo(article.publishedAt)}</Text>
            </View>
            <View style={styles.readTimeContainer}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.readTime}>{article.readTime}</Text>
            </View>
          </View>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Priority Badge */}
          {article.priority === 'high' && (
            <View style={styles.priorityBadge}>
              <Ionicons name="flash" size={10} color="#fff" />
            </View>
          )}
        </View>
      </View>

      {/* Source Attribution */}
      <View style={styles.sourceContainer}>
        <Ionicons name="radio-outline" size={12} color="#3498db" />
        <Text style={styles.sourceText}>Source: {article.source}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'Transportation': '#3498db',
    'Infrastructure': '#e74c3c',
    'Environment': '#27ae60',
    'Technology': '#9b59b6',
    'Safety': '#f39c12',
    'Healthcare': '#1abc9c',
    'Education': '#34495e'
  };
  return colors[category] || '#95a5a6';
};

// Helper function to format time
const getTimeAgo = (publishedAt) => {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffInMinutes = Math.floor((now - published) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days}d ago`;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6, // Reduced from 8
    borderRadius: 12, // Reduced from 15
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  newsLabel: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 4, // Reduced from 6
  },
  newsLabelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    padding: 10, // Reduced from 12
  },
  textContent: {
    flex: 1,
    paddingRight: 10, // Reduced from 12
  },
  headline: {
    fontSize: 13, // Reduced from 14
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: 16, // Reduced from 18
    marginBottom: 4, // Reduced from 6
  },
  summary: {
    fontSize: 11, // Reduced from 12
    color: '#7f8c8d',
    lineHeight: 14, // Reduced from 16
    marginBottom: 6, // Reduced from 8
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 11,
    color: '#bdc3c7',
    marginHorizontal: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#666',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
    width: 60, // Reduced from 70
    height: 60, // Reduced from 70
    borderRadius: 6, // Reduced from 8
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priorityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e74c3c',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Reduced from 15
    paddingBottom: 8, // Reduced from 12
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 6, // Reduced from 10
  },
  sourceText: {
    fontSize: 10,
    color: '#3498db',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default NewsCard;
