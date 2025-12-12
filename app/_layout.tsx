import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, Platform, ToastAndroid } from 'react-native';
import { Colors } from '../constants/Colors';
import { useFonts, Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';


export default function Layout() {
    const [fontsLoaded] = useFonts({
        Outfit_700Bold,
        Outfit_900Black,
        Inter_400Regular,
        Inter_600SemiBold,
    });

    // State for font loading fallback
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {

        const fontTimeout = setTimeout(() => {
            if (!fontsLoaded) {
                // Fallback to system fonts if custom fonts fail to load
                setIsReady(true);
            }
        }, 2000);
        return () => clearTimeout(fontTimeout);
    }, [fontsLoaded]);

    const [user, setUser] = useState<any>(null);
    const [authError, setAuthError] = useState<string>('');

    useEffect(() => {
        // Fallback for slow authentication
        const authTimeout = setTimeout(() => {
            if (!user) {
                setUser({ uid: 'offline-' + Date.now() });
            }
        }, 1000);

        signInAnonymously(auth)
            .then((userCredential) => {
                setUser(userCredential.user);
                clearTimeout(authTimeout);
            })
            .catch((error) => {
                setAuthError(error.message);
                // Allow offline mode on error
                setUser({ uid: 'error-' + Date.now() });
            });

        return () => clearTimeout(authTimeout);
    }, []);

    if (authError) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: Colors.error, textAlign: 'center', fontSize: 16 }}>Authentication Failed</Text>
                <Text style={{ color: Colors.text, textAlign: 'center', marginTop: 10 }}>{authError}</Text>
            </View>
        );
    }

    if (!fontsLoaded && !isReady) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <StatusBar style="light" />
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background }
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="lobby/[id]" />
                <Stack.Screen name="game/[id]" />
            </Stack>
        </View>
    );
}
