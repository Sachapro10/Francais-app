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
  }
];
