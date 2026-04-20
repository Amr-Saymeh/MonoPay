import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withRepeat, 
    withSequence,
    withTiming,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function SplashLoading() {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const ringScale = useSharedValue(1);
    const ringOpacity = useSharedValue(0.5);

    useEffect(() => {
        // Entrance animation for Logo
        scale.value = withSpring(1, { damping: 12, stiffness: 90 });
        opacity.value = withTiming(1, { duration: 800 });

        // Pulsing Ring animation
        ringScale.value = withRepeat(
            withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
        ringOpacity.value = withRepeat(
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* Animated Background Glow */}
            <View style={styles.glowContainer}>
                <Animated.View style={[styles.ring, ringStyle]} />
            </View>

            {/* Logo Container */}
            <Animated.View style={[styles.logoWrapper, logoStyle]}>
                <Image 
                    source={require('../../../../assets/images/logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Loading Indicator Dots */}
            <View style={styles.loadingContainer}>
                <LoadingDots />
            </View>
        </View>
    );
}

function LoadingDots() {
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
        const animate = (sv: any, delay: number) => {
            sv.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        };

        animate(dot1, 0);
        setTimeout(() => animate(dot2, 200), 200);
        setTimeout(() => animate(dot3, 400), 400);
    }, []);

    const getDotStyle = (sv: any) => useAnimatedStyle(() => ({
        opacity: sv.value,
        transform: [{ translateY: interpolate(sv.value, [0, 1], [0, -5]) }]
    }));

    return (
        <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
            <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
            <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: width * 0.5,
        height: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    glowContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: (width * 0.4) / 2,
        borderWidth: 2,
        borderColor: '#a78bfa',
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#a78bfa',
    }
});
