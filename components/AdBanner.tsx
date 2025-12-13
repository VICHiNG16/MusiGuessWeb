import React, { useEffect } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';

const AD_CLIENT_ID = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9555506877953640";
const AD_SLOT_ID = process.env.EXPO_PUBLIC_ADSENSE_SLOT_ID || "1234567890"; // Placeholder

export function AdBanner({ style }: { style?: any }) {
    if (Platform.OS !== 'web') return null;

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log("AdSense error", e);
        }
    }, []);

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>Advertisement</Text>
            <div style={{ overflow: 'hidden', minWidth: 300, minHeight: 250 }}>
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={AD_CLIENT_ID}
                    data-ad-slot={AD_SLOT_ID}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        marginVertical: 20
    },
    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 5,
        textTransform: 'uppercase'
    }
});
