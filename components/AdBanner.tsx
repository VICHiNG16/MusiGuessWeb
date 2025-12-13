import React, { useEffect, useState, memo } from 'react';
import { View, Text, Platform, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const AD_CLIENT_ID = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9555506877953640";
const AD_SLOT_ID = process.env.EXPO_PUBLIC_ADSENSE_SLOT_ID || "1234567890";

interface AdBannerProps {
    style?: any;
    format?: 'horizontal' | 'vertical' | 'rectangle';
}

function AdBannerComponent({ style, format = 'rectangle' }: AdBannerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { width } = useWindowDimensions();

    // Responsive ad sizing
    const isMobile = width < 768;

    if (Platform.OS !== 'web') return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log("AdSense error", e);
            setError(true);
            setLoading(false);
        }

        return () => clearTimeout(timer);
    }, []);

    const getAdSize = () => {
        switch (format) {
            case 'horizontal':
                return { minWidth: isMobile ? 300 : 728, minHeight: 90 };
            case 'vertical':
                return { minWidth: 160, minHeight: 600 };
            case 'rectangle':
            default:
                return { minWidth: isMobile ? 280 : 300, minHeight: 250 };
        }
    };

    const adSize = getAdSize();

    if (error) {
        return null; // Silently fail if ads don't load
    }

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>Advertisement</Text>
            <View style={[styles.adWrapper, adSize]}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={Colors.textSecondary} />
                        <Text style={styles.loadingText}>Loading ad...</Text>
                    </View>
                )}
                <div
                    style={{
                        overflow: 'hidden',
                        ...adSize,
                        opacity: loading ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                >
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
        </View>
    );
}

// Memoize to prevent unnecessary re-renders
export const AdBanner = memo(AdBannerComponent);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        marginVertical: 20,
    },
    label: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    adWrapper: {
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 45, 0.8)',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
