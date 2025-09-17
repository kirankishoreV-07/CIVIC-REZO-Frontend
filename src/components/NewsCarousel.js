import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65; // Reduced from 0.75

const NewsCarousel = ({ news = [], onNewsPress }) => {
  if (!news || news.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="newspaper-outline" size={20} color="#2E86C1" />
          <Text style={styles.headerTitle}>Civic News Report</Text>
        </View>
        <Text style={styles.headerTime}>Today</Text>
      </View>

      {/* Horizontal News Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12} // Reduced from 15
        snapToAlignment="start"
      >
        {news.map((article, index) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.newsCard, { marginLeft: index === 0 ? 15 : 0 }]} // Reduced from 20
            onPress={() => onNewsPress && onNewsPress(article)}
            activeOpacity={0.9}
          >
            {/* News Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.newsImage}
                resizeMode="cover"
              />
              {/* Category Badge */}
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
                <Text style={styles.categoryText}>{article.category}</Text>
              </View>
              {/* Priority Indicator */}
              {article.priority === 'high' && (
                <View style={styles.priorityIndicator}>
                  <Ionicons name="flash" size={12} color="#fff" />
                </View>
              )}
            </View>

            {/* News Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.headline} numberOfLines={2}>
                {article.headline}
              </Text>
              <Text style={styles.summary} numberOfLines={2}>
                {article.summary}
              </Text>
              
              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.sourceContainer}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.timeText}>{getTimeAgo(article.publishedAt)}</Text>
                </View>
                <Text style={styles.readTime}>{article.readTime}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
    return `${diffInMinutes}m`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days}d`;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  headerTime: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  carouselContainer: {
    paddingRight: 15, // Reduced from 20
  },
  newsCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12, // Reduced from 15
    marginRight: 12, // Reduced from 15
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120, // Reduced from 140
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 10, // Reduced from 12
  },
  headline: {
    fontSize: 12, // Reduced from 13
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: 16, // Reduced from 18
    marginBottom: 4, // Reduced from 5
  },
  summary: {
    fontSize: 10, // Reduced from 11
    color: '#7f8c8d',
    lineHeight: 13, // Reduced from 15
    marginBottom: 6, // Reduced from 8
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  readTime: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '500',
  },
});

export default NewsCarousel;
