import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Pressable, ActivityIndicator, useWindowDimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { searchArtists } from '../utils/itunes';
import { ref, update } from 'firebase/database';
import { db } from '../utils/firebaseConfig';

export default function MultiplayerScreen() {
    const router = useRouter();
    const { username, roomId } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    // Redirect if no username
    useEffect(() => {
        if (!username) {
            router.replace('/username');
        }
    }, [username]);

    // Artist search state
    const [artistQuery, setArtistQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Join room state
    const [gameCode, setGameCode] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (artistQuery.length >= 2 && !selectedArtist) {
                setSearching(true);
                const results = await searchArtists(artistQuery);
                setSearchResults(results as any[]);
                setSearching(false);
            } else if (artistQuery.length === 0) {
                setSearchResults([]);
                setSelectedArtist(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [artistQuery, selectedArtist]);

    const selectArtist = (name: string) => {
        setSelectedArtist(name);
        setArtistQuery(name);
        setSearchResults([]);
    };

    const startGame = async () => {
        if (!selectedArtist || !username) return;

        if (roomId) {
            // Update existing room for Change Artist flow
            const artistData = searchResults.find(r => r.artistName === selectedArtist);
            const image = artistData ? artistData.image : '';

            try {
                await update(ref(db, `rooms/${roomId}`), {
                    artist: selectedArtist,
                    artistImage: image,
                    // Optionally reset status if needed, but usually fine to keep
                });
                router.replace(`/lobby/${roomId}?isHost=true&username=${encodeURIComponent(String(username))}`);
            } catch (e) {
                console.error("Failed to update room:", e);
            }
            return;
        }

        // Create NEW room
        const artistData = searchResults.find(r => r.artistName === selectedArtist);
        const image = artistData ? artistData.image : '';

        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        router.push(`/lobby/${newRoomId}?isHost=true&mode=multi&artist=${encodeURIComponent(selectedArtist)}&artistImage=${encodeURIComponent(image)}&username=${encodeURIComponent(String(username))}`);
    };

    const joinRoom = () => {
        if (gameCode.length > 0 && username) {
            router.push(`/lobby/${gameCode}?isHost=false&username=${encodeURIComponent(String(username))}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (!username) {
        return (
            <View style={styles.container}>
                <BackgroundGradient />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackgroundGradient />

            {/* Header */}
            <View style={[styles.header, isMobile && styles.headerMobile]}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.text} />
                </Pressable>
                <View style={styles.userBadge}>
                    <Ionicons name="person" size={14} color={Colors.primary} />
                    <Text style={styles.userName} numberOfLines={1}>{username}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeIn} style={styles.content}>
                        {/* HOST Section */}
                        <Animated.View entering={FadeInDown.delay(100)} style={[styles.card, isMobile && styles.cardMobile]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name={roomId ? "create" : "add-circle"} size={20} color={Colors.primary} />
                                <Text style={styles.cardTitle}>{roomId ? "CHANGE ARTIST" : "HOST A GAME"}</Text>
                            </View>

                            <Text style={styles.label}>SELECT ARTIST</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, selectedArtist && styles.inputSelected]}
                                    placeholder="Search Artist"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={artistQuery}
                                    onChangeText={(t) => {
                                        setArtistQuery(t);
                                        setSelectedArtist(null);
                                    }}
                                />
                                {searching && <ActivityIndicator style={styles.inputSpinner} color={Colors.primary} />}
                            </View>

                            {searchResults.length > 0 && !selectedArtist && (
                                <View style={styles.dropdown}>
                                    {searchResults.slice(0, 4).map((item) => (
                                        <Pressable
                                            key={item.artistId}
                                            style={styles.dropdownItem}
                                            onPress={() => selectArtist(item.artistName)}
                                        >
                                            {item.image && (
                                                <Image source={{ uri: item.image }} style={styles.artistImage} />
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.dropdownTitle} numberOfLines={1}>{item.artistName}</Text>
                                                <Text style={styles.dropdownSubtitle}>{item.primaryGenreName}</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {selectedArtist && (
                                <GlassButton
                                    title={roomId ? "Update Lobby" : "Create Room"}
                                    onPress={startGame}
                                    variant="success"
                                    style={{ marginTop: 16 }}
                                />
                            )}
                        </Animated.View>

                        {roomId ? null : (
                            <>
                                {/* Divider */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* JOIN Section */}
                                <Animated.View entering={FadeInDown.delay(200)} style={[styles.card, isMobile && styles.cardMobile]}>
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="enter" size={20} color={Colors.success} />
                                        <Text style={[styles.cardTitle, { color: Colors.success }]}>JOIN A GAME</Text>
                                    </View>

                                    <Text style={styles.label}>ROOM CODE</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 6-digit code"
                                        placeholderTextColor={Colors.textSecondary}
                                        value={gameCode}
                                        onChangeText={(t) => setGameCode(t.toUpperCase())}
                                        maxLength={6}
                                        autoCapitalize="characters"
                                    />
                                    <GlassButton
                                        title="Join Room"
                                        onPress={joinRoom}
                                        style={{ marginTop: 16 }}
                                        disabled={gameCode.length < 3}
                                    />
                                </Animated.View>
                            </>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex1: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    headerMobile: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 243, 255, 0.3)',
        maxWidth: 150,
    },
    userName: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    content: {
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
        gap: 20,
    },
    card: {
        backgroundColor: 'rgba(30, 30, 45, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardMobile: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    inputSelected: {
        borderColor: Colors.primary,
        color: Colors.primary,
    },
    inputSpinner: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    dropdown: {
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    artistImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    dropdownTitle: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    dropdownSubtitle: {
        color: Colors.textSecondary,
        fontSize: 11,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
});
