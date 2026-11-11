import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import type { Partner } from "@/data/partners";
import { useColors } from "@/theme";

export type PartnerState = "idle" | "listening" | "thinking" | "speaking";

type Props = { partner: Partner; state: PartnerState; size: number };

// Une valeur animée stable pour toute la vie du composant.
function useAnimatedValue(initial: number) {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}

function loop(value: Animated.Value, duration: number, delay = 0) {
  return Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]),
  );
}

export function PartnerAvatar({ partner, state, size }: Props) {
  const colors = useColors();
  const breath = useAnimatedValue(0);
  const ring1 = useAnimatedValue(0);
  const ring2 = useAnimatedValue(0);
  const halo = useAnimatedValue(0);
  const dot0 = useAnimatedValue(0);
  const dot1 = useAnimatedValue(0);
  const dot2 = useAnimatedValue(0);
  const dots = [dot0, dot1, dot2];
  const [mouthOpen, setMouthOpen] = useState(false);
  const talking = state === "speaking" && Boolean(partner.talkImage);

  // Respiration légère, en permanence.
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [breath]);

  // Ondes quand il écoute.
  useEffect(() => {
    if (state !== "listening") {
      ring1.setValue(0);
      ring2.setValue(0);
      return;
    }
    const anim = Animated.parallel([loop(ring1, 1600), loop(ring2, 1600, 800)]);
    anim.start();
    return () => anim.stop();
  }, [state, ring1, ring2]);

  // Halo qui pulse quand il parle.
  useEffect(() => {
    if (state !== "speaking") {
      halo.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [state, halo]);

  // Trois points quand il réfléchit.
  useEffect(() => {
    const all = [dot0, dot1, dot2];
    if (state !== "thinking") {
      all.forEach((d) => d.setValue(0));
      return;
    }
    const anim = Animated.parallel(
      all.map((d, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 160),
            Animated.timing(d, { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0, duration: 320, useNativeDriver: true }),
            Animated.delay((2 - i) * 160),
          ]),
        ),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [state, dot0, dot1, dot2]);

  // Bouche : alterne les deux images pendant qu'il parle, si la variante existe.
  useEffect(() => {
    if (!talking) return;
    const id = setInterval(() => setMouthOpen((open) => !open), 170);
    return () => clearInterval(id);
  }, [talking]);

  const ringStyle = (v: Animated.Value) => ({
    opacity: state === "listening" ? v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }) : 0,
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.38] }) }],
  });

  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={{ width: size * 1.45, height: size * 1.45, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[styles.abs, circle, { borderColor: colors.accentSoft }, styles.ring, ringStyle(ring1)]} />
      <Animated.View style={[styles.abs, circle, { borderColor: colors.accentSoft }, styles.ring, ringStyle(ring2)]} />
      <Animated.View
        style={[
          styles.abs,
          { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6, backgroundColor: colors.accentSoft },
          {
            opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
            transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.04] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          circle,
          styles.photo,
          { borderColor: colors.surface },
          { transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] },
        ]}
      >
        <Image source={partner.image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
        {partner.talkImage ? (
          <Image
            source={partner.talkImage}
            style={[StyleSheet.absoluteFill, { opacity: talking && mouthOpen ? 1 : 0 }]}
            contentFit="cover"
            contentPosition="top"
          />
        ) : null}
      </Animated.View>
      <View style={[styles.dots, { top: size * 0.08, right: size * 0.02 }]} pointerEvents="none">
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: colors.primary },
              {
                opacity: state === "thinking" ? d.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) : 0,
                transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute" },
  ring: { borderWidth: 3 },
  photo: { overflow: "hidden", borderWidth: 4 },
  dots: { position: "absolute", flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
