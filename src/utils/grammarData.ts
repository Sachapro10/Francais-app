export interface PropositionDetail {
  text: string;
  type: 'Principale' | 'Juxtaposées' | 'Coordonnées' | 'Subordonnée relative' | 'Subordonnée complétive' | 'Subordonnée circonstancielle';
}

export interface GrammarSentence {
  id: number;
  rawText: string;
  bracketedText: string;
  verbs: string[];
  propositions: PropositionDetail[];
  ruleExplanation?: string;
  hint?: string;
  difficulty?: 'Facile' | 'Intermédiaire' | 'Avancé';
  topicId?: string;
}

export type VerbModeType =
  | 'indicatif'
  | 'subjonctif'
  | 'imperatif'
  | 'infinitif'
  | 'participe'
  | 'gerondif';

export const VERB_MODE_LABELS: Record<VerbModeType, string> = {
  indicatif: 'Indicatif — réalité',
  subjonctif: 'Subjonctif — possibilité',
  imperatif: 'Impératif — ordre',
  infinitif: 'Infinitif — valeur nominale',
  participe: 'Participe — valeur adjectivale',
  gerondif: 'Gérondif — valeur adverbiale',
};

export const VERB_MODE_GROUPS: { label: string; modes: VerbModeType[] }[] = [
  { label: 'Modes personnels', modes: ['indicatif', 'subjonctif', 'imperatif'] },
  { label: 'Modes impersonnels', modes: ['infinitif', 'participe', 'gerondif'] },
];

export interface ModeSentence {
  id: number;
  rawText: string;
  /** comma-separated verb forms found in the sentence */
  verbs: string[];
  modeType: VerbModeType;
  /** human-readable explanation of the mode's value in context */
  modeExplanation: string;
  /** full analysis text */
  answer: string;
}

export interface EafGrammarTopic {
  id: string;
  title: string;
  shortName: string;
  officialTheme: string;
  description: string;
  methodSteps: string[];
  examples: {
    question: string;
    sentence: string;
    answer: string;
    bareme: string;
  }[];
}

export const EAF_GRAMMAR_TOPICS: EafGrammarTopic[] = [
  {
    id: 'proposition',
    title: '1. La Proposition (Analyse Logique)',
    shortName: 'Proposition',
    officialTheme: "Identifier et classer les propositions dans une phrase complexe",
    description: 'Découpez la phrase en propositions, identifiez la proposition principale et classez les propositions subordonnées.',
    methodSteps: [
      '1. Comptez les verbes conjugués = nombre de propositions.',
      '2. Trouvez la proposition principale (celle qui peut exister seule).',
      '3. Identifiez les mots de subordination ou coordination (qui, que, quand, si, mais, et…).',
      '4. Précisez la nature : principale, relative, complétive ou circonstancielle.'
    ],
    examples: [
      {
        question: "Analysez la structure de la phrase en propositions et identifiez leur nature.",
        sentence: "Je pense qu'il viendra demain.",
        answer: "Deux propositions : « Je pense » (principale) et « qu'il viendra demain » (subordonnée complétive introduite par « que », COD du verbe « pense »).",
        bareme: "1 pt découpage / 1 pt nature correcte."
      },
      {
        question: "Identifiez les propositions : « Le chat qui dort est gris. »",
        sentence: 'Le chat qui dort est gris.',
        answer: "« Le chat est gris » (principale) et « qui dort » (subordonnée relative, relative du sujet « chat »).",
        bareme: "1 pt principale / 1 pt relative."
      },
      {
        question: "Repérez la principale et la subordonnée circonstancielle, puis précisez sa valeur.",
        sentence: "Bien qu'il soit tard, les lecteurs continuent leur travail.",
        answer: "« les lecteurs continuent leur travail » est la principale. « Bien qu'il soit tard » est une subordonnée circonstancielle de concession, introduite par « bien que » et construite au subjonctif.",
        bareme: "1 pt découpage / 1 pt nature et valeur."
      },
      {
        question: "Quelle est la nature de « que tu as choisie » et quel nom complète-t-elle ?",
        sentence: "La route que tu as choisie traverse la forêt.",
        answer: "« La route traverse la forêt » est la principale. « que tu as choisie » est une subordonnée relative introduite par le pronom relatif « que » ; elle complète le nom « route ».",
        bareme: "1 pt nature / 1 pt antécédent."
      },
      {
        question: "Distinguez les propositions coordonnées et juxtaposées.",
        sentence: "Le vent tombe, la mer se calme et les bateaux repartent.",
        answer: "« Le vent tombe » et « la mer se calme » sont juxtaposées par une virgule. « les bateaux repartent » est coordonnée à la précédente par « et ».",
        bareme: "1 pt découpage / 1 pt relations."
      }
    ]
  },
  {
    id: 'modes_verbe',
    title: '2. Les modes du verbe',
    shortName: 'Modes du verbe',
    officialTheme: 'Les modes personnels et impersonnels et leur valeur',
    description: "On distingue deux groupes de modes : les modes personnels (indicatif, subjonctif, impératif) et les modes impersonnels (infinitif, participe, gérondif). Chaque mode a une valeur caractéristique.",
    methodSteps: [
      '1. Modes personnels : indicatif (réalité), subjonctif (possibilité) et impératif (ordre).',
      '2. Modes impersonnels : infinitif (valeur nominale), participe (valeur adjectivale) et gérondif (valeur adverbiale).',
      '3. Repérez la forme du verbe et observez sa construction dans la phrase.',
      '4. Nommez le mode et justifiez sa valeur à partir du contexte.'
    ],
    examples: [
      {
        question: 'Identifiez le mode du verbe « est » et sa valeur.',
        sentence: 'La Terre est ronde.',
        answer: "« Est » est à l'indicatif, un mode personnel. Il présente comme réelle l'information selon laquelle la Terre est ronde.",
        bareme: 'Mode indicatif / valeur de réalité.'
      },
      {
        question: 'Identifiez le mode du verbe « vienne » et sa valeur.',
        sentence: 'Il est possible que Léa vienne.',
        answer: '« Vienne » est au subjonctif, un mode personnel. Il exprime ici une possibilité, introduite par « il est possible que ».',
        bareme: 'Mode subjonctif / valeur de possibilité.'
      },
      {
        question: 'Identifiez le mode du verbe « fermez » et sa valeur.',
        sentence: 'Fermez la porte !',
        answer: "« Fermez » est à l'impératif, un mode personnel. Il exprime un ordre adressé à la personne qui écoute.",
        bareme: 'Mode impératif / valeur d’ordre.'
      },
      {
        question: 'Identifiez le mode du verbe « lire » et sa valeur.',
        sentence: 'Lire chaque jour enrichit le vocabulaire.',
        answer: '« Lire » est à l’infinitif, un mode impersonnel. Le groupe infinitif « lire chaque jour » occupe la fonction de sujet : il a une valeur nominale.',
        bareme: 'Mode infinitif / valeur nominale.'
      },
      {
        question: 'Identifiez le mode du verbe « blessé » et sa valeur.',
        sentence: 'Un soldat blessé attendait les secours.',
        answer: '« Blessé » est un participe passé, un mode impersonnel. Il qualifie le nom « soldat » comme un adjectif : il a une valeur adjectivale.',
        bareme: 'Mode participe / valeur adjectivale.'
      },
      {
        question: 'Identifiez le mode du verbe « écoutant » et sa valeur.',
        sentence: 'Elle révise en écoutant de la musique.',
        answer: '« En écoutant » est au gérondif, un mode impersonnel. Le groupe précise dans quelle circonstance elle révise et fonctionne comme un complément adverbial : il a une valeur adverbiale.',
        bareme: 'Mode gérondif / valeur adverbiale.'
      }
    ]
  }
];

// ─── Proposition Analysis Exercises ───────────────────────────────────────
export const GRAMMAR_SENTENCES: GrammarSentence[] = [
  {
    id: 1,
    rawText: "Le vent souffle et la pluie tombe sur le toit.",
    bracketedText: "[Le vent souffle] Prop 1 [et la pluie tombe sur le toit] Prop 2",
    verbs: ["souffle", "tombe"],
    propositions: [
      { text: "Le vent souffle", type: "Principale" },
      { text: "la pluie tombe sur le toit", type: "Coordonnées" }
    ],
    ruleExplanation: "Les deux propositions sont coordonnées par la conjonction 'et'.",
    topicId: 'proposition'
  },
  {
    id: 2,
    rawText: "Je pense qu'il viendra demain soir.",
    bracketedText: "[Je pense] Prop 1 [qu'il viendra demain soir] Prop 2",
    verbs: ["pense", "viendra"],
    propositions: [
      { text: "Je pense", type: "Principale" },
      { text: "qu'il viendra demain soir", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La proposition subordonnée commence par 'que' et complète le verbe 'pense'.",
    topicId: 'proposition'
  },
  {
    id: 3,
    rawText: "Il pleut ; je prends mon parapluie.",
    bracketedText: "[Il pleut] Prop 1 ; [je prends mon parapluie] Prop 2",
    verbs: ["pleut", "prends"],
    propositions: [
      { text: "Il pleut", type: "Principale" },
      { text: "je prends mon parapluie", type: "Juxtaposées" }
    ],
    ruleExplanation: "Les deux propositions sont séparées par un point-virgule sans mot de liaison.",
    topicId: 'proposition'
  },
  {
    id: 4,
    rawText: "Le chat qui dort sur le tapis est gris.",
    bracketedText: "[Le chat [qui dort sur le tapis] Prop 2 est gris] Prop 1",
    verbs: ["dort", "est"],
    propositions: [
      { text: "Le chat est gris", type: "Principale" },
      { text: "qui dort sur le tapis", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'qui' est un pronom relatif qui complète le nom 'chat'.",
    topicId: 'proposition'
  },
  {
    id: 5,
    rawText: "Quand le soleil se lève, les oiseaux chantent.",
    bracketedText: "[Quand le soleil se lève] Prop 2, [les oiseaux chantent] Prop 1",
    verbs: ["lève", "chantent"],
    propositions: [
      { text: "les oiseaux chantent", type: "Principale" },
      { text: "Quand le soleil se lève", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Quand' introduit une subordonnée circonstancielle de temps.",
    topicId: 'proposition'
  },
  {
    id: 6,
    rawText: "Il travaille dur car il veut réussir.",
    bracketedText: "[Il travaille dur] Prop 1 [car il veut réussir] Prop 2",
    verbs: ["travaille", "veut"],
    propositions: [
      { text: "Il travaille dur", type: "Principale" },
      { text: "il veut réussir", type: "Coordonnées" }
    ],
    ruleExplanation: "'car' est une conjonction de coordination exprimant la cause.",
    topicId: 'proposition'
  },
  {
    id: 7,
    rawText: "Je sais que tu as raison.",
    bracketedText: "[Je sais] Prop 1 [que tu as raison] Prop 2",
    verbs: ["sais", "as"],
    propositions: [
      { text: "Je sais", type: "Principale" },
      { text: "que tu as raison", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "'que' introduit une complétive, COD du verbe 'sais'.",
    topicId: 'proposition'
  },
  {
    id: 8,
    rawText: "Tu manges, je bois, nous discutons.",
    bracketedText: "[Tu manges] Prop 1, [je bois] Prop 2, [nous discutons] Prop 3",
    verbs: ["manges", "bois", "discutons"],
    propositions: [
      { text: "Tu manges", type: "Principale" },
      { text: "je bois", type: "Juxtaposées" },
      { text: "nous discutons", type: "Juxtaposées" }
    ],
    ruleExplanation: "Trois propositions juxtaposées par des virgules.",
    topicId: 'proposition'
  },
  {
    id: 9,
    rawText: "La maison que nous avons achetée est spacieuse.",
    bracketedText: "[La maison [que nous avons achetée] Prop 2 est spacieuse] Prop 1",
    verbs: ["avons achetée", "est"],
    propositions: [
      { text: "La maison est spacieuse", type: "Principale" },
      { text: "que nous avons achetée", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'que' est un pronom relatif COD de 'achetée'.",
    topicId: 'proposition'
  },
  {
    id: 10,
    rawText: "Si tu viens demain, nous irons au cinéma.",
    bracketedText: "[Si tu viens demain] Prop 2, [nous irons au cinéma] Prop 1",
    verbs: ["viens", "irons"],
    propositions: [
      { text: "nous irons au cinéma", type: "Principale" },
      { text: "Si tu viens demain", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Si' introduit une circonstancielle de condition/hypothèse.",
    topicId: 'proposition'
  },
  {
    id: 11,
    rawText: "Elle chante et il danse mais personne n'applaudit.",
    bracketedText: "[Elle chante] Prop 1 [et il danse] Prop 2 [mais personne n'applaudit] Prop 3",
    verbs: ["chante", "danse", "applaudit"],
    propositions: [
      { text: "Elle chante", type: "Principale" },
      { text: "il danse", type: "Coordonnées" },
      { text: "personne n'applaudit", type: "Coordonnées" }
    ],
    ruleExplanation: "Propositions coordonnées par 'et' et 'mais'.",
    topicId: 'proposition'
  },
  {
    id: 12,
    rawText: "Je crois qu'elle a raison.",
    bracketedText: "[Je crois] Prop 1 [qu'elle a raison] Prop 2",
    verbs: ["crois", "a"],
    propositions: [
      { text: "Je crois", type: "Principale" },
      { text: "qu'elle a raison", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "'que' introduit une complétive COD de 'crois'.",
    topicId: 'proposition'
  },
  {
    id: 13,
    rawText: "Puisque tu insistes, j'accepte ton invitation.",
    bracketedText: "[Puisque tu insistes] Prop 2, [j'accepte ton invitation] Prop 1",
    verbs: ["insistes", "accepte"],
    propositions: [
      { text: "j'accepte ton invitation", type: "Principale" },
      { text: "Puisque tu insistes", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Puisque' introduit une circonstancielle de cause.",
    topicId: 'proposition'
  },
  {
    id: 14,
    rawText: "Le livre dont je t'ai parlé est excellent.",
    bracketedText: "[Le livre [dont je t'ai parlé] Prop 2 est excellent] Prop 1",
    verbs: ["ai parlé", "est"],
    propositions: [
      { text: "Le livre est excellent", type: "Principale" },
      { text: "dont je t'ai parlé", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'dont' est un pronom relatif qui remplace 'de qui / de quoi'.",
    topicId: 'proposition'
  },
  {
    id: 15,
    rawText: "Il fait beau donc nous sortons.",
    bracketedText: "[Il fait beau] Prop 1 [donc nous sortons] Prop 2",
    verbs: ["fait", "sortons"],
    propositions: [
      { text: "Il fait beau", type: "Principale" },
      { text: "nous sortons", type: "Coordonnées" }
    ],
    ruleExplanation: "'donc' est une conjonction de coordination qui indique la conséquence.",
    topicId: 'proposition'
  },
  {
    id: 16,
    rawText: "Bien que je sois fatigué, je continue à travailler.",
    bracketedText: "[Bien que je sois fatigué] Prop 2, [je continue à travailler] Prop 1",
    verbs: ["sois", "continue"],
    propositions: [
      { text: "je continue à travailler", type: "Principale" },
      { text: "Bien que je sois fatigué", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Bien que' introduit une circonstancielle de concession. Le subjonctif est exigé.",
    topicId: 'proposition'
  },
  {
    id: 17,
    rawText: "Il parle ; elle écoute attentivement.",
    bracketedText: "[Il parle] Prop 1 ; [elle écoute attentivement] Prop 2",
    verbs: ["parle", "écoute"],
    propositions: [
      { text: "Il parle", type: "Principale" },
      { text: "elle écoute attentivement", type: "Juxtaposées" }
    ],
    ruleExplanation: "Point-virgule sans mot de liaison : propositions juxtaposées.",
    topicId: 'proposition'
  },
  {
    id: 18,
    rawText: "Où que tu ailles, je te retrouverai.",
    bracketedText: "[Où que tu ailles] Prop 2, [je te retrouverai] Prop 1",
    verbs: ["ailles", "retrouverai"],
    propositions: [
      { text: "je te retrouverai", type: "Principale" },
      { text: "Où que tu ailles", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Où que' avec subjonctif exprime la concession (quel que soit le lieu).",
    topicId: 'proposition'
  },
  {
    id: 19,
    rawText: "L'homme qui rit est heureux.",
    bracketedText: "[L'homme [qui rit] Prop 2 est heureux] Prop 1",
    verbs: ["rit", "est"],
    propositions: [
      { text: "L'homme est heureux", type: "Principale" },
      { text: "qui rit", type: "Subordonnée relative" }
    ],
    ruleExplanation: "Pronom relatif 'qui' sujet du verbe 'rit'.",
    topicId: 'proposition'
  },
  {
    id: 20,
    rawText: "Je doute qu'il puisse venir.",
    bracketedText: "[Je doute] Prop 1 [qu'il puisse venir] Prop 2",
    verbs: ["doute", "puisse"],
    propositions: [
      { text: "Je doute", type: "Principale" },
      { text: "qu'il puisse venir", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "Le verbe 'douter' exige le subjonctif dans la complétive.",
    topicId: 'proposition'
  },
  {
    id: 21,
    rawText: "André arrive demain ; Marie rentre ce soir.",
    bracketedText: "[André arrive demain] Prop 1 ; [Marie rentre ce soir] Prop 2",
    verbs: ["arrive", "rentre"],
    propositions: [
      { text: "André arrive demain", type: "Juxtaposées" },
      { text: "Marie rentre ce soir", type: "Juxtaposées" }
    ],
    ruleExplanation: "Point-virgule entre deux propositions sans mot de liaison : elles sont juxtaposées.",
    topicId: 'proposition'
  },
  {
    id: 22,
    rawText: "Le garçon à qui tu parles est mon frère.",
    bracketedText: "[Le garçon [à qui tu parles] Prop 2 est mon frère] Prop 1",
    verbs: ["parles", "est"],
    propositions: [
      { text: "Le garçon est mon frère", type: "Principale" },
      { text: "à qui tu parles", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'à qui' combine préposition et pronom relatif pour compléter 'parles'.",
    topicId: 'proposition'
  },
  {
    id: 23,
    rawText: "Nous irons à la plage pourvu que le temps soit beau.",
    bracketedText: "[Nous irons à la plage] Prop 1 [pourvu que le temps soit beau] Prop 2",
    verbs: ["irons", "soit"],
    propositions: [
      { text: "Nous irons à la plage", type: "Principale" },
      { text: "pourvu que le temps soit beau", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Pourvu que' introduit une circonstancielle de souhait/condition et exige le subjonctif.",
    topicId: 'proposition'
  },
  {
    id: 24,
    rawText: "Bien que la route soit longue, nous partons ce matin.",
    bracketedText: "[Bien que la route soit longue] Prop 2, [nous partons ce matin] Prop 1",
    verbs: ["soit", "partons"],
    propositions: [
      { text: "nous partons ce matin", type: "Principale" },
      { text: "Bien que la route soit longue", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Bien que' introduit une circonstancielle de concession. Le subjonctif est attendu.",
    topicId: 'proposition'
  },
  {
    id: 25,
    rawText: "André mange une pomme et Léo lit un roman.",
    bracketedText: "[André mange une pomme] Prop 1 [et Léo lit un roman] Prop 2",
    verbs: ["mange", "lit"],
    propositions: [
      { text: "André mange une pomme", type: "Principale" },
      { text: "Léo lit un roman", type: "Coordonnées" }
    ],
    ruleExplanation: "'Et' coordonne deux propositions principales de même niveau.",
    topicId: 'proposition'
  },
  {
    id: 26,
    rawText: "Comme il faisait froid, nous avons allumé le chauffage.",
    bracketedText: "[Comme il faisait froid] Prop 2, [nous avons allumé le chauffage] Prop 1",
    verbs: ["faisait", "avons allumé"],
    propositions: [
      { text: "nous avons allumé le chauffage", type: "Principale" },
      { text: "Comme il faisait froid", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Comme' en tête de phrase introduit une circonstancielle de cause.",
    topicId: 'proposition'
  },
  {
    id: 27,
    rawText: "On dit que la terre est ronde depuis l'Antiquité.",
    bracketedText: "[On dit] Prop 1 [que la terre est ronde depuis l'Antiquité] Prop 2",
    verbs: ["dit", "est"],
    propositions: [
      { text: "On dit", type: "Principale" },
      { text: "que la terre est ronde depuis l'Antiquité", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "'Que' introduit une complétive, COD du verbe 'dit'. Le verbe de la complétive est à l'indicatif.",
    topicId: 'proposition'
  },
  {
    id: 28,
    rawText: "Tous ceux qui veulent participer sont les bienvenus.",
    bracketedText: "[Tous ceux [qui veulent participer] Prop 2 sont les bienvenus] Prop 1",
    verbs: ["veulent", "sont"],
    propositions: [
      { text: "Tous ceux sont les bienvenus", type: "Principale" },
      { text: "qui veulent participer", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'Qui' est un pronom relatif sujet du verbe 'veulent'.",
    topicId: 'proposition'
  },
  {
    id: 29,
    rawText: "Je te prêterai ce livre si tu me le rends demain.",
    bracketedText: "[Je te prêterai ce livre] Prop 1 [si tu me le rends demain] Prop 2",
    verbs: ["prêterai", "rends"],
    propositions: [
      { text: "Je te prêterai ce livre", type: "Principale" },
      { text: "si tu me le rends demain", type: "Subordonnée circonstancielle" }
    ],
    hint: "Repérez la conjonction qui introduit une condition.",
    difficulty: "Facile",
    ruleExplanation: "« Si » introduit une subordonnée circonstancielle de condition.",
    topicId: 'proposition'
  },
  {
    id: 30,
    rawText: "La fille dont la mère travaille ici a gagné le concours.",
    bracketedText: "[La fille [dont la mère travaille ici] Prop 2 a gagné le concours] Prop 1",
    verbs: ["travaille", "a gagné"],
    propositions: [
      { text: "La fille a gagné le concours", type: "Principale" },
      { text: "dont la mère travaille ici", type: "Subordonnée relative" }
    ],
    hint: "Le pronom relatif « dont » introduit une proposition qui complète un nom.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Dont » introduit une subordonnée relative qui complète l'antécédent « fille ».",
    topicId: 'proposition'
  },
  {
    id: 31,
    rawText: "Je rentrerai avant que la nuit tombe.",
    bracketedText: "[Je rentrerai] Prop 1 [avant que la nuit tombe] Prop 2",
    verbs: ["rentrerai", "tombe"],
    propositions: [
      { text: "Je rentrerai", type: "Principale" },
      { text: "avant que la nuit tombe", type: "Subordonnée circonstancielle" }
    ],
    hint: "Cherchez le groupe de mots qui indique quand l'action principale se déroule.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Avant que » introduit une subordonnée circonstancielle de temps.",
    topicId: 'proposition'
  },
  {
    id: 32,
    rawText: "Il affirme que le train partira à l'heure.",
    bracketedText: "[Il affirme] Prop 1 [que le train partira à l'heure] Prop 2",
    verbs: ["affirme", "partira"],
    propositions: [
      { text: "Il affirme", type: "Principale" },
      { text: "que le train partira à l'heure", type: "Subordonnée complétive" }
    ],
    hint: "Demandez-vous si la proposition introduite par « que » complète le verbe « affirme ».",
    difficulty: "Facile",
    ruleExplanation: "La complétive introduite par « que » complète le verbe « affirme ».",
    topicId: 'proposition'
  },
  {
    id: 33,
    rawText: "Le soleil se couche ; les rues s'illuminent.",
    bracketedText: "[Le soleil se couche] Prop 1 ; [les rues s'illuminent] Prop 2",
    verbs: ["se couche", "s'illuminent"],
    propositions: [
      { text: "Le soleil se couche", type: "Juxtaposées" },
      { text: "les rues s'illuminent", type: "Juxtaposées" }
    ],
    hint: "Observez le signe de ponctuation entre les deux verbes conjugués.",
    difficulty: "Facile",
    ruleExplanation: "Le point-virgule juxtapose les deux propositions sans mot de liaison.",
    topicId: 'proposition'
  },
  {
    id: 34,
    rawText: "Elle sourit parce qu'elle connaît la réponse.",
    bracketedText: "[Elle sourit] Prop 1 [parce qu'elle connaît la réponse] Prop 2",
    verbs: ["sourit", "connaît"],
    propositions: [
      { text: "Elle sourit", type: "Principale" },
      { text: "parce qu'elle connaît la réponse", type: "Subordonnée circonstancielle" }
    ],
    hint: "Le mot de liaison explique la raison pour laquelle elle sourit.",
    difficulty: "Facile",
    ruleExplanation: "« Parce que » introduit une subordonnée circonstancielle de cause.",
    topicId: 'proposition'
  },
  {
    id: 35,
    rawText: "Nous attendrons jusqu'à ce que le médecin revienne.",
    bracketedText: "[Nous attendrons] Prop 1 [jusqu'à ce que le médecin revienne] Prop 2",
    verbs: ["attendrons", "revienne"],
    propositions: [
      { text: "Nous attendrons", type: "Principale" },
      { text: "jusqu'à ce que le médecin revienne", type: "Subordonnée circonstancielle" }
    ],
    hint: "Repérez la locution qui fixe la limite dans le temps.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Jusqu'à ce que » introduit une subordonnée circonstancielle de temps.",
    topicId: 'proposition'
  },
  {
    id: 36,
    rawText: "Le film que tu m'as conseillé m'a beaucoup plu.",
    bracketedText: "[Le film [que tu m'as conseillé] Prop 2 m'a beaucoup plu] Prop 1",
    verbs: ["as conseillé", "a plu"],
    propositions: [
      { text: "Le film m'a beaucoup plu", type: "Principale" },
      { text: "que tu m'as conseillé", type: "Subordonnée relative" }
    ],
    hint: "La proposition introduite par « que » précise de quel film il s'agit.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Que » est un pronom relatif qui introduit une proposition complétant l'antécédent « film ».",
    topicId: 'proposition'
  },
  {
    id: 37,
    rawText: "Il a tellement plu que la rivière a débordé.",
    bracketedText: "[Il a tellement plu] Prop 1 [que la rivière a débordé] Prop 2",
    verbs: ["a plu", "a débordé"],
    propositions: [
      { text: "Il a tellement plu", type: "Principale" },
      { text: "que la rivière a débordé", type: "Subordonnée circonstancielle" }
    ],
    hint: "La structure « tellement… que » exprime le résultat d'une intensité.",
    difficulty: "Avancé",
    ruleExplanation: "La subordonnée introduite par « que » exprime la conséquence de la pluie abondante.",
    topicId: 'proposition'
  },
  {
    id: 38,
    rawText: "Tu peux partir dès que tu auras terminé.",
    bracketedText: "[Tu peux partir] Prop 1 [dès que tu auras terminé] Prop 2",
    verbs: ["peux", "auras terminé"],
    propositions: [
      { text: "Tu peux partir", type: "Principale" },
      { text: "dès que tu auras terminé", type: "Subordonnée circonstancielle" }
    ],
    hint: "La locution de liaison précise le moment où tu peux partir.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Dès que » introduit une subordonnée circonstancielle de temps.",
    topicId: 'proposition'
  },
  {
    id: 39,
    rawText: "Il travaille pour que sa famille vive mieux.",
    bracketedText: "[Il travaille] Prop 1 [pour que sa famille vive mieux] Prop 2",
    verbs: ["travaille", "vive"],
    propositions: [
      { text: "Il travaille", type: "Principale" },
      { text: "pour que sa famille vive mieux", type: "Subordonnée circonstancielle" }
    ],
    hint: "Demandez-vous dans quel but il travaille.",
    difficulty: "Intermédiaire",
    ruleExplanation: "« Pour que » introduit une subordonnée circonstancielle de but, construite au subjonctif.",
    topicId: 'proposition'
  },
  {
    id: 40,
    rawText: "La nuit tombe et les voyageurs cherchent un abri, mais le guide reste calme.",
    bracketedText: "[La nuit tombe] Prop 1 [les voyageurs cherchent un abri] Prop 2 [le guide reste calme] Prop 3",
    verbs: ["tombe", "cherchent", "reste"],
    propositions: [
      { text: "La nuit tombe", type: "Principale" },
      { text: "les voyageurs cherchent un abri", type: "Coordonnées" },
      { text: "le guide reste calme", type: "Coordonnées" }
    ],
    hint: "Repérez les trois verbes conjugués et les deux conjonctions de coordination.",
    difficulty: "Avancé",
    ruleExplanation: "Les trois propositions sont coordonnées par « et » puis « mais ».",
    topicId: 'proposition'
  },
  {
    id: 41,
    rawText: "Quoi qu'il arrive, nous respecterons notre promesse.",
    bracketedText: "[Quoi qu'il arrive] Prop 2, [nous respecterons notre promesse] Prop 1",
    verbs: ["arrive", "respecterons"],
    propositions: [
      { text: "nous respecterons notre promesse", type: "Principale" },
      { text: "Quoi qu'il arrive", type: "Subordonnée circonstancielle" }
    ],
    hint: "L'expression en tête de phrase marque une opposition à toute éventualité.",
    difficulty: "Avancé",
    ruleExplanation: "« Quoi que » introduit une subordonnée circonstancielle de concession.",
    topicId: 'proposition'
  },
  {
    id: 42,
    rawText: "Je me demande pourquoi il a refusé l'invitation.",
    bracketedText: "[Je me demande] Prop 1 [pourquoi il a refusé l'invitation] Prop 2",
    verbs: ["me demande", "a refusé"],
    propositions: [
      { text: "Je me demande", type: "Principale" },
      { text: "pourquoi il a refusé l'invitation", type: "Subordonnée complétive" }
    ],
    hint: "La question indirecte complète le verbe « demande ».",
    difficulty: "Avancé",
    ruleExplanation: "La proposition interrogative indirecte « pourquoi il a refusé l'invitation » est une subordonnée complétive.",
    topicId: 'proposition'
  },
  {
    id: 43,
    rawText: "L'auteur raconte une histoire dont le héros défie le roi et que personne n'oublie.",
    bracketedText: "[L'auteur raconte une histoire [dont le héros défie le roi] Prop 2 et [que personne n'oublie] Prop 3] Prop 1",
    verbs: ["raconte", "défie", "n'oublie"],
    propositions: [
      { text: "L'auteur raconte une histoire", type: "Principale" },
      { text: "dont le héros défie le roi", type: "Subordonnée relative" },
      { text: "que personne n'oublie", type: "Subordonnée relative" }
    ],
    hint: "Les deux propositions introduites par un pronom relatif complètent le même nom.",
    difficulty: "Avancé",
    ruleExplanation: "Les deux subordonnées relatives, introduites par « dont » et « que », complètent l'antécédent « histoire ».",
    topicId: 'proposition'
  },
  {
    id: 44,
    rawText: "Même si tu as peur, avance ; je reste près de toi.",
    bracketedText: "[Même si tu as peur] Prop 2, [avance] Prop 1 ; [je reste près de toi] Prop 3",
    verbs: ["as", "avance", "reste"],
    propositions: [
      { text: "avance", type: "Principale" },
      { text: "Même si tu as peur", type: "Subordonnée circonstancielle" },
      { text: "je reste près de toi", type: "Juxtaposées" }
    ],
    hint: "Il y a une concession introduite par « même si » et une juxtaposition marquée par le point-virgule.",
    difficulty: "Avancé",
    ruleExplanation: "« Même si tu as peur » est une subordonnée circonstancielle de concession. « Je reste près de toi » est juxtaposée à la principale.",
    topicId: 'proposition'
  },
  {
    id: 45,
    rawText: "L'élève que le professeur interroge sait qu'il doit répondre.",
    bracketedText: "[L'élève [que le professeur interroge] Prop 2 sait [qu'il doit répondre] Prop 3] Prop 1",
    verbs: ["interroge", "sait", "doit répondre"],
    propositions: [
      { text: "L'élève sait", type: "Principale" },
      { text: "que le professeur interroge", type: "Subordonnée relative" },
      { text: "qu'il doit répondre", type: "Subordonnée complétive" }
    ],
    hint: "Distinguez la relative qui précise « l'élève » de la complétive qui complète « sait ».",
    difficulty: "Avancé",
    ruleExplanation: "La première subordonnée est une relative qui complète « élève » ; la seconde est une complétive COD du verbe « sait ».",
    topicId: 'proposition'
  },
  {
    id: 46,
    rawText: "Je suis heureux que vous soyez venus, car nous avons besoin d'aide.",
    bracketedText: "[Je suis heureux] Prop 1 [que vous soyez venus] Prop 2, [nous avons besoin d'aide] Prop 3",
    verbs: ["suis", "soyez venus", "avons"],
    propositions: [
      { text: "Je suis heureux", type: "Principale" },
      { text: "que vous soyez venus", type: "Subordonnée complétive" },
      { text: "nous avons besoin d'aide", type: "Coordonnées" }
    ],
    hint: "Repérez la complétive qui complète « heureux » et la coordination introduite par « car ».",
    difficulty: "Avancé",
    ruleExplanation: "« Que vous soyez venus » est une complétive liée à « heureux ». La proposition introduite par « car » est coordonnée et exprime la cause.",
    topicId: 'proposition'
  }
];

// ─── Verb Mode Exercises ───────────────────────────────────────────────────────
export const MODE_SENTENCES: ModeSentence[] = [
  {
    id: 1,
    rawText: 'La Terre est ronde.',
    verbs: ['est'],
    modeType: 'indicatif',
    modeExplanation: 'Mode personnel — valeur de réalité.',
    answer: "« Est » est à l'indicatif, un mode personnel. Il présente comme réelle l'information selon laquelle la Terre est ronde."
  },
  {
    id: 2,
    rawText: 'Il est possible que Léa vienne.',
    verbs: ['vienne'],
    modeType: 'subjonctif',
    modeExplanation: 'Mode personnel — valeur de possibilité.',
    answer: '« Vienne » est au subjonctif, un mode personnel. Il exprime ici une possibilité, introduite par « il est possible que ».'
  },
  {
    id: 3,
    rawText: 'Fermez la porte !',
    verbs: ['Fermez'],
    modeType: 'imperatif',
    modeExplanation: 'Mode personnel — valeur d’ordre.',
    answer: "« Fermez » est à l'impératif, un mode personnel. Il exprime un ordre adressé à la personne qui écoute."
  },
  {
    id: 4,
    rawText: 'Lire chaque jour enrichit le vocabulaire.',
    verbs: ['Lire'],
    modeType: 'infinitif',
    modeExplanation: 'Mode impersonnel — valeur nominale.',
    answer: '« Lire » est à l’infinitif, un mode impersonnel. Le groupe infinitif « lire chaque jour » occupe la fonction de sujet : il a une valeur nominale.'
  },
  {
    id: 5,
    rawText: 'Un soldat blessé attendait les secours.',
    verbs: ['blessé'],
    modeType: 'participe',
    modeExplanation: 'Mode impersonnel — valeur adjectivale.',
    answer: '« Blessé » est un participe passé, un mode impersonnel. Il qualifie le nom « soldat » comme un adjectif : il a une valeur adjectivale.'
  },
  {
    id: 6,
    rawText: 'Elle révise en écoutant de la musique.',
    verbs: ['en écoutant'],
    modeType: 'gerondif',
    modeExplanation: 'Mode impersonnel — valeur adverbiale.',
    answer: '« En écoutant » est au gérondif, un mode impersonnel. Le groupe précise dans quelle circonstance elle révise et fonctionne comme un complément adverbial : il a une valeur adverbiale.'
  },
  {
    id: 7,
    rawText: 'Il faut que tu révises tes leçons.',
    verbs: ['révises'],
    modeType: 'subjonctif',
    modeExplanation: 'Mode personnel — valeur de volonté / nécessité.',
    answer: '« Révises » est au subjonctif, un mode personnel. La locution impersonnelle « il faut que » introduit une subordonnée complétive exigeant le subjonctif pour exprimer une nécessité.'
  },
  {
    id: 8,
    rawText: 'Travailler dur est la clé du succès.',
    verbs: ['Travailler'],
    modeType: 'infinitif',
    modeExplanation: 'Mode impersonnel — valeur nominale.',
    answer: '« Travailler » est à l\'infinitif, un mode impersonnel. Le groupe infinitif « Travailler dur » occupe la fonction de sujet du verbe « est » : il a une valeur nominale.'
  },
  {
    id: 9,
    rawText: 'Les offres soldées attirent les clients.',
    verbs: ['soldées'],
    modeType: 'participe',
    modeExplanation: 'Mode impersonnel — valeur adjectivale.',
    answer: '« Soldées » est un participe passé, un mode impersonnel. Il qualifie le nom « offres » en fonction d\'adjectif : il a une valeur adjectivale.'
  },
  {
    id: 10,
    rawText: 'En pratiquant chaque jour, vous progresserez rapidement.',
    verbs: ['En pratiquant'],
    modeType: 'gerondif',
    modeExplanation: 'Mode impersonnel — valeur adverbiale.',
    answer: '« En pratiquant » est au gérondif, un mode impersonnel. Le groupe adverbial précise la circonstance dans laquelle l\'action principale se déroule : il a une valeur adverbiale.'
  }
];
