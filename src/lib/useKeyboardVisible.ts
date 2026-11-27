// Sur iPad, le clavier est haut : un écran qui garde tous ses éléments visibles pendant
// la saisie (avatar, titre…) pousse le plus important — les champs, la conversation —
// hors de l'écran. Ce crochet dit si le clavier est ouvert, pour que l'écran efface
// provisoirement ce qui n'est pas indispensable pendant la saisie.

import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // « Will » sur iOS : le repli commence en même temps que l'animation du clavier,
    // pas après — sans quoi l'écran saute d'un coup une fois le clavier déjà ouvert.
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
