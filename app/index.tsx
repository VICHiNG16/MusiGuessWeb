import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { Colors } from '../constants/Colors';
import { searchArtists } from '../utils/itunes';
import { Ionicons } from '@expo/vector-icons';
import { SettingsModal } from '../components/SettingsModal';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideInLeft } from 'react-native-reanimated';

type ViewMode = 'MENU' | 'SINGLE' | 'MULTI';

export default function HomeScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [viewMode, setViewMode] = useState<ViewMode>('MENU');
    const [gameCode, setGameCode] = useState('');
    const [artistQuery, setArtistQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

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
        if (!selectedArtist) return;
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const isSolo = viewMode === 'SINGLE';
        router.push(`/lobby/${roomId}?isHost=true&mode=${isSolo ? 'solo' : 'multi'}&artist=${encodeURIComponent(selectedArtist)}`);
    };

    const joinRoom = () => {
        if (gameCode.length > 0) {
            router.push(`/lobby/${gameCode}?isHost=false`);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={[styles.title, isMobile && { fontSize: 42, letterSpacing: 4 }]}>MUSIGUESS</Text>
            <Text style={styles.subtitle}>LIVE</Text>
            {viewMode !== 'MENU' && (
                <Pressable onPress={() => setViewMode('MENU')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
                    <Text style={styles.backText}>Back to Menu</Text>
                </Pressable>
            )}
        </View>
    );

    const renderMenu = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.menuContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <Pressable style={styles.modeCard} onPress={() => setViewMode('SINGLE')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
                    <Ionicons name="person" size={40} color="#34C759" />
                </View>
                <Text style={styles.modeTitle}>Singleplayer</Text>
                <Text style={styles.modeDesc}>Challenge yourself and beat your high score.</Text>
            </Pressable>

            <Pressable style={styles.modeCard} onPress={() => setViewMode('MULTI')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(10, 132, 255, 0.2)' }]}>
                    <Ionicons name="people" size={40} color="#0A84FF" />
                </View>
                <Text style={styles.modeTitle}>Multiplayer</Text>
                <Text style={styles.modeDesc}>Host a game or join a friend's lobby.</Text>
            </Pressable>
        </Animated.View>
    );

    const renderArtistSearch = () => (
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
                <GlassButton title="Start Game" onPress={startGame} style={{ marginTop: 20 }} />
            )}
        </View>
    );

    const renderMultiplayer = () => (
        <Animated.View entering={SlideInRight} exiting={FadeOut} style={[styles.multiContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={styles.multiColumn}>
                <Text style={styles.columnTitle}>HOST</Text>
                {renderArtistSearch()}
            </View>

            {!isMobile && <View style={styles.verticalDivider} />}
            {isMobile && <View style={styles.divider} />}

            <View style={styles.multiColumn}>
                <Text style={styles.columnTitle}>JOIN</Text>
                <View style={styles.section}>
                    <Text style={styles.label}>ENTER CODE</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="6-Digit Room Code"
                        placeholderTextColor={Colors.textSecondary}
                        value={gameCode}
                        onChangeText={(t) => setGameCode(t.toUpperCase())}
                        maxLength={6}
                    />
                    <GlassButton title="Join Room" onPress={joinRoom} style={{ marginTop: 20 }} />
                </View>
            </View>
        </Animated.View>
    );

    const renderAbout = () => (
        <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About MusiGuess</Text>
            <Text style={styles.aboutText}>
                MusiGuess is the ultimate real-time music trivia game where you can challenge your friends or play solo to test your knowledge of your favorite artists.
            </Text>

            <Text style={styles.aboutSubtitle}>How to Play</Text>
            <Text style={styles.aboutText}>
                1. <Text style={{ fontWeight: 'bold' }}>Select an Artist:</Text> Choose from millions of artists available on iTunes.
            </Text>
            <Text style={styles.aboutText}>
                2. <Text style={{ fontWeight: 'bold' }}>Listen & Guess:</Text> You'll hear a 30-second preview of a random song. Guess the song title as fast as you can!
            </Text>
            <Text style={styles.aboutText}>
                3. <Text style={{ fontWeight: 'bold' }}>Score Points:</Text> The faster you guess, the more points you earn. Compete against friends in multiplayer mode to see who the real superfan is.
            </Text>

            <Text style={styles.disclaimer}>
                Music previews are provided courtesy of Apple iTunes. All rights belong to the respective owners. This game is for entertainment purposes only.
            </Text>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <Link href="/privacy-policy" style={styles.link}>Privacy Policy</Link>
            <Text style={styles.footerDivider}>•</Text>
            <Link href="/terms" style={styles.link}>Terms of Service</Link>
            <Text style={styles.copyright}>© 2025 MusiGuess. All rights reserved.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <SafeAreaView style={styles.content}>
                <Pressable
                    onPress={() => setSettingsVisible(true)}
                    style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
                >
                    <Ionicons name="settings-outline" size={28} color={Colors.textSecondary} />
                </Pressable>

                <SettingsModal
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%', flex: 1 }}
                >
                    {renderHeader()}

                    <View style={styles.mainContent}>
                        {viewMode === 'MENU' && renderMenu()}
                        {viewMode === 'SINGLE' && (
                            <Animated.View entering={SlideInRight} exiting={FadeOut} style={{ width: '100%', maxWidth: 500 }}>
                                {renderArtistSearch()}
                            </Animated.View>
                        )}
                        {viewMode === 'MULTI' && renderMultiplayer()}
                    </View>

                    {viewMode === 'MENU' && renderAbout()}
                    {viewMode === 'MENU' && renderFooter()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
        minHeight: '100%'
    },
    header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    title: {
        fontSize: 64,
        fontFamily: 'Outfit_900Black',
        color: Colors.primary,
        letterSpacing: 8,
        textShadowColor: Colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
        marginBottom: -10,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.text,
        letterSpacing: 12,
        opacity: 0.8,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
    backText: { color: Colors.textSecondary, fontSize: 16 },

    mainContent: { width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 60 },

    // Menu
    menuContainer: { gap: 30, alignItems: 'center' },
    modeCard: {
        width: 280,
        height: 280,
        backgroundColor: 'rgba(30, 30, 40, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        cursor: 'pointer' // Web only property
    },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20
    },
    modeTitle: { color: Colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    modeDesc: { color: Colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20 },

    // Multiplayer Layout
    multiContainer: { width: '100%', maxWidth: 900, justifyContent: 'space-between', alignItems: 'flex-start' },
    multiColumn: { flex: 1, maxWidth: 400, width: '100%' },
    columnTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    verticalDivider: { width: 1, height: 300, backgroundColor: Colors.surfaceHighlight, marginHorizontal: 40 },
    divider: { height: 1, width: '100%', backgroundColor: Colors.surfaceHighlight, marginVertical: 40 },

    // Forms
    section: { width: '100%' },
    label: { color: Colors.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceHighlight,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        fontFamily: 'System',
    },
    dropdown: {
        backgroundColor: '#1a1f35',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        marginTop: 10,
        maxHeight: 200
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    artistImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceHighlight },
    dropdownTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
    dropdownSubtitle: { color: Colors.textSecondary, fontSize: 12 },

    // About & Footer
    aboutContainer: {
        width: '100%',
        maxWidth: 800,
        padding: 30,
        backgroundColor: 'rgba(30, 30, 40, 0.4)',
        borderRadius: 24,
        marginBottom: 40
    },
    aboutTitle: {
        fontSize: 28,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 16,
        textAlign: 'center'
    },
    aboutSubtitle: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    aboutText: {
        color: Colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
        fontFamily: 'Inter_400Regular'
    },
    disclaimer: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 20,
        textAlign: 'center',
        opacity: 0.7
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    link: {
        color: Colors.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
        marginHorizontal: 10
    },
    footerDivider: {
        color: Colors.textSecondary,
        marginHorizontal: 8
    },
    copyright: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 10,
        opacity: 0.6
    }
});
