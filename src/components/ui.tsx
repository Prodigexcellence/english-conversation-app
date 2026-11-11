import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type Colors, fonts, useColors } from "@/theme";

// Briques communes aux écrans de la maquette, toutes tirées de la charte.

export function Screen({
  children,
  scroll = true,
  footer,
  centered,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  // Centre le contenu verticalement quand il est plus court que l'écran.
  centered?: boolean;
}) {
  const c = useColors();
  const s = styles(c);
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={[s.column, centered && s.centered]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[s.column, s.fill]}>{children}</View>
      )}
      {footer ? <View style={[s.column, s.footer]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <Text style={[styles(c).title]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted, center }: { children: ReactNode; muted?: boolean; center?: boolean }) {
  const c = useColors();
  return <Text style={[styles(c).body, muted && { color: c.textMuted }, center && { textAlign: "center" }]}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={styles(c).label}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const c = useColors();
  const s = styles(c);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.button,
        variant === "primary" && { backgroundColor: c.primary },
        variant === "secondary" && { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
        variant === "danger" && { backgroundColor: c.surface, borderWidth: 1, borderColor: c.danger },
        (pressed || disabled) && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          s.buttonText,
          { color: variant === "primary" ? c.onPrimary : variant === "danger" ? c.danger : c.text },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel="Retour"
      hitSlop={8}
      style={({ pressed }) => [styles(c).iconButton, pressed && { opacity: 0.5 }]}
    >
      <SymbolView name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }} size={20} tintColor={c.text} />
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
}: {
  name: ComponentProps<typeof SymbolView>["name"];
  label: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles(c).iconButton, pressed && { opacity: 0.5 }]}
    >
      <SymbolView name={name} size={20} tintColor={c.text} />
    </Pressable>
  );
}

// Une option à choisir dans une liste : sélectionnée, disponible ou « bientôt ».
export function Option({
  title,
  subtitle,
  selected,
  soon,
  onPress,
  left,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  soon?: boolean;
  onPress?: () => void;
  left?: ReactNode;
}) {
  const c = useColors();
  const s = styles(c);
  return (
    <Pressable
      onPress={onPress}
      disabled={soon}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected, disabled: !!soon }}
      style={({ pressed }) => [
        s.option,
        selected && { borderColor: c.primary, backgroundColor: c.aiBubble },
        soon && { opacity: 0.5 },
        pressed && { opacity: 0.7 },
      ]}
    >
      {left}
      <View style={s.optionText}>
        <Text style={s.optionTitle}>{title}</Text>
        {subtitle ? <Text style={s.optionSubtitle}>{subtitle}</Text> : null}
      </View>
      {soon ? <Text style={s.soon}>Bientôt</Text> : null}
      {selected ? (
        <SymbolView name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }} size={22} tintColor={c.primary} />
      ) : null}
    </Pressable>
  );
}

// Petites pastilles pour un choix court (niveau, accent, vitesse…).
export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const c = useColors();
  const s = styles(c);
  return (
    <View style={s.chips}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={({ pressed }) => [s.chip, on && { backgroundColor: c.primary, borderColor: c.primary }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.chipText, on && { color: c.onPrimary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={[styles(c).card, style]}>{children}</View>;
}

function styles(c: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    scroll: { flexGrow: 1 },
    column: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20, gap: 16 },
    fill: { flex: 1 },
    centered: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
    footer: { paddingTop: 12, paddingBottom: 8, gap: 10 },
    title: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, color: c.text },
    body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: c.text },
    label: { fontFamily: fonts.medium, fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase", color: c.textMuted },
    button: { minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
    buttonText: { fontFamily: fonts.semibold, fontSize: 17 },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      minHeight: 64,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    optionText: { flex: 1, gap: 2 },
    optionTitle: { fontFamily: fonts.medium, fontSize: 17, color: c.text },
    optionSubtitle: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
    soon: {
      fontFamily: fonts.medium,
      fontSize: 12,
      color: c.textMuted,
      backgroundColor: c.field,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: "hidden",
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      minHeight: 44,
      minWidth: 56,
      paddingHorizontal: 16,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    chipText: { fontFamily: fonts.medium, fontSize: 15, color: c.text },
    card: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 18, gap: 12 },
  });
}
