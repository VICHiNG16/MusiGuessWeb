import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { searchArtists } from '../utils/itunes';

export default function MultiplayerScreen() {
    const router = useRouter();
    const { username } = useLocalSearchParams();
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

    const startGame = () => {
        if (!selectedArtist || !username) return;
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        router.push(`/lobby/${roomId}?isHost=true&mode=multi&artist=${encodeURIComponent(selectedArtist)}&username=${encodeURIComponent(String(username))}`);
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
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackgroundGradient />

            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <View style={styles.userBadge}>
                    <Ionicons name="person" size={16} color={Colors.primary} />
                    <Text style={styles.userName}>{username}</Text>
                </View>
            </View>

            <Animated.View entering={FadeIn} style={[styles.content, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {/* HOST Section */}
                <Animated.View entering={SlideInLeft.delay(200)} style={styles.column}>
                    <Text style={styles.columnTitle}>HOST</Text>
                    <View style={styles.section}>
                        <Text style={styles.label}>SELECT ARTIST</Text>
                        <View>
                            <TextInput
                                style={[styles.input, selectedArtist ? { borderColor: Colors.primary, color: Colors.primary } : {}]}
                                placeholder="Search Artist (e.g. The Weeknd)"
                                placeholderTextColor={Colors.textSecondary}
                                value={artistQuery}
                                onChangeText={(t) => {
                                    setArtistQuery(t);
                                    setSelectedArtist(null);
                                }}
                            />
                            {searching && <ActivityIndicator style={{ position: 'absolute', right: 15, top: 15 }} color={Colors.primary} />}
                        </View>

                        {searchResults.length > 0 && !selectedArtist && (
                            <View style={styles.dropdown}>
                                {searchResults.map((item) => (
                                    <Pressable
                                        key={item.artistId}
                                        style={styles.dropdownItem}
                                        onPress={() => selectArtist(item.artistName)}
                                    >
                                        {item.image && (
                                            <Image source={{ uri: item.image }} style={styles.artistImage} />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.dropdownTitle}>{item.artistName}</Text>
                                            <Text style={styles.dropdownSubtitle}>{item.primaryGenreName}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {selectedArtist && (
                            <GlassButton
                                title="Create Room"
                                onPress={startGame}
                                style={{ marginTop: 20 }}
                            />
                        )}
                    </View>
                </Animated.View>

                {!isMobile && <View style={styles.verticalDivider} />}
                {isMobile && <View style={styles.divider} />}

                {/* JOIN Section */}
                <Animated.View entering={SlideInRight.delay(200)} style={styles.column}>
                    <Text style={styles.columnTitle}>JOIN</Text>
                    <View style={styles.section}>
                        <Text style={styles.label}>ROOM CODE</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="6-Digit Code"
                            placeholderTextColor={Colors.textSecondary}
                            value={gameCode}
                            onChangeText={(t) => setGameCode(t.toUpperCase())}
                            maxLength={6}
                        />
                        <GlassButton
                            title="Join Room"
                            onPress={joinRoom}
                            style={{ marginTop: 20 }}
                            disabled={gameCode.length < 3}
                        />
                    </View>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 243, 255, 0.3)',
    },
    userName: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 24,
        gap: 40,
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    columnTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 3,
        marginBottom: 20,
    },
    section: {
        width: '100%',
        maxWidth: 350,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    dropdown: {
        backgroundColor: 'rgba(0,0,0,0.8)',
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
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    artistImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    dropdownTitle: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    dropdownSubtitle: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    verticalDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'stretch',
        marginHorizontal: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '80%',
        alignSelf: 'center',
        marginVertical: 20,
    },
});
