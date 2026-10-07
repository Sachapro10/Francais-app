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
    id: 'negation',
    title: '1. La Négation (Totale, Partielle, Restrictive)',
    shortName: 'Négation',
    officialTheme: 'La négation : formes et portée',
    description: 'Identifier le type de négation, sa portée et effectuer la transformation affirmative.',
    methodSteps: [
      '1. Identifier les adverbes ou pronoms de la négation (ne...pas, ne...jamais, ne...personne, ne...rien, ne...aucun).',
      '2. Préciser si la négation est totale (porte sur toute la proposition) ou partielle (porte sur un seul élément).',
      '3. Relever les cas particuliers : la négation restrictive (ne...que = seulement) ou l\'emploi expletif.',
      '4. Effectuer la transformation à la forme affirmative pour justifier votre analyse.'
    ],
    examples: [
      {
        question: 'Analysez la négation dans la phrase suivante : « Les parfums ne font pas frissonner sa narine » (v.12).',
        sentence: 'Les parfums ne font pas frissonner sa narine.',
        answer: 'Il s’agit d’une négation totale. Elle est exprimée par les deux adverbes corrélatifs « ne » (adverbe discordantiel) et « pas » (adverbe forclusif) qui encadrent le verbe conjugué « font ». Elle porte sur l’ensemble de la proposition. À la forme affirmative, la phrase devient : « Les parfums font frissonner sa narine ».',
        bareme: '1 pt pour l’identification (totale + mots ne...pas) / 1 pt pour l’analyse de la portée et la transformation affirmative.'
      },
      {
        question: 'Analysez la négation dans : « C’est un petit val qui ne mousse que de rayons ».',
        sentence: 'C’est un petit val qui ne mousse que de rayons.',
        answer: 'Il s’agit d’une négation restrictive (ou fausse négation) exprimée par « ne...que ». Elle a la valeur de l’adverbe d’intensité « seulement ». À la forme affirmative restrictive, la phrase équivaut à : « C’est un petit val qui mousse seulement de rayons ».',
        bareme: '1 pt pour la distinction restriction vs négation / 1 pt pour la paraphrase explicative.'
      }
    ]
  },
  {
    id: 'interrogation',
    title: '2. L’Interrogation (Directe, Indirecte, Totale, Partielle)',
    shortName: 'Interrogation',
    officialTheme: 'L’interrogation : sintaxe et valeurs',
    description: 'Distinguer interrogation directe/indirecte, totale/partielle et identifier le registre de langue.',
    methodSteps: [
      '1. Distinguer l\'interrogation directe (ponctue par ?) et l\'interrogation indirecte (proposition subordonnée complétive).',
      '2. Déterminer si l\'interrogation est totale (réponse par oui/non) ou partielle (porte sur un élément représenté par un mot interrogatif).',
      '3. Analyser la syntaxe : inversion du sujet, mot interrogatif (qui, que, où, comment), ou présence de « est-ce que ».'
    ],
    examples: [
      {
        question: 'Analysez la forme interrogative : « Pourquoi la rivière chante-t-elle dans la vallée ? »',
        sentence: 'Pourquoi la rivière chante-t-elle dans la vallée ?',
        answer: 'C’est une interrogation directe (présence du point d’interrogation et reprise du sujet par le pronom « elle »). Elle est partielle car elle porte sur la cause, introduite par le mot interrogatif « pourquoi ». Le niveau de langue est soutenu avec inversion complexe du sujet.',
        bareme: '1 pt pour directe + partielle / 1 pt pour la syntaxe (mot interrogatif + inversion).'
      }
    ]
  },
  {
    id: 'relative',
    title: '3. La Proposition Subordonnée Relative',
    shortName: 'Sub. Relative',
    officialTheme: 'La proposition subordonnée relative',
    description: 'Identifier la proposition relative, trouver son antécédent, et préciser la fonction du pronom relatif.',
    methodSteps: [
      '1. Délimiter la proposition subordonnée relative (du pronom relatif jusqu\'au verbe de la relative).',
      '2. Identifier son antécédent (le nom ou pronom qu\'elle complète dans la principale).',
      '3. Donner la nature du pronom relatif (qui, que, dont, où, lequel...) et sa fonction propre dans la subordonnée (Sujet, COD, COI, CC).'
    ],
    examples: [
      {
        question: 'Analysez la subordonnée relative dans : « C’est un trou de verdure où chante une rivière » (v.1).',
        sentence: 'C’est un trou de verdure où chante une rivière.',
        answer: 'La proposition subordonnée relative est « où chante une rivière ». Elle est introduite par le pronom relatif « où » et complète l’antécédent « trou de verdure ». Dans la subordonnée, le pronom relatif « où » a pour fonction Complément Circonstanciel de Lieu du verbe « chante » (dont le sujet inversé est « une rivière »).',
        bareme: '1 pt pour la délimitation et l’antécédent / 1 pt pour la nature et fonction du pronom relatif.'
      },
      {
        question: 'Analysez la subordonnée relative dans : « Le soldat qui dort dans l’herbe est jeune ».',
        sentence: 'Le soldat qui dort dans l’herbe est jeune.',
        answer: '« qui dort dans l’herbe » est une proposition subordonnée relative introduite par le pronom relatif simple « qui ». Elle a pour antécédent le nom « soldat ». Le pronom relatif « qui » a pour fonction Sujet du verbe « dort ».',
        bareme: '1 pt pour l’antécédent / 1 pt pour la fonction sujet.'
      }
    ]
  },
  {
    id: 'completive',
    title: '4. La Proposition Subordonnée Complétive',
    shortName: 'Sub. Complétive',
    officialTheme: 'La proposition subordonnée complétive',
    description: 'Analyser la proposition complétive introduite par "que", sa fonction de COD et le mode du verbe.',
    methodSteps: [
      '1. Délimiter la proposition complétive introduite par la conjonction de subordination « que » (ou interrogative indirecte).',
      '2. Montrer qu\'elle n\'a pas d\'antécédent et qu\'elle est essentielle (ne peut pas être supprimée).',
      '3. Préciser sa fonction (COD du verbe principal) et justifier le mode du verbe subordonné (indicatif ou subjonctif).'
    ],
    examples: [
      {
        question: 'Analysez la proposition subordonnée dans : « Le poète montre que la nature berce le soldat ».',
        sentence: 'Le poète montre que la nature berce le soldat.',
        answer: '« que la nature berce le soldat » est une proposition subordonnée conjonctive complétive, introduite par la conjonction de subordination « que ». Elle n’a pas d’antécédent et occupe la fonction de Complément d’Objet Direct (COD) du verbe principal « montre ». Le verbe « berce » est au mode indicatif (fait certain).',
        bareme: '1 pt pour la nature complétive + absence d’antécédent / 1 pt pour la fonction COD et le mode.'
      }
    ]
  },
  {
    id: 'circonstancielle',
    title: '5. Les Subordonnées Circonstancielles (Cause, But, Concession...)',
    shortName: 'Sub. Circonstancielle',
    officialTheme: 'Les propositions subordonnées circonstancielles',
    description: 'Identifier le rapport logique exprimé (cause, conséquence, but, concession, condition) et la conjonction.',
    methodSteps: [
      '1. Délimiter la proposition subordonnée circonstancielle et repérer le subordonnant (parce que, bien que, pour que, si...).',
      '2. Identifier le rapport logique exprimé (Cause, Conséquence, But, Concession/Opposition, Hypothèse/Condition, Temps).',
      '3. Justifier l\'emploi du mode du verbe subordonné (subjonctif après bien que/pour que, indicatif après parce que).'
    ],
    examples: [
      {
        question: 'Analysez la subordonnée circonstancielle dans : « Nature, berce-le chaudement : car il a froid ».',
        sentence: 'Nature, berce-le chaudement : car il a froid.',
        answer: 'Bien que reliée par la conjonction de coordination « car », la proposition « il a froid » exprime un rapport logique de Cause. S’il s’agissait d’une subordonnée introduite par « parce que », ce serait une subordonnée circonstancielle de cause au mode indicatif.',
        bareme: '1 pt pour l’expression de la cause / 1 pt pour l’analyse syntaxique.'
      },
      {
        question: 'Analysez la subordonnée dans : « Bien qu’il soit au soleil, le soldat a froid ».',
        sentence: 'Bien qu’il soit au soleil, le soldat a froid.',
        answer: '« Bien qu’il soit au soleil » est une proposition subordonnée circonstancielle de concession, introduite par la locution conjonctive « bien que ». Elle emploie le verbe « soit » au mode subjonctif (exigé par bien que).',
        bareme: '1 pt pour la concession / 1 pt pour l’explication du mode subjonctif.'
      }
    ]
  },
  {
    id: 'temps_modes',
    title: '6. Le Système Temporel & Valeur des Temps et Modes',
    shortName: 'Temps & Modes',
    officialTheme: 'Le système temporel et la valeur des temps/modes',
    description: 'Analyser la valeur d’emploi des temps (présent de vérité générale, narration, imparfait descriptif/passé simple).',
    methodSteps: [
      '1. Identifier le temps et le mode du verbe conjugué.',
      '2. Rattacher le verbe à son système temporel (système du présent / discours vs système du passé / récit).',
      '3. Nommer précisément la valeur d\'emploi : présent de description, de vérité générale, de narration, d\'énonciation ; imparfait descriptif ou d\'habitude ; passé simple de premier plan.'
    ],
    examples: [
      {
        question: 'Analysez la valeur du présent dans : « C’est un trou de verdure où chante une rivière » (v.1).',
        sentence: 'C’est un trou de verdure où chante une rivière.',
        answer: 'Les verbes « est » et « chante » sont conjugués au présent de l’indicatif. Il s’agit d’un présent de description qui sert à peindre le tableau naturel bucolique et donner l’illusion de l’immédiateté sous les yeux du lecteur.',
        bareme: '1 pt pour l’identification du temps/mode / 1 pt pour la valeur de description.'
      }
    ]
  },
  {
    id: 'discours_rapporte',
    title: '7. Le Discours Rapporté & Concordance des Temps',
    shortName: 'Discours Rapporté',
    officialTheme: 'Le discours rapporté et la concordance des temps',
    description: 'Analyser les formes de discours direct, indirect et indirect libre et maitriser les transpositions.',
    methodSteps: [
      '1. Identifier la forme de discours rapporté (Direct avec guillemets, Indirect avec proposition complétive, Indirect libre).',
      '2. Analyser les marquer du discours (verbe de parole, ponctuation, pronoms personnels, indicateurs spatio-temporels).',
      '3. Expliciter les règles de concordance des temps lors de la transposition au passé (présent -> imparfait, futur -> conditionnel).'
    ],
    examples: [
      {
        question: 'Transposez au discours indirect au passé : « Le poète dit : "Le soldat dort dans le val." »',
        sentence: 'Le poète dit : "Le soldat dort dans le val."',
        answer: 'Au discours indirect au passé : « Le poète a dit que le soldat dormait dans le val. » Le présent « dort » devient un imparfait « dormait » en vertu de la concordance des temps, et les guillemets/deux-points sont remplacés par la subordination complétive avec « que ».',
        bareme: '1 pt pour la subordination complétive / 1 pt pour la concordance du temps (imparfait).'
      }
    ]
  }
];

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
    ruleExplanation: "Les deux propositions sont reliées par la conjonction de coordination 'et'."
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
    ruleExplanation: "La proposition commence par 'que' et complète le verbe 'pense'.",
    topicId: 'completive'
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
    ruleExplanation: "Les deux propositions sont séparées par un point-virgule sans mot de liaison."
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
    topicId: 'relative'
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
    ruleExplanation: "'Quand' introduit une circonstance de temps.",
    topicId: 'circonstancielle'
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
    ruleExplanation: "'car' est une conjonction de coordination."
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
    ruleExplanation: "Complétive introduite par 'que'.",
    topicId: 'completive'
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
    ruleExplanation: "Propositions juxtaposées par des virgules."
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
    ruleExplanation: "Le pronom relatif 'que' complète le nom 'maison'.",
    topicId: 'relative'
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
    ruleExplanation: "'Si' introduit une circonstance de condition.",
    topicId: 'circonstancielle'
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
    topicId: 'negation'
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
    ruleExplanation: "La complétive complète le verbe 'crois'.",
    topicId: 'completive'
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
    ruleExplanation: "'Puisque' introduit une circonstance de cause.",
    topicId: 'circonstancielle'
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
    ruleExplanation: "'dont' est un pronom relatif qui complète le nom 'livre'.",
    topicId: 'relative'
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
    ruleExplanation: "'donc' est une conjonction de coordination."
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
    ruleExplanation: "'Bien que' introduit une circonstance de concession.",
    topicId: 'circonstancielle'
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
    ruleExplanation: "Propositions juxtaposées par un point-virgule."
  },
  {
    id: 18,
    rawText: "Je sais où tu habites maintenant.",
    bracketedText: "[Je sais] Prop 1 [où tu habites maintenant] Prop 2",
    verbs: ["sais", "habites"],
    propositions: [
      { text: "Je sais", type: "Principale" },
      { text: "où tu habites maintenant", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La complétive indirecte introduite par 'où' complète le verbe 'sais'."
  },
  {
    id: 19,
    rawText: "L'enfant qui pleure veut son jouet.",
    bracketedText: "[L'enfant [qui pleure] Prop 2 veut son jouet] Prop 1",
    verbs: ["pleure", "veut"],
    propositions: [
      { text: "L'enfant veut son jouet", type: "Principale" },
      { text: "qui pleure", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'qui' complète le nom 'enfant'."
  },
  {
    id: 20,
    rawText: "Comme il pleuvait, nous sommes restés à la maison.",
    bracketedText: "[Comme il pleuvait] Prop 2, [nous sommes restés à la maison] Prop 1",
    verbs: ["pleuvait", "sommes restés"],
    propositions: [
      { text: "nous sommes restés à la maison", type: "Principale" },
      { text: "Comme il pleuvait", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Comme' introduit une circonstance de cause."
  },
  {
    id: 21,
    rawText: "Elle affirme qu'il fera beau demain.",
    bracketedText: "[Elle affirme] Prop 1 [qu'il fera beau demain] Prop 2",
    verbs: ["affirme", "fera"],
    propositions: [
      { text: "Elle affirme", type: "Principale" },
      { text: "qu'il fera beau demain", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La complétive complète le verbe 'affirme'."
  },
  {
    id: 22,
    rawText: "La voiture que j'ai vue est rouge.",
    bracketedText: "[La voiture [que j'ai vue] Prop 2 est rouge] Prop 1",
    verbs: ["ai vue", "est"],
    propositions: [
      { text: "La voiture est rouge", type: "Principale" },
      { text: "que j'ai vue", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'que' est un pronom relatif complétant 'voiture'."
  },
  {
    id: 23,
    rawText: "Tu réussis car tu travailles beaucoup.",
    bracketedText: "[Tu réussis] Prop 1 [car tu travailles beaucoup] Prop 2",
    verbs: ["réussis", "travailles"],
    propositions: [
      { text: "Tu réussis", type: "Principale" },
      { text: "tu travailles beaucoup", type: "Coordonnées" }
    ],
    ruleExplanation: "'car' coordonne les deux propositions."
  },
  {
    id: 24,
    rawText: "Dès que le soleil paraît, les fleurs s'ouvrent.",
    bracketedText: "[Dès que le soleil paraît] Prop 2, [les fleurs s'ouvrent] Prop 1",
    verbs: ["paraît", "ouvrent"],
    propositions: [
      { text: "les fleurs s'ouvrent", type: "Principale" },
      { text: "Dès que le soleil paraît", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Dès que' introduit une circonstance de temps."
  },
  {
    id: 25,
    rawText: "Je me demande si tu viendras ce soir.",
    bracketedText: "[Je me demande] Prop 1 [si tu viendras ce soir] Prop 2",
    verbs: ["demande", "viendras"],
    propositions: [
      { text: "Je me demande", type: "Principale" },
      { text: "si tu viendras ce soir", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La complétive interrogative indirecte avec 'si'."
  },
  {
    id: 26,
    rawText: "Il court, elle marche, ils avancent ensemble.",
    bracketedText: "[Il court] Prop 1, [elle marche] Prop 2, [ils avancent ensemble] Prop 3",
    verbs: ["court", "marche", "avancent"],
    propositions: [
      { text: "Il court", type: "Principale" },
      { text: "elle marche", type: "Juxtaposées" },
      { text: "ils avancent ensemble", type: "Juxtaposées" }
    ],
    ruleExplanation: "Trois propositions juxtaposées par des virgules."
  },
  {
    id: 27,
    rawText: "L'homme à qui j'ai parlé est mon voisin.",
    bracketedText: "[L'homme [à qui j'ai parlé] Prop 2 est mon voisin] Prop 1",
    verbs: ["ai parlé", "est"],
    propositions: [
      { text: "L'homme est mon voisin", type: "Principale" },
      { text: "à qui j'ai parlé", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'à qui' est un pronom relatif avec préposition."
  },
  {
    id: 28,
    rawText: "Avant qu'il ne parte, nous devons lui parler.",
    bracketedText: "[Avant qu'il ne parte] Prop 2, [nous devons lui parler] Prop 1",
    verbs: ["parte", "devons parler"],
    propositions: [
      { text: "nous devons lui parler", type: "Principale" },
      { text: "Avant qu'il ne parte", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Avant que' introduit une circonstance de temps."
  },
  {
    id: 29,
    rawText: "Je lis et tu écris mais lui dessine.",
    bracketedText: "[Je lis] Prop 1 [et tu écris] Prop 2 [mais lui dessine] Prop 3",
    verbs: ["lis", "écris", "dessine"],
    propositions: [
      { text: "Je lis", type: "Principale" },
      { text: "tu écris", type: "Coordonnées" },
      { text: "lui dessine", type: "Coordonnées" }
    ],
    ruleExplanation: "Propositions coordonnées par 'et' et 'mais'."
  },
  {
    id: 30,
    rawText: "Elle espère que tu comprendras sa décision.",
    bracketedText: "[Elle espère] Prop 1 [que tu comprendras sa décision] Prop 2",
    verbs: ["espère", "comprendras"],
    propositions: [
      { text: "Elle espère", type: "Principale" },
      { text: "que tu comprendras sa décision", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La complétive complète le verbe 'espère'."
  },
  {
    id: 31,
    rawText: "Le film dont tout le monde parle sort demain.",
    bracketedText: "[Le film [dont tout le monde parle] Prop 2 sort demain] Prop 1",
    verbs: ["parle", "sort"],
    propositions: [
      { text: "Le film sort demain", type: "Principale" },
      { text: "dont tout le monde parle", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'dont' complète le nom 'film'."
  },
  {
    id: 32,
    rawText: "Pendant que tu dormais, j'ai préparé le dîner.",
    bracketedText: "[Pendant que tu dormais] Prop 2, [j'ai préparé le dîner] Prop 1",
    verbs: ["dormais", "ai préparé"],
    propositions: [
      { text: "j'ai préparé le dîner", type: "Principale" },
      { text: "Pendant que tu dormais", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Pendant que' introduit une circonstance de temps."
  },
  {
    id: 33,
    rawText: "Il pleut ; nous prenons nos parapluies ; la rue se vide.",
    bracketedText: "[Il pleut] Prop 1 ; [nous prenons nos parapluies] Prop 2 ; [la rue se vide] Prop 3",
    verbs: ["pleut", "prenons", "vide"],
    propositions: [
      { text: "Il pleut", type: "Principale" },
      { text: "nous prenons nos parapluies", type: "Juxtaposées" },
      { text: "la rue se vide", type: "Juxtaposées" }
    ],
    ruleExplanation: "Trois propositions juxtaposées par des points-virgules."
  },
  {
    id: 34,
    rawText: "Parce qu'elle est malade, elle reste au lit.",
    bracketedText: "[Parce qu'elle est malade] Prop 2, [elle reste au lit] Prop 1",
    verbs: ["est", "reste"],
    propositions: [
      { text: "elle reste au lit", type: "Principale" },
      { text: "Parce qu'elle est malade", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Parce que' introduit une circonstance de cause."
  },
  {
    id: 35,
    rawText: "Je ne sais pas comment il a réussi.",
    bracketedText: "[Je ne sais pas] Prop 1 [comment il a réussi] Prop 2",
    verbs: ["sais", "a réussi"],
    propositions: [
      { text: "Je ne sais pas", type: "Principale" },
      { text: "comment il a réussi", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "La complétive interrogative indirecte avec 'comment'."
  },
  {
    id: 36,
    rawText: "La femme qui chante est ma mère.",
    bracketedText: "[La femme [qui chante] Prop 2 est ma mère] Prop 1",
    verbs: ["chante", "est"],
    propositions: [
      { text: "La femme est ma mère", type: "Principale" },
      { text: "qui chante", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'qui' complète le nom 'femme'."
  },
  {
    id: 37,
    rawText: "Afin que tu réussisses, je t'aide tous les jours.",
    bracketedText: "[Afin que tu réussisses] Prop 2, [je t'aide tous les jours] Prop 1",
    verbs: ["réussisses", "aide"],
    propositions: [
      { text: "je t'aide tous les jours", type: "Principale" },
      { text: "Afin que tu réussisses", type: "Subordonnée circonstancielle" }
    ],
    ruleExplanation: "'Afin que' introduit une circonstance de but."
  },
  {
    id: 38,
    rawText: "Tu étudies ou tu regardes la télévision.",
    bracketedText: "[Tu étudies] Prop 1 [ou tu regardes la télévision] Prop 2",
    verbs: ["étudies", "regardes"],
    propositions: [
      { text: "Tu étudies", type: "Principale" },
      { text: "tu regardes la télévision", type: "Coordonnées" }
    ],
    ruleExplanation: "'ou' est une conjonction de coordination."
  },
  {
    id: 39,
    rawText: "Il affirme qu'il viendra mais je doute qu'il soit sérieux.",
    bracketedText: "[Il affirme [qu'il viendra] Prop 2] Prop 1 [mais je doute [qu'il soit sérieux] Prop 4] Prop 3",
    verbs: ["affirme", "viendra", "doute", "soit"],
    propositions: [
      { text: "Il affirme", type: "Principale" },
      { text: "qu'il viendra", type: "Subordonnée complétive" },
      { text: "je doute", type: "Coordonnées" },
      { text: "qu'il soit sérieux", type: "Subordonnée complétive" }
    ],
    ruleExplanation: "Deux propositions principales coordonnées, chacune avec une complétive."
  },
  {
    id: 40,
    rawText: "La ville où je suis né a beaucoup changé.",
    bracketedText: "[La ville [où je suis né] Prop 2 a beaucoup changé] Prop 1",
    verbs: ["suis né", "a changé"],
    propositions: [
      { text: "La ville a beaucoup changé", type: "Principale" },
      { text: "où je suis né", type: "Subordonnée relative" }
    ],
    ruleExplanation: "'où' est un pronom relatif de lieu."
  }
];
