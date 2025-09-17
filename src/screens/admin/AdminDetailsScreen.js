import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AdminDetailsScreen = ({ navigation }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAdmin = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem('userData');
            if (data) {
                setAdmin(JSON.parse(data));
            } else {
                Alert.alert('Error', 'Admin data not found.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load admin details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAdmin();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#388e3c" accessibilityLabel="Loading admin details" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    if (!admin) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle" size={48} color="#d32f2f" />
                <Text style={styles.errorText}>Unable to load admin details.</Text>
                <Button mode="contained" style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={{color: '#fff'}}>Back to Dashboard</Text>
                </Button>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            accessible
            accessibilityLabel="Admin Details Screen"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#388e3c"]} />
            }
        >
            <View>
                <LinearGradient colors={["#388e3c", "#81c784"]} style={styles.gradientHeader}>
                    <View style={styles.header}>
                        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
                        <Text style={styles.title}>{admin.fullName || 'Admin Profile'}</Text>
                        <Text style={styles.subtitle}>{admin.email}</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => Alert.alert('Edit', 'Edit feature coming soon!')}
                            accessibilityLabel="Edit profile"
                        >
                            <Ionicons name="create-outline" size={20} color="#fff" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
                <View style={styles.card}>
                    <DetailRow label="Full Name" value={admin.fullName} />
                    <DetailRow label="Email" value={admin.email} />
                    <DetailRow label="Phone Number" value={admin.phoneNumber} />
                    <DetailRow label="Department" value={admin.department} />
                    <DetailRow label="Employee ID" value={admin.employeeId} />
                    <DetailRow label="Eco Status" value="Eco Administrator" />
                    <DetailRow label="Language" value={admin.language || 'English'} />
                </View>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back to dashboard"
                >
                    <Text style={{color: '#fff'}}>Back to Dashboard</Text>
                </Button>
            </View>
        </ScrollView>
    );
};

const DetailRow = ({ label, value }) => (
    <View style={styles.row} accessible accessibilityLabel={label + ': ' + (value || '-') }>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '-'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 0,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    gradientHeader: {
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 12,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 16,
    },
    avatar: {
        backgroundColor: '#388e3c',
        marginBottom: 12,
        elevation: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e0e0',
        marginBottom: 8,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#388e3c',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 8,
        elevation: 2,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#388e3c',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    label: {
        fontSize: 16,
        color: '#616161',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#212121',
        fontWeight: '400',
        textAlign: 'right',
        maxWidth: '60%',
    },
    button: {
        backgroundColor: '#388e3c',
        alignSelf: 'center',
        width: '80%',
        marginBottom: 24,
        borderRadius: 8,
        elevation: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#388e3c',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
    },
});

export default AdminDetailsScreen;
