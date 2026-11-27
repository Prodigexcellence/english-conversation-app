// Français — langue de référence.
//
// `en.ts` et toute langue ajoutée doivent avoir EXACTEMENT les mêmes clés : le type
// `Translations` l'impose, donc `npx tsc --noEmit` signale toute traduction manquante
// ou en trop. C'est la garantie qu'aucun écran ne retombe en français par accident.
//
// Pour ajouter une langue : copier ce fichier, traduire les valeurs (pas les clés),
// puis l'inscrire dans `index.ts`. Aucun écran n'est à modifier.
//
// Les textes qui dépendent d'une valeur sont des fonctions : l'ordre des mots change
// d'une langue à l'autre, une fonction laisse chaque langue le placer où il faut.

const fr = {
  common: {
    continue: "Continuer",
    back: "Retour",
    soon: "Bientôt",
    cancel: "Annuler",
    retry: "Réessayer",
    saving: "Enregistrement…",
    pleaseWait: "Patiente…",
  },

  // Accents des partenaires. Clés alignées sur le type `Accent` de `partners.ts`.
  accents: {
    uk: "britannique",
    us: "américain",
  },

  layout: {
    missingConfigTitle: "Configuration manquante",
    missingConfigBody:
      "L'adresse du serveur Supabase n'est pas renseignée dans cette version de l'app (EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    loadErrorTitle: "Connexion impossible",
    loadErrorBody: "Ton profil n'a pas pu être chargé. Vérifie ton réseau puis réessaie.",
  },

  welcome: {
    // Dit par le partenaire : c'est la langue apprise, donc volontairement en anglais.
    bubble: "Hi! Shall we talk?",
    logoAlt: "Logo New Language",
    tagline:
      "Parle anglais avec un partenaire patient. Il lance la conversation, relance toujours et corrige en douceur.",
    createAccount: "Créer un compte",
    haveAccount: "J'ai déjà un compte",
  },

  auth: {
    tabSignup: "Inscription",
    tabLogin: "Connexion",
    titleSignup: "Crée ton compte",
    titleLogin: "Content de te revoir",
    actionSignup: "Créer mon compte",
    actionLogin: "Me connecter",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "prenom@exemple.fr",
    passwordLabel: "Mot de passe",
    passwordPlaceholderLogin: "Ton mot de passe",
    passwordPlaceholderSignup: "8 caractères minimum",
    forgotLink: "Mot de passe oublié ?",
    confirmTitle: "Confirme ton adresse",
    confirmAction: "Valider",
    resendLink: "Renvoyer un code",
    forgotTitle: "Mot de passe oublié",
    forgotAction: "Recevoir un code",
    forgotIntro: "Saisis ton adresse : tu recevras un code pour choisir un nouveau mot de passe.",
    resetTitle: "Nouveau mot de passe",
    resetAction: "Changer mon mot de passe",
    newPasswordLabel: "Nouveau mot de passe",
    codeLabel: "Code reçu par e-mail",
    codePlaceholder: "123456",
    invalidEmail: "Saisis une adresse e-mail valide, par exemple prenom@exemple.fr.",
    shortPassword: "Choisis un mot de passe d'au moins 8 caractères.",
    missingPassword: "Saisis ton mot de passe.",
    invalidCode: "Saisis le code à chiffres reçu par e-mail.",
    codeSent: (email: string) => `Un code vient d'être envoyé à ${email}.`,
    codeResent: (email: string) => `Nouveau code envoyé à ${email}.`,
    notConfirmed: (email: string) =>
      `Ton adresse n'est pas encore confirmée. Un nouveau code vient d'être envoyé à ${email}.`,
    resetCodeSent: (email: string) => `Si un compte existe pour ${email}, un code vient d'y être envoyé.`,
  },

  // Codes renvoyés par la fonction serveur « conversation », traduits par
  // `conversationErrorMessage` (lib/conversationApi.ts). Un code absent de cette liste
  // (nouveau code, ou simple coupure réseau) retombe sur `generic`.
  aiErrors: {
    aiNotConfigured: "L'IA n'est pas encore configurée. Réessaie plus tard.",
    serverNotConfigured: "Le serveur n'est pas encore configuré. Réessaie plus tard.",
    unauthorized: "Ta session a expiré. Reconnecte-toi puis réessaie.",
    dailyLimit: "Tu as atteint la limite de pratique du jour. Reviens demain !",
    aiUnavailable: "Ton partenaire ne répond pas pour l'instant. Réessaie dans un instant.",
    refused: "Ton partenaire préfère changer de sujet. Essaie une autre question.",
    sessionFinished: "Cette conversation est déjà terminée.",
    generic: "Une erreur est survenue. Réessaie dans un instant.",
  },

  // Messages d'erreur de Supabase Auth, traduits par `authErrorMessage` (lib/supabase.ts).
  authErrors: {
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    userExists: "Un compte existe déjà avec cette adresse. Utilise « Connexion ».",
    emailNotConfirmed: "Confirme d'abord ton adresse avec le code reçu par e-mail.",
    weakPassword: "Mot de passe trop faible : 8 caractères minimum.",
    samePassword: "Choisis un mot de passe différent de l'ancien.",
    otpExpired: "Ce code n'est pas bon ou a expiré. Demande un nouveau code.",
    rateLimit: "Trop de tentatives. Patiente quelques minutes puis réessaie.",
    emailInvalid: "Cette adresse e-mail n'est pas acceptée.",
    network: "Connexion impossible. Vérifie ton réseau puis réessaie.",
    generic: "Une erreur est survenue. Réessaie dans un instant.",
  },

  onboarding: {
    nativeTitle: "Quelle langue parles-tu ?",
    nativeBody: "Ton partenaire t'expliquera les choses dans cette langue quand ce sera utile.",
    targetTitle: "Quelle langue veux-tu apprendre ?",
    targetEnglish: "Anglais",
    targetSpanish: "Espagnol",
    targetMandarin: "Mandarin (chinois)",
    partnerTitle: "Avec qui veux-tu parler ?",
    partnerBody: "Tu pourras en changer à tout moment dans les réglages.",
    partnerSubtitle: (accent: string, trait: string) => `Accent ${accent} · ${trait}`,
    leoTrait: "Détendu et curieux",
    marcusTrait: "Chaleureux et encourageant",
    goalTitle: "Pourquoi apprends-tu l'anglais ?",
    goalBody: "Ton partenaire choisira des sujets qui te serviront.",
    goalWork: "Pour le travail",
    goalWorkSub: "Réunions, appels, collègues étrangers",
    goalTravel: "Pour voyager",
    goalTravelSub: "Hôtel, restaurant, aéroport, rencontres",
    goalExam: "Pour un examen",
    goalExamSub: "TOEIC, IELTS, Cambridge, oral de concours",
    goalFun: "Pour le plaisir",
    goalFunSub: "Films, séries, culture, amis",
    goalOther: "Autre",
    goalNotePlaceholder: "Dis-nous pourquoi (facultatif)",
    levelTitle: "Quel est ton niveau ?",
    levelTestOption: "Faire la conversation test",
    levelTestOptionSub: "Environ 10 minutes. Ton partenaire discute avec toi et estime ton niveau.",
    levelDeclareOption: "Je connais déjà mon niveau",
    levelDeclareOptionSub: "Sélectionne ici ton niveau. Tu pourras le changer dans les réglages.",
    myLevel: "Mon niveau",
    levelScale: "A1-A2 : débutant · B1-B2 : intermédiaire · C1-C2 : avancé",
    startTest: "Commencer le test",
    finish: "C'est parti !",
    resultTitle: "Ton niveau estimé",
    saveError: "Ton profil n'a pas pu être enregistré. Vérifie ton réseau puis réessaie.",
  },

  home: {
    greeting: "Bonjour !",
    subtitle: "Prêt à parler anglais ?",
    settings: "Réglages",
    converse: "Converser",
    converseWith: (name: string) => `Parler avec ${name}`,
    converseDesc: "Il lance la conversation, toi tu réponds à voix haute.",
    start: "Commencer",
    learn: "Apprendre",
    learnSubtitle: "Cours avec ton professeur",
    learnDesc: "Un programme qui avance selon ton niveau : grammaire, orthographe, lexique…",
    today: "Aujourd'hui",
    minutesLeft: (left: number, total: number) => `${left} min restantes sur ${total}`,
    levelAndAccent: (level: string, accent: string) => `Niveau ${level} · accent ${accent}`,
    levelUnset: "non défini",
  },

  conversation: {
    statusIdle: "à toi de parler",
    statusListening: "t'écoute…",
    statusThinking: "réfléchit…",
    statusSpeaking: "parle…",
    end: "Terminer",
    listening: "Je t'écoute…",
    // Encadre le mot corrigé : « On dit » + mot juste + « plutôt que » + mot dit.
    correctionSay: "On dit",
    correctionRatherThan: "plutôt que",
    inputPlaceholder: "Écrire en anglais…",
    writeLabel: "Écrire un message",
    send: "Envoyer",
    holdToSpeak: "Maintenir pour parler",
    hintTooShort: "Garde le doigt sur le micro pendant que tu parles.",
    hintDefault: "Maintiens le micro pour parler, ou écris ta réponse.",
    // Confirmation avant de quitter par erreur (flèche de retour) une conversation
    // en cours : sans elle, un retour accidentel perdait toute la conversation.
    leaveTitle: "Quitter la conversation ?",
    leaveBody: "Si tu reviens, tu recommenceras une nouvelle conversation depuis le début.",
    leaveConfirm: "Quitter",
  },

  summary: {
    title: "Bien joué !",
    body: "Voici ce que tu retiens de cette séance.",
    minutesShort: "min",
    secondsShort: "s",
    ofConversation: "de conversation",
    answers: "réponses en anglais",
    topics: "Sujets abordés",
    demoTopics: ["Ton week-end", "Le cinéma", "Les films comiques"],
    corrections: "Corrections à retenir",
    noCorrections: "Aucune correction cette fois : bravo, ou parle un peu plus longtemps la prochaine fois !",
    newWords: "Mots nouveaux",
    // Mots d'exemple : le mot anglais reste tel quel, seule la traduction change.
    demoWords: [
      { en: "hilarious", translation: "hilarant, très drôle" },
      { en: "to recommend", translation: "recommander, conseiller" },
      { en: "funniest", translation: "le plus drôle" },
    ],
    mock: "Maquette : les sujets et les mots sont des exemples. Les corrections viennent de ta séance.",
    speakAgain: (name: string) => `Reparler avec ${name}`,
    backHome: "Retour à l'accueil",
  },

  settings: {
    title: "Réglages",
    language: "Langue de l'application",
    partner: "Partenaire de conversation",
    accentSubtitle: (accent: string) => `Accent ${accent}`,
    myLevel: "Mon niveau",
    voiceSpeed: "Vitesse de la voix",
    speedSlow: "Lente",
    speedNormal: "Normale",
    speedFast: "Rapide",
    defaultInput: "Pour répondre, par défaut",
    inputVoice: "Je parle",
    inputText: "J'écris",
    account: "Compte",
    logout: "Me déconnecter",
    deleteAccount: "Supprimer mon compte",
    deleteTitle: "Supprimer ton compte ?",
    deleteBody:
      "Ton profil, tes conversations et tes bilans seront effacés définitivement. Cette action est irréversible.",
    deleteConfirm: "Supprimer",
    deleteFailedTitle: "Suppression impossible",
    deleteFailedBody: "Vérifie ton réseau puis réessaie.",
    autosaved: "Tes réglages sont enregistrés automatiquement.",
    saveFailed: "Ton choix n'a pas pu être enregistré. Vérifie ton réseau puis réessaie.",
  },
};

export default fr;

export type Translations = typeof fr;
