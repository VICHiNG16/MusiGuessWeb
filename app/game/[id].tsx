import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, useWindowDimensions, Linking, Vibration, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { GlassButton } from '../../components/GlassButton';
import { Colors } from '../../constants/Colors';
import { ref, update, onValue, set } from 'firebase/database';
import { db, auth } from '../../utils/firebaseConfig';
import Animated, { FadeIn, ZoomIn, FadeInUp, Layout } from 'react-native-reanimated';
import { ScoreTicker } from '../../components/ScoreTicker';
import { SongCard } from '../../components/SongCard';
import { SpeedBadge } from '../../components/SpeedBadge';
import { StreakCounter } from '../../components/StreakCounter';
import { Confetti } from '../../components/Confetti';
import { Ionicons } from '@expo/vector-icons';
import { AdBanner } from '../../components/AdBanner';
import { useSettings } from '../../context/SettingsContext';
import { calculateScore, calculateWrongScore, SPEED_TIER_INFO } from '../../utils/scoring';
import { ScoreResult, SpeedTier } from '../../types';
import { addHighScore } from '../../utils/storage';

export default function GameScreen() {
    const { id, mode } = useLocalSearchParams();
    const router = useRouter();
    const currentUid = auth.currentUser?.uid;
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [gameData, setGameData] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [currentSong, setCurrentSong] = useState<any>(null);

    // Local Game State
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [hasGuessed, setHasGuessed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);

    // New Scoring State
    const [streak, setStreak] = useState(0);
    const [lastScoreResult, setLastScoreResult] = useState<ScoreResult | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    // Derived State
    const isReveal = gameData?.gameState === 'reveal';
    const isHost = players.find(p => p.uid === currentUid)?.isHost;
    const myPlayer = players.find(p => p.uid === currentUid);
    const revealProcessed = useRef<number>(-1);

    // Initial Data Load
    useEffect(() => {
        const roomRef = ref(db, `rooms/${id}`);
        // ... (rest of initial load, omitting to focus on changes) ...
        const unsub = onValue(roomRef, (snapshot) => {
            // ... existing logic ...
            const data = snapshot.val();
            if (data) {
                setGameData(data);
                if (data.players) {
                    const list = Object.entries(data.players || {}).map(([uid, info]: [string, any]) => ({
                        uid,
                        ...info
                    }));
                    // Sort by score desc
                    setPlayers(list.sort((a, b) => b.score - a.score));
                }
                if (data.songs && data.currentRound !== undefined) {
                    setCurrentSong(data.songs[data.currentRound]);
                }
            }
        });
        return () => unsub();
    }, [id]);


    // Sudden Death Listener
    useEffect(() => {
        if (gameData?.gameState === 'preview' && gameData?.roundState?.suddenDeath) {
            setTimeRemaining(prev => Math.min(prev, 10));
        }
    }, [gameData?.roundState?.suddenDeath, gameData?.gameState]);    // Music & Timer
    const { soundEnabled, hapticsEnabled } = useSettings();

    // 1. Audio Configuration
    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        }).catch(err => console.log("Audio Config Error", err));
    }, []);

    // Volume Effect
    useEffect(() => {
        if (sound) {
            sound.setVolumeAsync(volume);
        }
    }, [volume, sound]);

    // 2. Music Player Effect (Consolidated)
    useEffect(() => {
        let currentSound: Audio.Sound | null = null;
        let isMounted = true;

        const managePlayback = async () => {
            // If in preview, we want music (IF enabled).
            if (gameData?.gameState === 'preview' && currentSong?.previewUrl && soundEnabled) {
                // Unload previous if exists in state (safety check, though we likely reconstruct)
                if (sound) {
                    try { await sound.unloadAsync(); } catch (e) { }
                }

                try {
                    // Create NEW sound, but DO NOT auto-play in creation (better control)
                    const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: currentSong.previewUrl },
                        { shouldPlay: false, isLooping: true, volume: volume }
                    );

                    if (isMounted) {
                        setSound(newSound);
                        currentSound = newSound;

                        // Attempt Autoplay
                        try {
                            await newSound.playAsync();
                            setIsPlaying(true);
                        } catch (playError) {
                            console.log("Autoplay blocked (expected on mobile):", playError);
                            // Do NOT set isPlaying true, so "PLAY MUSIC" button is valid
                            setIsPlaying(false);
                        }
                    } else {
                        newSound.unloadAsync();
                    }
                } catch (error) {
                    console.log("Error loading/playing sound:", error);
                }
            } else {
                // Review/Game Over -> Stop
                if (sound) {
                    try {
                        await sound.stopAsync();
                    } catch (e) { }
                }
                setIsPlaying(false);
            }
        };

        managePlayback();

        return () => {
            isMounted = false;
            if (currentSound) {
                currentSound.unloadAsync();
            }
        };
    }, [currentSong?.previewUrl, gameData?.gameState, soundEnabled]); // Depend on Song, State, and Settings

    // 3. Timer Effect
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameData?.gameState === 'preview') {
            timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // We rely on the separate Auto-Timeout effect or ensure logic is separate
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [gameData?.gameState]);

    // Auto-timeout trigger
    useEffect(() => {
        if (timeRemaining === 0 && gameData?.gameState === 'preview' && !hasGuessed) {
            handleGuess("TIMEOUT");
        }
    }, [timeRemaining, gameData?.gameState, hasGuessed]);

    // Initial Round Setup Effect
    useEffect(() => {
        if (gameData?.gameState === 'preview') {
            setHasGuessed(false);
            setTimeRemaining(30);
            setLastScoreResult(null);
        }
    }, [gameData?.currentRound]);

    // Keyboard shortcuts (web only)
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if in reveal or already guessed
            if (isReveal || hasGuessed || !currentSong?.options) return;

            // 1-4 keys for answer selection
            const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
            if (keyMap[e.key] !== undefined) {
                const option = currentSong.options[keyMap[e.key]];
                if (option) {
                    handleGuess(option.trackName);
                }
            }

            // Space for play/pause
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                toggleMusic();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReveal, hasGuessed, currentSong, sound, isPlaying]);


    const toggleMusic = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };



    const handleGuess = async (selectedTitle: string) => {
        if (hasGuessed || isReveal || !currentUid) return;

        if (hapticsEnabled) {
            Vibration.vibrate(10);
        }

        setHasGuessed(true);
        const isCorrect = selectedTitle === currentSong.trackName;

        // New tiered scoring system
        const elapsed = 30 - timeRemaining;
        let scoreResult: ScoreResult;

        if (isCorrect) {
            scoreResult = calculateScore(elapsed, streak, gameData?.difficulty || 'normal');
            setStreak(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else {
            scoreResult = calculateWrongScore();
            setStreak(0);
        }

        setLastScoreResult(scoreResult);

        // Push Guess with new scoring data
        await update(ref(db, `rooms/${id}/roundState/guesses/${currentUid}`), {
            guess: selectedTitle,
            scoreDelta: scoreResult.totalPoints,
            isCorrect,
            speedTier: scoreResult.speedTier,
            streakBonus: scoreResult.streakBonus,
        });
    };

    const handleGuessTimeout = () => {
        if (!hasGuessed && !isReveal) handleGuess("TIMEOUT");
    };


    // Host Logic: Check if all players guessed + Sudden Death
    useEffect(() => {
        if (isHost && gameData?.roundState?.guesses && !isReveal) {
            const guesses = Object.keys(gameData.roundState.guesses);
            const remainingPlayers = players.length - guesses.length;

            // Sudden Death: If 2 or fewer players left, force timer to 10s
            // Only trigger if we haven't already and there ARE players left
            if (remainingPlayers <= 2 && remainingPlayers > 0 && !gameData.roundState.suddenDeath && gameData.gameState === 'preview') {
                update(ref(db, `rooms/${id}/roundState`), { suddenDeath: true });
            }

            const allPlayersGuessed = players.length > 0 && guesses.length === players.length;

            if (allPlayersGuessed && revealProcessed.current !== gameData.currentRound) {
                revealProcessed.current = gameData.currentRound;

                // Update Scores & Misses
                const updates: any = { gameState: 'reveal' };
                players.forEach(p => {
                    const guessData = gameData.roundState.guesses[p.uid];
                    if (guessData) {
                        const newScore = (p.score || 0) + (guessData.scoreDelta || 0);
                        const newMisses = (p.misses || 0) + (guessData.isCorrect ? 0 : 1);
                        updates[`players/${p.uid}/score`] = newScore;
                        updates[`players/${p.uid}/misses`] = newMisses;
                    } else {
                        // If they didn't guess (timeout), it's a miss
                        const newMisses = (p.misses || 0) + 1;
                        updates[`players/${p.uid}/misses`] = newMisses;
                    }
                });

                update(ref(db, `rooms/${id}`), updates);
            }
        }
    }, [gameData?.roundState?.guesses, players, isHost, isReveal, gameData?.roundState?.suddenDeath]);


    // Host Logic: Next Round Vote Handling
    const handleNextRoundVote = async () => {
        if (!currentUid) return;
        await update(ref(db, `rooms/${id}/roundState/votes/${currentUid}`), { ready: true });
    };

    useEffect(() => {
        if (isHost && gameData?.roundState?.votes) {
            const votes = Object.keys(gameData.roundState.votes);
            // Logic: If Host votes, force next? Or wait for everyone?
            // Let's simpler: If Host is ready, go next. Or > 50%? 
            // To keep it fast: If HOST says next, we go next.
            const hostVoted = gameData.roundState.votes[players.find(p => p.isHost)?.uid || ''];

            if (hostVoted) {
                const nextRound = (gameData.currentRound || 0) + 1;
                if (nextRound >= 5) {
                    update(ref(db, `rooms/${id}`), { gameState: 'gameOver' });
                } else {
                    update(ref(db, `rooms/${id}`), {
                        currentRound: nextRound,
                        gameState: 'preview',
                        roundState: {
                            startedAt: Date.now(),
                            guesses: null,
                            votes: null
                        }
                    });
                }
            }
        }
    }, [gameData?.roundState?.votes, isHost]);


    // Rendering
    if (!gameData || !currentSong) {
        return (
            <View style={styles.container}>
                <BackgroundGradient />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (gameData.gameState === 'gameOver') {
        const winner = players[0];
        const isWinner = winner.uid === currentUid;

        const shareResults = async () => {
            const myFinalScore = myPlayer?.score || 0;
            const myRank = players.findIndex(p => p.uid === currentUid) + 1;
            const totalPlayers = players.length;

            const shareText = `🎵 MusiGuess Results 🎵\n\n` +
                `Artist: ${gameData.artist}\n` +
                `Score: ${myFinalScore.toLocaleString()} pts\n` +
                `Rank: #${myRank}/${totalPlayers}\n\n` +
                `Play now at musiguess.live`;

            if (Platform.OS === 'web') {
                try {
                    await navigator.clipboard.writeText(shareText);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                } catch (e) {
                    console.error('Failed to copy:', e);
                }
            }
        };

        return (
            <View style={styles.container}>
                <BackgroundGradient />
                <View style={styles.gameOverContainer}>
                    <View style={styles.centerContent}>
                        <Text style={styles.gameOverTitle}>{isWinner ? "VICTORY" : "GAME OVER"}</Text>
                        <Text style={styles.finalScore}>Winner: {winner.name}</Text>
                        <Text style={styles.finalScoreOpp}>Score: {winner.score}</Text>

                        <View style={styles.leaderboardContainer}>
                            {players.map((p, idx) => (
                                <View key={p.uid} style={styles.rankRow}>
                                    <Text style={styles.rankNum}>#{idx + 1}</Text>
                                    <Text style={[styles.rankName, p.uid === currentUid && { color: Colors.primary }]}>{p.name}</Text>
                                    <Text style={styles.rankScore}>{p.score}</Text>
                                </View>
                            ))}
                        </View>

                        {currentSong?.trackViewUrl && (
                            <GlassButton
                                title="Listen on Apple Music 🎵"
                                onPress={() => Linking.openURL(currentSong.trackViewUrl)}
                                style={{ marginTop: 20, backgroundColor: 'rgba(250, 35, 59, 0.2)', borderColor: '#fa233b' }}
                            />
                        )}

                        <GlassButton
                            title={shareCopied ? "Copied! ✓" : "Share Results 📋"}
                            onPress={shareResults}
                            variant={shareCopied ? "success" : "secondary"}
                            style={{ marginTop: 20 }}
                        />

                        {/* Play Again button for multiplayer */}
                        {mode !== 'solo' && isHost && (
                            <GlassButton
                                title="Play Again 🔄"
                                onPress={() => router.replace(`/lobby/${id}?isHost=true&mode=multi&artist=${encodeURIComponent(gameData.artist || '')}`)}
                                variant="success"
                                style={{ marginTop: 15 }}
                            />
                        )}

                        <GlassButton title="Return Home" onPress={() => router.replace('/')} style={{ marginTop: 15 }} />
                        <AdBanner style={{ marginTop: 30 }} />
                    </View>
                </View>
            </View>
        );
    }

    const renderLeaderboardItem = ({ item, index }: { item: any, index: number }) => {
        const isMe = item.uid === currentUid;
        const guessData = gameData?.roundState?.guesses?.[item.uid];
        const hasGuessedRound = !!guessData;

        return (
            <Animated.View layout={Layout.springify()} style={[styles.lbItem, isMe && styles.lbItemMe]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.lbRank}>#{index + 1}</Text>
                    <Text style={styles.lbName} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isReveal && guessData?.scoreDelta > 0 && (
                        <Text style={{ color: Colors.success, fontSize: 12, fontWeight: 'bold' }}>+{guessData.scoreDelta}</Text>
                    )}
                    {gameData.gameState === 'preview' && hasGuessedRound && (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    )}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.lbScore}>{item.score}</Text>
                        <Text style={{ fontSize: 10, color: Colors.error, fontWeight: 'bold' }}>{item.misses || 0} X</Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <Confetti active={showConfetti} />

            <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Left: Leaderboard (Desktop) or Compact Header (Mobile) */}
                {isMobile ? (
                    <View style={styles.mobileHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>#{players.findIndex(p => p.uid === currentUid) + 1}</Text>
                            <Text style={{ color: Colors.text, fontWeight: 'bold' }} numberOfLines={1}>{myPlayer?.name || 'You'}</Text>
                        </View>
                        <Text style={{ color: Colors.primary, fontWeight: '900', fontSize: 18 }}>{myPlayer?.score || 0}</Text>
                    </View>
                ) : (
                    <View style={styles.sidebar}>
                        <Text style={styles.sidebarTitle}>LEADERBOARD</Text>
                        <FlatList
                            data={players}
                            renderItem={renderLeaderboardItem}
                            keyExtractor={item => item.uid}
                            style={{ flex: 1, width: '100%' }}
                            contentContainerStyle={{ gap: 8 }}
                        />
                        <View style={{ marginTop: 20, alignItems: 'center' }}>
                            <Text style={styles.timer}>{timeRemaining}</Text>
                            <Text style={{ color: Colors.textSecondary }}>SECONDS</Text>

                            {/* Volume Slider for Desktop */}
                            {Platform.OS === 'web' && (
                                <View style={{ marginTop: 30, width: '100%', paddingHorizontal: 10 }}>
                                    <Text style={{ color: Colors.textSecondary, marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>VOLUME</Text>
                                    {/* @ts-ignore */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={volume}
                                        onChange={(e: any) => setVolume(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: Colors.primary, cursor: 'pointer' }}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Right: Game Area */}
                <ScrollView
                    style={{ flex: 1, width: '100%' }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ width: '100%', maxWidth: 800, alignItems: 'center' }}>
                        {/* Round Progress */}
                        <View style={styles.roundProgress}>
                            <Text style={styles.roundText}>
                                ROUND {(gameData?.currentRound || 0) + 1} / {gameData?.songs?.length || 5}
                            </Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(((gameData?.currentRound || 0) + 1) / (gameData?.songs?.length || 5)) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Mobile Timer */}
                        {isMobile && (
                            <View style={styles.mobileTimer}>
                                <Text style={styles.timerSmall}>{timeRemaining}</Text>
                            </View>
                        )}

                        {isReveal ? (
                            <Animated.View entering={FadeInUp.springify()} style={styles.revealContainer}>
                                <Image
                                    source={{ uri: currentSong.artworkUrl100 }}
                                    style={styles.artwork}
                                />
                                <Text style={styles.songTitle}>{currentSong.trackName}</Text>
                                <Text style={styles.artistName}>{currentSong.artistName}</Text>

                                {/* New Speed Badge & Streak Row */}
                                <View style={{ width: '100%', maxWidth: 350 }}>
                                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch', marginTop: 10 }}>
                                        {lastScoreResult && (
                                            <SpeedBadge
                                                tier={lastScoreResult.speedTier}
                                                points={lastScoreResult.totalPoints}
                                                visible={lastScoreResult.totalPoints > 0}
                                                style={{ flex: 1 }}
                                            />
                                        )}

                                        <StreakCounter
                                            streak={streak}
                                            visible={streak > 0}
                                            style={{ flex: 1, marginTop: 0 }}
                                        />
                                    </View>

                                    {/* Score display for wrong answer */}
                                    {lastScoreResult && lastScoreResult.totalPoints === 0 && (
                                        <Animated.Text entering={ZoomIn.delay(300)} style={[styles.deltaScore, { color: Colors.error, marginTop: 16 }]}>
                                            MISS
                                        </Animated.Text>
                                    )}

                                    {/* Buttons Row - Next Song Only */}
                                    <View style={{ width: '100%', marginTop: 20 }}>
                                        {isHost ? (
                                            <GlassButton
                                                title="NEXT SONG ▶"
                                                onPress={handleNextRoundVote}
                                                variant="success"
                                                style={{
                                                    width: '100%',
                                                    paddingVertical: 16,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                }}
                                                textStyle={{
                                                    fontSize: 16,
                                                    fontWeight: 'bold',
                                                    letterSpacing: 1
                                                }}
                                            />
                                        ) : (
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '100%',
                                                paddingVertical: 16,
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: 'rgba(255,255,255,0.1)'
                                            }}>
                                                <Text style={{
                                                    color: Colors.textSecondary,
                                                    fontStyle: 'italic',
                                                    fontWeight: 'bold',
                                                }}>Waiting for Host...</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </Animated.View>
                        ) : (
                            <View style={styles.gameplayContainer}>
                                <GlassButton
                                    title={isPlaying ? "PAUSE MUSIC" : "PLAY MUSIC"}
                                    onPress={toggleMusic}
                                    style={{ marginBottom: 30, width: 160 }}
                                />

                                {hasGuessed ? (
                                    <Animated.View entering={FadeIn} style={styles.waitingContainer}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                        <Text style={styles.waitingText}>Waiting for other players...</Text>
                                    </Animated.View>
                                ) : (
                                    <View style={styles.optionsGrid}>
                                        <View style={styles.row}>
                                            {currentSong.options?.slice(0, 2).map((option: any, idx: number) => (
                                                <SongCard
                                                    key={idx}
                                                    title={option.trackName}
                                                    artwork={option.artworkUrl100}
                                                    onPress={() => handleGuess(option.trackName)}
                                                    disabled={hasGuessed}
                                                    style={{ flex: 1 }}
                                                />
                                            ))}
                                        </View>
                                        <View style={styles.row}>
                                            {currentSong.options?.slice(2, 4).map((option: any, idx: number) => (
                                                <SongCard
                                                    key={idx + 2}
                                                    title={option.trackName}
                                                    artwork={option.artworkUrl100}
                                                    onPress={() => handleGuess(option.trackName)}
                                                    disabled={hasGuessed}
                                                    style={{ flex: 1 }}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gameLayout: { flex: 1, flexDirection: 'row' },

    // Sidebar (Desktop)
    sidebar: { width: 300, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
    sidebarTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', marginBottom: 20, letterSpacing: 2 },

    // Mobile Header - compact single row
    mobileHeader: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },

    // Leaderboard Items
    lbItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
    lbItemMe: { backgroundColor: 'rgba(10, 132, 255, 0.2)', borderColor: Colors.primary, borderWidth: 1 },
    lbRank: { color: Colors.textSecondary, fontWeight: 'bold', width: 25 },
    lbName: { color: Colors.text, fontWeight: '600', maxWidth: 120 },
    lbScore: { color: Colors.text, fontWeight: '900' },

    mainArea: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },

    timer: { fontSize: 64, color: Colors.primary, fontWeight: '900' },
    mobileTimer: { position: 'absolute', top: 20, right: 20, width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
    timerSmall: { fontSize: 20, color: Colors.primary, fontWeight: 'bold' },

    // Game Elements
    gameplayContainer: { width: '100%', maxWidth: 800, alignItems: 'center', flex: 1, justifyContent: 'center' },
    optionsGrid: { width: '100%', gap: 12, flex: 1, justifyContent: 'center' },
    row: { flexDirection: 'row', gap: 12, height: '45%' },

    // Reveal
    revealContainer: { alignItems: 'center', width: '100%', paddingBottom: 40 },
    artwork: { width: 220, height: 220, marginBottom: 24, borderWidth: 1, borderColor: '#fff' },
    songTitle: { color: Colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: -1 },
    artistName: { color: Colors.primary, fontSize: 16, marginBottom: 24, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
    deltaScore: { fontSize: 48, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
    waitingTextReveal: { color: Colors.textSecondary, marginTop: 20, fontStyle: 'italic' },

    // Waiting
    waitingContainer: { alignItems: 'center', gap: 20 },
    waitingText: { color: Colors.text, fontSize: 18, opacity: 0.8 },

    // Game Over
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    centerContent: { alignItems: 'center', width: '100%', maxWidth: 500 },
    gameOverTitle: { fontSize: 48, color: Colors.primary, fontWeight: '900', marginBottom: 20 },
    finalScore: { fontSize: 24, color: Colors.text, marginBottom: 5 },
    finalScoreOpp: { fontSize: 18, color: Colors.textSecondary, marginBottom: 30 },
    leaderboardContainer: { width: '100%', gap: 10 },
    rankRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
    rankNum: { color: Colors.textSecondary, fontWeight: 'bold' },
    rankName: { color: Colors.text, fontWeight: 'bold' },
    rankScore: { color: Colors.primary, fontWeight: '900' },

    // Round Progress
    roundProgress: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    roundText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    progressBar: {
        width: '80%',
        maxWidth: 300,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
});
