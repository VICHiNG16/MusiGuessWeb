import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { GlassButton } from '../components/GlassButton';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function UsernameScreen() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const isMobile = width < 768;
    const isSmallHeight = height < 600;

    const [username, setUsername] = useState('');

    const handleContinue = () => {
        if (username.trim()) {
            router.push(`/multiplayer?username=${encodeURIComponent(username.trim())}`);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        isSmallHeight && styles.scrollContentSmall
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeIn} style={styles.content}>
                        {!isSmallHeight && (
                            <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
                                <Ionicons name="person-circle" size={isMobile ? 60 : 80} color={Colors.primary} />
                            </Animated.View>
                        )}

                        <Animated.Text
                            entering={FadeInDown.delay(200)}
                            style={[styles.title, isMobile && styles.titleMobile]}
                        >
                            WHAT'S YOUR NAME?
                        </Animated.Text>

                        <Animated.Text
                            entering={FadeInDown.delay(300)}
                            style={[styles.subtitle, isMobile && styles.subtitleMobile]}
                        >
                            This will be shown to other players
                        </Animated.Text>

                        <Animated.View entering={FadeInDown.delay(400)} style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, isMobile && styles.inputMobile]}
                                placeholder="Enter your name"
                                placeholderTextColor={Colors.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                                maxLength={20}
                                autoFocus={!isMobile}
                                onSubmitEditing={handleContinue}
                                returnKeyType="done"
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
                            <GlassButton
                                title="Continue"
                                onPress={handleContinue}
                                disabled={!username.trim()}
                                style={{ width: '100%' }}
                            />

                            <GlassButton
                                title="Back"
                                onPress={handleBack}
                                variant="secondary"
                                style={{ width: '100%', marginTop: 12 }}
                            />
                        </Animated.View>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingBottom: 40,
    },
    scrollContentSmall: {
        justifyContent: 'flex-start',
        paddingTop: 40,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 1,
    },
    titleMobile: {
        fontSize: 22,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    subtitleMobile: {
        fontSize: 14,
        marginBottom: 24,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        fontSize: 18,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        textAlign: 'center',
    },
    inputMobile: {
        padding: 14,
        fontSize: 16,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
});
