import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicy() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true, headerTintColor: Colors.text, headerStyle: { backgroundColor: Colors.background } }} />
            <BackgroundGradient />
            <SafeAreaView style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.lastUpdated}>Last updated: December 13, 2025</Text>

                    <Section title="1. Introduction">
                        <Text style={styles.text}>
                            Welcome to MusiGuess ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website musiguess.live (the "Site") and use our services.
                        </Text>
                        <Text style={styles.text}>
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </Text>
                    </Section>

                    <Section title="2. Collection of Your Information">
                        <Text style={styles.text}>
                            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                        </Text>
                        <Subtitle title="Personal Data" />
                        <Text style={styles.text}>
                            We do not require users to register with personal information to play. We use anonymous authentication via Firebase to manage game sessions. We do not store your name, email address, or phone number unless you voluntarily provide it to us (which is currently not a feature of the Site).
                        </Text>
                        <Subtitle title="Derivative Data" />
                        <Text style={styles.text}>
                            Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                        </Text>
                    </Section>

                    <Section title="3. Use of Your Information">
                        <Text style={styles.text}>
                            We use the information we collect to:
                        </Text>
                        <View style={styles.bulletList}>
                            <Bullet>Facilitate game sessions and multiplayer functionality.</Bullet>
                            <Bullet>Compile anonymous statistical data for internal use.</Bullet>
                            <Bullet>Monitor and analyze usage and trends to improve your experience with the Site.</Bullet>
                            <Bullet>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</Bullet>
                        </View>
                    </Section>

                    <Section title="4. Disclosure of Your Information">
                        <Text style={styles.text}>
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </Text>
                        <Subtitle title="Third-Party Service Providers" />
                        <Text style={styles.text}>
                            We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.
                        </Text>
                        <Subtitle title="Google AdSense" />
                        <Text style={styles.text}>
                            We use Google AdSense to display ads. Google may use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our Site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Ads Settings.
                        </Text>
                    </Section>

                    <Section title="5. Cookie Policy">
                        <Text style={styles.text}>
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                        </Text>
                        <Text style={styles.text}>
                            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                        </Text>
                    </Section>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Subtitle = ({ title }: { title: string }) => (
    <Text style={styles.subtitle}>{title}</Text>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.bullet}>• {children}</Text>
);

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
        maxWidth: 800,
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 32,
        fontFamily: 'Inter_400Regular',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: Colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.text,
        marginTop: 12,
        marginBottom: 4,
    },
    text: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 12,
    },
    bulletList: {
        paddingLeft: 16,
        marginBottom: 12,
    },
    bullet: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 4,
    },
});
