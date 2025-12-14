import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, useWindowDimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { ModeCard } from '../components/ModeCard';
import { Colors } from '../constants/Colors';
import { searchArtists } from '../utils/itunes';
import { getCookieConsent, setCookieConsent as saveCookieConsent, getPersonalBest } from '../utils/storage';
import { ArtistResult } from '../types';
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
    const [username, setUsername] = useState('');
    const [artistQuery, setArtistQuery] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [selectedArtistImage, setSelectedArtistImage] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<ArtistResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [personalBest, setPersonalBest] = useState(0);

    // Load persisted cookie consent
    const [cookieAccepted, setCookieAccepted] = useState(() => {
        if (Platform.OS === 'web') {
            return getCookieConsent();
        }
        return true; // Always accepted on native
    });

    // Load personal best score
    useEffect(() => {
        setPersonalBest(getPersonalBest());
    }, []);

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
                setSelectedArtistImage(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [artistQuery, selectedArtist]);

    const selectArtist = (item: any) => {
        setSelectedArtist(item.artistName);
        setSelectedArtistImage(item.image);
        setArtistQuery(item.artistName);
        setSearchResults([]);
    };

    const startGame = () => {
        if (!selectedArtist) return;
        // Require username for multiplayer
        if (viewMode === 'MULTI' && !username.trim()) return;
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const isSolo = viewMode === 'SINGLE';
        const hostName = username.trim() || 'Host';
        router.push(`/lobby/${roomId}?isHost=true&mode=${isSolo ? 'solo' : 'multi'}&artist=${encodeURIComponent(selectedArtist)}&artistImage=${encodeURIComponent(selectedArtistImage || '')}&username=${encodeURIComponent(hostName)}`);
    };

    const joinRoom = () => {
        if (gameCode.length > 0 && username.trim()) {
            router.push(`/lobby/${gameCode}?isHost=false&username=${encodeURIComponent(username.trim())}`);
        }
    };

    const renderMenu = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.menuContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <ModeCard
                title="Singleplayer"
                description="Challenge yourself and beat your high score."
                icon="person"
                iconColor="#34C759"
                onPress={() => setViewMode('SINGLE')}
            />
            <ModeCard
                title="Multiplayer"
                description="Host a game or join a friend's lobby."
                icon="people"
                iconColor="#0A84FF"
                onPress={() => router.push('/username')}
            />
        </Animated.View>
    );

    const renderArtistSearch = () => (
        <View style={styles.section}>
            <Text style={styles.label}>SELECT ARTIST</Text>
            <View>
                <TextInput
                    style={[styles.input, selectedArtist ? { borderColor: Colors.primary, color: Colors.primary } : {}]}
                    placeholder="Search Artist"
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
                            onPress={() => selectArtist(item)}
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
                    title={viewMode === 'SINGLE' ? "Next" : "Start Game"}
                    onPress={startGame}
                    style={{ marginTop: 20 }}
                    disabled={viewMode === 'MULTI' && !username.trim()}
                />
            )}
        </View>
    );

    const renderMultiplayer = () => (
        <Animated.View entering={SlideInRight} exiting={FadeOut} style={[styles.multiContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={styles.multiColumn}>
                <Text style={styles.columnTitle}>HOST</Text>
                <View style={styles.section}>
                    <Text style={styles.label}>YOUR NAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor={Colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        maxLength={20}
                    />
                </View>
                {renderArtistSearch()}
            </View>

            {!isMobile && <View style={styles.verticalDivider} />}
            {isMobile && <View style={styles.divider} />}

            <View style={styles.multiColumn}>
                <Text style={styles.columnTitle}>JOIN</Text>
                <View style={styles.section}>
                    <Text style={styles.label}>YOUR NAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor={Colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        maxLength={20}
                    />
                    <Text style={[styles.label, { marginTop: 15 }]}>ROOM CODE</Text>
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
                        disabled={!username.trim() || gameCode.length < 3}
                    />
                </View>
            </View>
        </Animated.View>
    );

    const handleAcceptCookies = () => {
        setCookieAccepted(true);
        saveCookieConsent(true);
    };

    const renderCookieBanner = () => (
        !cookieAccepted && (
            <Animated.View entering={FadeIn.delay(1000)} style={styles.cookieBanner}>
                <Text style={styles.cookieText}>
                    We use cookies to personalize content and ads, to provide social media features and to analyze our traffic.
                    By using our site, you consent to our{' '}
                    <Link href="/privacy-policy" style={styles.cookieLink}>privacy policy</Link>.
                </Text>
                <View style={styles.cookieButtons}>
                    <GlassButton
                        title="Accept All"
                        onPress={handleAcceptCookies}
                        style={{ minWidth: 120 }}
                        textStyle={{ fontSize: 14 }}
                    />
                </View>
            </Animated.View>
        )
    );

    const renderFAQ = () => (
        <View style={styles.faqContainer}>
            <Text style={styles.aboutSubtitle}>Frequently Asked Questions</Text>

            <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Is MusiGuess free to play?</Text>
                <Text style={styles.faqAnswer}>Yes! MusiGuess is 100% free. You can play unlimited rounds locally or with friends.</Text>
            </View>

            <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Do I need an Apple Music subscription?</Text>
                <Text style={styles.faqAnswer}>No. We use 30-second previews provided by iTunes which are free for everyone. If you want to listen to the full song, we provide a link to Apple Music.</Text>
            </View>

            <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I play with friends?</Text>
                <Text style={styles.faqAnswer}>Absolutely. Choose "Multiplayer", share the 6-digit room code with your friends, and see who knows their music best!</Text>
            </View>
        </View>
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
            <View style={styles.footerLinks}>
                <Link href="/privacy-policy" style={styles.link}>Privacy Policy</Link>
                <Text style={styles.footerDivider}>•</Text>
                <Link href="/terms" style={styles.link}>Terms of Service</Link>
                <Text style={styles.footerDivider}>•</Text>
                <Link href="/contact" style={styles.link}>Contact Us</Link>
            </View>
            <Text style={styles.copyright}>© 2025 MusiGuess. All rights reserved.</Text>
            {personalBest > 0 && (
                <View style={styles.personalBestBadge}>
                    <Ionicons name="trophy" size={14} color={Colors.lightning} />
                    <Text style={styles.personalBestText}>Personal Best: {personalBest.toLocaleString()}</Text>
                </View>
            )}
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Logo and Title */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>MUSI</Text>
                    <Text style={styles.subtitle}>GUESS</Text>
                </View>
            </View>
        </View>
    );

    // ... (Keep existing Renders) ...

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <SafeAreaView style={styles.content}>
                {viewMode !== 'MENU' && (
                    <Pressable
                        onPress={() => setViewMode('MENU')}
                        style={styles.topLeftBackButton}
                        accessibilityLabel="Go back to menu"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.text} />
                    </Pressable>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, width: '100%' }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        style={{ width: '100%', flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Settings button - scrolls with content */}
                        <View style={styles.scrollableTopBar}>
                            <View style={{ flex: 1 }} />
                            <Pressable
                                onPress={() => setSettingsVisible(true)}
                                style={styles.topBarButton}
                            >
                                <Ionicons name="settings-outline" size={28} color={Colors.textSecondary} />
                            </Pressable>
                        </View>

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

                        {viewMode === 'MENU' && (
                            <>
                                {renderAbout()}
                                {renderFAQ()}
                            </>
                        )}
                        {viewMode === 'MENU' && renderFooter()}
                    </ScrollView>
                </KeyboardAvoidingView>

                {renderCookieBanner()}
            </SafeAreaView>

            {settingsVisible && (
                <SettingsModal onClose={() => setSettingsVisible(false)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 }, // Changed from padding: 24 to full width
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
        minHeight: '100%'
    },
    fixedTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
    },
    topBarButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    scrollableTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
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
        marginBottom: -10
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.text,
        letterSpacing: 12,
        opacity: 0.8,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoImage: {
        width: 60,
        height: 60,
    },
    titleContainer: {
        alignItems: 'flex-start',
    },
    topLeftBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        zIndex: 10,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
    backText: { color: Colors.textSecondary, fontSize: 16 },

    mainContent: { width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 60 }, // Removed flex:1

    // Menu
    menuContainer: { gap: 16, alignItems: 'center', width: '100%', maxWidth: 700, paddingHorizontal: 16 },
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
        cursor: 'pointer'
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

    // About & Footer & Cookie
    aboutContainer: {
        width: '100%',
        maxWidth: 800,
        padding: 30,
        backgroundColor: 'rgba(30, 30, 40, 0.4)',
        borderRadius: 24,
        marginBottom: 40
    },
    faqContainer: {
        width: '100%',
        maxWidth: 800,
        padding: 30,
        marginBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    faqItem: { marginBottom: 20 },
    faqQuestion: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    faqAnswer: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24 },

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
    cookieBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E24',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
        gap: 16
    },
    cookieText: {
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
        maxWidth: 600
    },
    cookieLink: {
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
    cookieButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
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
    },
    personalBestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 204, 0, 0.3)',
    },
    personalBestText: {
        color: Colors.lightning,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

