import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { BackgroundGradient } from '../components/BackgroundGradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfService() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Terms of Service', headerShown: true, headerTintColor: Colors.text, headerStyle: { backgroundColor: Colors.background } }} />
            <BackgroundGradient />
            <SafeAreaView style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Terms of Service</Text>
                    <Text style={styles.lastUpdated}>Last updated: December 13, 2025</Text>

                    <Section title="1. Agreement to Terms">
                        <Text style={styles.text}>
                            These Terms of Service constitute a legally binding agreement between you and MusiGuess. By accessing or using the Site, you agree to be bound by these Terms.
                        </Text>
                    </Section>

                    <Section title="2. Intellectual Property Rights">
                        <Text style={styles.text}>
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
                        </Text>
                        <Text style={styles.text}>
                            Game content, specifically music previews and artist imagery, are provided via public APIs (including iTunes) and are the property of their respective owners. We do not claim ownership of any music content streamed through our service. Music previews are provided for promotional and entertainment purposes only.
                        </Text>
                    </Section>

                    <Section title="3. User Representations">
                        <Text style={styles.text}>
                            By using the Site, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Terms of Service; (2) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site; (3) you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.
                        </Text>
                    </Section>

                    <Section title="4. Prohibited Activities">
                        <Text style={styles.text}>
                            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                        </Text>
                    </Section>

                    <Section title="5. Disclaimer">
                        <Text style={styles.text}>
                            THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK.
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
    text: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 12,
    },
});
