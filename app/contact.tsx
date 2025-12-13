import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Linking, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/Colors';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassButton } from '../components/GlassButton';
import { Ionicons } from '@expo/vector-icons';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        // For now, open email client with pre-filled message
        const subject = encodeURIComponent(`MusiGuess Contact: ${name}`);
        const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
        const mailtoLink = `mailto:contact@musiguess.live?subject=${subject}&body=${body}`;

        if (Platform.OS === 'web') {
            window.open(mailtoLink, '_blank');
        } else {
            Linking.openURL(mailtoLink);
        }

        setSubmitted(true);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Contact Us',
                    headerShown: true,
                    headerTintColor: Colors.text,
                    headerStyle: { backgroundColor: Colors.background }
                }}
            />
            <BackgroundGradient />
            <SafeAreaView style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Contact Us</Text>
                    <Text style={styles.subtitle}>
                        We'd love to hear from you! Whether you have a question, feedback, or just want to say hello.
                    </Text>

                    {submitted ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                            <Text style={styles.successTitle}>Thank You!</Text>
                            <Text style={styles.successText}>
                                Your message has been prepared. Please send it through your email client.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your name"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>EMAIL</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="your.email@example.com"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>MESSAGE</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="How can we help you?"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                />
                            </View>

                            <GlassButton
                                title="Send Message"
                                onPress={handleSubmit}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    )}

                    <View style={styles.alternativeContact}>
                        <Text style={styles.alternativeTitle}>Other Ways to Reach Us</Text>

                        <Pressable
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('mailto:contact@musiguess.live')}
                        >
                            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                            <Text style={styles.contactText}>contact@musiguess.live</Text>
                        </Pressable>

                        <View style={styles.socialLinks}>
                            <Text style={styles.socialTitle}>Follow Us</Text>
                            <View style={styles.socialIcons}>
                                <Pressable style={styles.socialIcon}>
                                    <Ionicons name="logo-twitter" size={24} color={Colors.textSecondary} />
                                </Pressable>
                                <Pressable style={styles.socialIcon}>
                                    <Ionicons name="logo-instagram" size={24} color={Colors.textSecondary} />
                                </Pressable>
                                <Pressable style={styles.socialIcon}>
                                    <Ionicons name="logo-discord" size={24} color={Colors.textSecondary} />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={styles.faqTeaser}>
                        <Text style={styles.faqTitle}>Have a Question?</Text>
                        <Text style={styles.faqText}>
                            Check out our FAQ section on the homepage for answers to common questions about MusiGuess.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondary,
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceHighlight,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
    },
    textArea: {
        minHeight: 120,
        paddingTop: 16,
    },
    successContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 16,
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    successText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    alternativeContact: {
        marginBottom: 32,
    },
    alternativeTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 16,
    },
    contactMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 16,
    },
    contactText: {
        fontSize: 16,
        color: Colors.text,
    },
    socialLinks: {
        marginTop: 16,
    },
    socialTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    socialIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    faqTeaser: {
        padding: 24,
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    faqTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 8,
    },
    faqText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
