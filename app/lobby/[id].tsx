import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { GlassButton } from '../../components/GlassButton';
import { Colors } from '../../constants/Colors';
import { ref, set, onValue, update, get } from 'firebase/database';
import { db, auth } from '../../utils/firebaseConfig';
import { fetchMusicData } from '../../utils/itunes';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { AdBanner } from '../../components/AdBanner';

export default function LobbyScreen() {
    const { id, isHost, artist, mode, artistImage, username } = useLocalSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('waiting');
    const [players, setPlayers] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [roomData, setRoomData] = useState<any>(null);

    const isSolo = mode === 'solo';
    const currentUid = auth.currentUser?.uid;
    const [copied, setCopied] = useState(false);

    const copyRoomCode = async () => {
        if (Platform.OS === 'web') {
            try {
                await navigator.clipboard.writeText(id as string);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                console.error('Failed to copy:', e);
            }
        }
    };

    // Room Logic
    useEffect(() => {
        if (!currentUid) return;

        const roomRef = ref(db, `rooms/${id}`);

        // Listen to room updates
        const unsub = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRoomData(data);
                if (data.players) {
                    // Convert players map to array
                    const playerList = Object.entries(data.players || {}).map(([uid, info]: [string, any]) => ({
                        uid,
                        ...info
                    }));
                    setPlayers(playerList);
                }

                // Redirect to game if started
                if (data.status === 'playing') {
                    // Pass own role/idx? Not strictly needed if game screen handles it by UID
                    router.replace(`/game/${id}?mode=${data.mode || 'multi'}`);
                }
            } else if (isHost === 'true') {
                // Initialize Room if host and empty
                set(roomRef, {
                    hostUid: currentUid,
                    artist: artist,
                    artistImage: artistImage || '',
                    status: 'waiting',
                    mode: mode || 'multi',
                    createdAt: Date.now(),
                    players: {
                        [currentUid]: {
                            name: `Player 1 (Host)`,
                            score: 0,
                            isHost: true,
                            joinedAt: Date.now()
                        }
                    }
                });
            }
        });

        return () => unsub();
    }, [id, isHost, currentUid]);

    // Guest Join Logic
    useEffect(() => {
        if (!currentUid || isHost === 'true' || !roomData) return;

        // processing flag to prevent double join
        const joinRoom = async () => {
            const playerList = Object.keys(roomData.players || {});
            const isAlreadyJoined = playerList.includes(currentUid);

            if (isAlreadyJoined) return;

            if (playerList.length >= 6) {
                setError("Room is full (Max 6 Players)");
                return;
            }

            const playerNumber = playerList.length + 1;
            const playerName = username ? String(username) : `Player ${playerNumber}`;

            await update(ref(db, `rooms/${id}/players/${currentUid}`), {
                name: playerName,
                score: 0,
                isHost: false,
                joinedAt: Date.now()
            });
        };

        joinRoom();

    }, [roomData, currentUid, isHost, id]);


    const startGame = async () => {
        if (!artist || !roomData) return;
        setStatus('loading');
        try {
            const songs = await fetchMusicData(roomData.artist as string);
            if (songs.length < 5) {
                setError('Not enough songs found for this artist.');
                setStatus('waiting');
                return;
            }

            // Select 5 random songs and generate wrong choices for each
            const shuffled = songs.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 5).map((song) => {
                const wrong = songs.filter(s => s.trackId !== song.trackId)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(s => ({
                        trackName: s.trackName,
                        artworkUrl100: s.artworkUrl100,
                        trackId: s.trackId
                    }));

                const correct = {
                    trackName: song.trackName,
                    artworkUrl100: song.artworkUrl100,
                    trackId: song.trackId,
                    trackViewUrl: song.trackViewUrl // Include affiliate link
                };

                const options = [...wrong, correct].sort(() => 0.5 - Math.random());
                return {
                    ...song, // This already includes trackViewUrl from fetchMusicData map
                    options
                };
            });

            console.log("Selected songs:", selected.length, "Updating Firebase...");

            await update(ref(db, `rooms/${id}`), {
                status: 'playing',
                songs: selected,
                currentRound: 0,
                gameState: 'preview',
                roundState: {
                    startedAt: Date.now(),
                    guesses: null,
                    votes: null
                }
            });
            // Router listener will handle redirect
        } catch (e) {
            console.error(e);
            setError('Failed to start game');
            setStatus('waiting');
        }
    };

    const renderPlayer = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            layout={Layout.springify()}
            style={styles.playerCard}
        >
            <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={Colors.text} />
            </View>
            <Text style={styles.playerName}>
                {item.name} {item.uid === currentUid ? "(You)" : ""}
            </Text>
            {item.isHost && <Ionicons name="star" size={16} color={Colors.primary} style={{ marginLeft: 8 }} />}
        </Animated.View>
    );

    if (!roomData) {
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
            <View style={styles.content}>
                <Text style={styles.title}>LOBBY</Text>
                {!isSolo && (
                    <Pressable onPress={copyRoomCode} style={styles.codeContainer}>
                        <Text style={styles.code}>CODE: {id}</Text>
                        <View style={styles.copyButton}>
                            <Ionicons
                                name={copied ? "checkmark" : "copy-outline"}
                                size={18}
                                color={copied ? Colors.success : Colors.primary}
                            />
                            <Text style={[styles.copyText, copied && { color: Colors.success }]}>
                                {copied ? 'Copied!' : 'Copy'}
                            </Text>
                        </View>
                    </Pressable>
                )}

                {(roomData.artistImage || artistImage) && (
                    <Image
                        source={{ uri: (roomData.artistImage || artistImage) as string }}
                        style={styles.artistArtwork}
                    />
                )}

                <Text style={styles.artistLabel}><Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 24 }}>{roomData.artist}</Text></Text>

                {/* Host can change artist */}
                {isHost === 'true' && (
                    <Pressable
                        onPress={() => router.replace('/')}
                        style={styles.changeArtistButton}
                    >
                        <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
                        <Text style={styles.changeArtistText}>Change Artist</Text>
                    </Pressable>
                )}

                <View style={styles.playerListContainer}>
                    <Text style={styles.sectionHeader}>Players ({players.length}/6)</Text>
                    <FlatList
                        data={players.sort((a, b) => a.joinedAt - b.joinedAt)}
                        renderItem={renderPlayer}
                        keyExtractor={item => item.uid}
                        contentContainerStyle={{ gap: 10 }}
                        style={{ width: '100%', maxHeight: 300, minWidth: 300 }}
                    />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <AdBanner style={{ marginTop: 20 }} />

                {(isHost === 'true' && (players.length > 1 || isSolo)) ? (
                    <GlassButton
                        title={status === 'loading' ? "Starting..." : "START GAME"}
                        onPress={startGame}
                        style={{ marginTop: 40, width: 280 }}
                    />
                ) : (
                    isHost === 'true' ? (
                        <Text style={styles.waitingMsg}>Waiting for players to join...</Text>
                    ) : (
                        <Text style={styles.waitingMsg}>Waiting for host to start...</Text>
                    )
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
    title: { fontSize: 32, color: Colors.text, fontWeight: 'bold', marginBottom: 10 },
    code: { fontSize: 48, color: Colors.primary, fontWeight: '900', letterSpacing: 4, marginBottom: 30 },
    artistLabel: { fontSize: 20, color: Colors.textSecondary, marginBottom: 30 },
    sectionHeader: { fontSize: 14, color: Colors.textSecondary, marginBottom: 15, fontWeight: 'bold', alignSelf: 'flex-start', marginLeft: 10 },
    playerListContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
    },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 15
    },
    playerName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
    waitingMsg: { color: Colors.textSecondary, marginTop: 40, fontSize: 16, fontStyle: 'italic' },
    error: { color: Colors.error, marginTop: 20 },
    artistArtwork: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 30,
        padding: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 243, 255, 0.3)',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    copyText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    changeArtistButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        paddingHorizontal: 14,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    changeArtistText: {
        fontSize: 14,
        color: Colors.primary,
    },
});
