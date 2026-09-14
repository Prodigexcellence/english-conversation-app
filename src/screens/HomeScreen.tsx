import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Écran d'accueil du plan de conception (section 3) : deux boutons, rien d'autre.
// « Apprendre » (mode Professeur) est volontairement inactif — c'est la V2.

interface HomeScreenProps {
  onStartConversation: () => void;
}

export default function HomeScreen({ onStartConversation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>English practice</Text>
          <Text style={styles.subtitle}>Parle anglais avec un partenaire qui relance</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.card, styles.cardActive, pressed && styles.cardPressed]}
          onPress={onStartConversation}
          accessibilityRole="button"
        >
          <Text style={styles.cardEmoji}>🗣️</Text>
          <Text style={styles.cardTitle}>Converser</Text>
          <Text style={styles.cardDescription}>
            Discussion libre. L'IA lance la conversation et relance quand tu sèches.
          </Text>
        </Pressable>

        <View style={[styles.card, styles.cardDisabled]}>
          <Text style={[styles.cardEmoji, styles.dimmed]}>👨‍🏫</Text>
          <Text style={[styles.cardTitle, styles.dimmed]}>Apprendre</Text>
          <Text style={[styles.cardDescription, styles.dimmed]}>
            Sessions structurées avec un professeur particulier.
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bientôt — V2</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6fa' },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  intro: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1f2333' },
  subtitle: { fontSize: 15, color: '#6b7186', marginTop: 6 },
  card: {
    borderRadius: 20,
    padding: 22,
    backgroundColor: '#ffffff',
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#4c6ef5',
  },
  cardPressed: { opacity: 0.7 },
  cardDisabled: { backgroundColor: '#eceef4' },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#1f2333', marginTop: 10 },
  cardDescription: { fontSize: 14, color: '#6b7186', marginTop: 6, lineHeight: 20 },
  dimmed: { opacity: 0.45 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#d8dbe4',
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#5b6070' },
});
