import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ChatScreen from './src/screens/ChatScreen';
import HomeScreen from './src/screens/HomeScreen';

// Navigation volontairement minimale : deux écrans, un état. Pas de librairie de
// navigation tant qu'un troisième écran n'existe pas.
type Screen = 'home' | 'conversation';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'home' ? (
        <HomeScreen onStartConversation={() => setScreen('conversation')} />
      ) : (
        <ChatScreen onBack={() => setScreen('home')} />
      )}
    </SafeAreaProvider>
  );
}
