import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const BottomNavigationBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  
  // Animations
  const tabPositions = React.useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;
  
  useEffect(() => {
    // Animate tab transitions
    state.routes.forEach((_, i) => {
      Animated.spring(tabPositions[i], {
        toValue: i === state.index ? 1 : 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  const getIconName = (routeName, isFocused) => {
    switch (routeName) {
      case 'Home':
        return { 
          name: isFocused ? 'home' : 'home-outline',
          type: 'ionicon'
        };
      case 'ComplaintMap':
        return { 
          name: isFocused ? 'map' : 'map-outline',
          type: 'ionicon'
        };
      case 'SubmitComplaint':
        return { 
          name: 'add-circle',
          type: 'ionicon',
          size: 52
        };
      case 'Notifications':
        return { 
          name: isFocused ? 'notifications' : 'notifications-outline',
          type: 'ionicon'
        };
      case 'Profile':
        return { 
          name: isFocused ? 'person' : 'person-outline',
          type: 'ionicon'
        };
      default:
        return { 
          name: 'help-circle',
          type: 'ionicon'
        };
    }
  };

  const renderIcon = (icon, isFocused, index) => {
    const { type, name, size = 24 } = icon;
    const color = isFocused ? '#3498db' : '#777';
    
    switch (type) {
      case 'ionicon':
        return <Ionicons name={name} size={size} color={color} />;
      case 'materialcommunity':
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
      case 'fontawesome5':
        return <FontAwesome5 name={name} size={size} color={color} />;
      default:
        return <Ionicons name={name} size={size} color={color} />;
    }
  };

  // Center button special case
  const renderCenterButton = () => {
    const centerIndex = Math.floor(state.routes.length / 2);
    const centerRoute = state.routes[centerIndex];
    const { options } = descriptors[centerRoute.key];
    const isFocused = state.index === centerIndex;
    
    const icon = getIconName(centerRoute.name, isFocused);
    
    return (
      <TouchableOpacity
        key={centerRoute.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: centerRoute.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(centerRoute.name);
          }
        }}
        style={styles.centerButtonContainer}
      >
        <View style={styles.centerButton}>
          {renderIcon(icon, true, centerIndex)}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container, 
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
    ]}>
      {Platform.OS === 'ios' && (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={80}
          tint="light"
        />
      )}
      
      <View style={styles.background} />
      
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          // Center button special case
          if (index === Math.floor(state.routes.length / 2)) {
            return renderCenterButton();
          }
          
          const icon = getIconName(route.name, isFocused);
          
          // Animations
          const translateY = tabPositions[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });
          
          const scale = tabPositions[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1.1],
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabButton}
            >
              <Animated.View 
                style={[
                  styles.tabContent,
                  {
                    transform: [
                      { translateY },
                      { scale }
                    ]
                  }
                ]}
              >
                {renderIcon(icon, isFocused, index)}
                
                {isFocused && (
                  <Text style={styles.tabLabel}>
                    {route.name.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                )}
                
                {isFocused && <View style={styles.activeIndicator} />}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'android' ? '#fff' : 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'android' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    color: '#3498db',
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3498db',
  },
  centerButtonContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default BottomNavigationBar;
