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

export type VerbValueType =
  | 'valeur_temporelle'
  | 'valeur_modale'
  | 'forme_impersonnelle'
  | 'voix_passive'
  | 'infinitif'
  | 'participe';

export const VERB_VALUE_LABELS: Record<VerbValueType, string> = {
  valeur_temporelle: 'Valeur temporelle',
  valeur_modale: 'Valeur modale (subjonctif/conditionnel)',
  forme_impersonnelle: 'Forme impersonnelle',
  voix_passive: 'Voix passive',
  infinitif: 'Infinitif / infinitif passé',
  participe: 'Participe présent / participe passé',
};

export interface ValeurSentence {
  id: number;
  rawText: string;
  /** comma-separated verb forms found in the sentence */
  verbs: string[];
  valueType: VerbValueType;
  /** human-readable description of the value */
  valueExplanation: string;
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
    id: 'valeur_verbe',
    title: '2. Valeur des Temps et Modes du Verbe',
    shortName: 'Valeur du Verbe',
    officialTheme: "Le système temporel et la valeur des temps/modes de l'indicatif",
    description: "Analysez la valeur d'emploi des temps et modes : temporelle, modale, impersonnelle, passive, infinitif, participe.",
    methodSteps: [
      "1. Identifiez le verbe conjugué et son temps/mode.",
      "2. Déterminez sa valeur : temporelle (description/narration), modale (subjonctif=volonté/crainte, conditionnel=hypothèse), impersonnelle, passive, infinitif ou participe.",
      "3. Justifiez par le contexte et la construction de la phrase.",
      "4. Opposez si nécessaire : présent de description vs présent de narration, imparfait d'habitude vs imparfait de description."
    ],
    examples: [
      {
        question: "Quelle est la valeur du verbe dans : « C'est un trou de verdure où chante une rivière. »",
        sentence: "C'est un trou de verdure où chante une rivière.",
        answer: "Le présent de l'indicatif a une valeur de description : il peint le tableau bucolique et donne l'illusion de l'immédiateté sous les yeux du lecteur.",
        bareme: "1 pt identification du temps / 1 pt valeur descriptive."
      },
      {
        question: "Analysez le mode du subjonctif : « Il faut que tu viennes. »",
        sentence: 'Il faut que tu viennes.',
        answer: "Le subjonctif dans « tu viennes » expresses la nécessité/volonté (valeur modale), imposé par « il faut que ». Le subjonctif marque le caractère non certain de l'action.",
        bareme: "1 pt subjonctif / 1 pt valeur modale (nécessité)."
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

// ─── Valeur du Verbe Exercises ────────────────────────────────────────────────
export const VALEUR_SENTENCES: ValeurSentence[] = [
  // ── Valeur Temporelle ──
  {
    id: 1,
    rawText: "Le soldat meurt dans la nuit noire.",
    verbs: ["meurt"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Passé simple = temps du récit, premier plan narratif.",
    answer: "Le verbe 'meurt' est au passé simple. Dans ce contexte, il a une valeur temporelle de premier plan narratif : il marque une action bornée et instante qui fait avancer le récit. Le passé simple s'oppose à l'imparfait (fond/descriptif) qui poserait le décor."
  },
  {
    id: 2,
    rawText: "Il faisait sombre et les étoiles brillaient.",
    verbs: ["faisait", "brillaient"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Imparfait = фон descriptif / habitude du récit.",
    answer: "Les verbes 'faisait' et 'brillaient' sont à l'imparfait. L'imparfait a ici une valeur temporelle de фон/descriptif : il pose le cadre, l'atmosphère nocturne, sans faire avancer l'action. Il s'oppose au passé simple qui créerait le premier plan."
  },
  {
    id: 3,
    rawText: "La terre est ronde et tourne autour du soleil.",
    verbs: ["est", "tourne"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Présent de vérité générale / d'énonciation.",
    answer: "Les verbes 'est' et 'tourne' sont au présent de l'indicatif. Ils ont une valeur de vérité générale (énonciation atemporelle) : ce sont des faits immuables. Le présent d'énonciation sert à exprimer une certitude ou une loi universelle."
  },
  {
    id: 4,
    rawText: "Je partirai demain à l'aube.",
    verbs: ["parturai"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Futur simple = projection dans l'avenir, incertitude.",
    answer: "Le verbe 'partirai' est au futur simple. Il a une valeur temporelle de projection dans l'avenir : l'action est envisagée comme devant se réaliser. Le futur peut aussi exprimer l'incertitude ou la politesse selon le contexte."
  },
  {
    id: 5,
    rawText: "Chaque matin, le berger sortait à l'aube.",
    verbs: ["sortait"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Imparfait d'habitude / d'itération.",
    answer: "Le verbe 'sortait' est à l'imparfait. L'adverbe 'chaque matin' confirme la valeur d'habitude (itération) : l'action se répétait régulièrement dans le passé. L'imparfait s'oppose au passé simple qui exprimerait une action unique."
  },
  {
    id: 6,
    rawText: "Or, c'était un petit val calme et serein.",
    verbs: ["était"],
    valueType: 'valeur_temporelle',
    valueExplanation: "Imparfait de description dans un récit au passé.",
    answer: "Le verbe 'était' est à l'imparfait. Il a une valeur de description qui pose le décor du récit : 'un petit val calme et serein'. L'imparfait ne fait pas avancer l'action mais installe l'atmosphère (imparfait de фон)."
  },
  // ── Valeur Modale ──
  {
    id: 7,
    rawText: "Il faut que tu sois prudent.",
    verbs: ["faut", "sois"],
    valueType: 'valeur_modale',
    valueExplanation: "Subjonctif après 'il faut que' = nécessité/volonté.",
    answer: "Le verbe 'faut' est au présent de l'indicatif (forme impersonnelle). Le verbe 'sois' est au subjonctif présent, exigé par 'il faut que'. Le subjonctif a ici une valeur modale de nécessité : l'accomplissement de l'action est présenté comme obligatoire, souhaité."
  },
  {
    id: 8,
    rawText: "Je doute qu'il ait raison.",
    verbs: ["doute", "ait"],
    valueType: 'valeur_modale',
    valueExplanation: "Subjonctif après 'douter' = doute, incertitude.",
    answer: "Le verbe 'doute' est à l'indicatif. Le verbe 'ait' est au subjonctif passé, exigé par le verbe 'douter'. Le subjonctif a une valeur modale d'incertitude : le locuteur doute de la véracité du fait."
  },
  {
    id: 9,
    rawText: "Bien que la route soit longue, nous continuerons.",
    verbs: ["soit", "continuerons"],
    valueType: 'valeur_modale',
    valueExplanation: "Subjonctif après 'bien que' = concession, opposition.",
    answer: "'Soit' est au subjonctif, exigé par la locution conjonctive 'bien que'. Le subjonctif a une valeur modale de concession : il expresses l'opposition entre la cause ('la route soit longue') et le fait principal ('nous continuerons')."
  },
  {
    id: 10,
    rawText: "Il faudrait que tu révises tes leçons.",
    verbs: ["faudrait", "révises"],
    valueType: 'valeur_modale',
    valueExplanation: "Conditionnel présent = hypothèse, souhait ou conseil poli.",
    answer: "'Faudrait' est au conditionnel présent et 'révises' au subjonctif. Le conditionnel a une valeur modale d'hypothèse ('si tu voulais') ou de conseil poli ; le subjonctif, lui, expresses la nécessité souhaitée."
  },
  // ── Formes Impersonnelles ──
  {
    id: 11,
    rawText: "Il pleut depuis trois jours sans arrêt.",
    verbs: ["pleut"],
    valueType: 'forme_impersonnelle',
    valueExplanation: "Verbe météorologique impersonnel : 'il' ne renvoie à personne.",
    answer: "Le verbe 'pleut' est conjugué à la troisième personne du singulier du présent de l'indicatif. C'est une forme impersonnelle : le pronom 'il' n'a aucune valeur référentielle (il ne renvoie à aucune personne). Ce type de verbe exprime un phénomène naturel ou un état."
  },
  {
    id: 12,
    rawText: "Il semble que le danger soit passé.",
    verbs: ["semble", "soit"],
    valueType: 'forme_impersonnelle',
    valueExplanation: "Verbe impersonnel 'sembler' + subjonctif.",
    answer: "'Semble' est conjugué à la forme impersonnelle (sujet 'il' vide). Le subjonctif 'soit' est obligatoire après 'il semble que'. Ce verbe impersonnel exprime une apparence, une impression non confirmée."
  },
  {
    id: 13,
    rawText: "Il était nécessaire que chacun contribuat.",
    verbs: ["était", "contribuât"],
    valueType: 'forme_impersonnelle',
    valueExplanation: "Forme impersonnelle + subjonctif (impératif déguisé).",
    answer: "'Était' est à la forme impersonnelle (sujet 'il' non référentiel). 'Contribuât' est au subjonctif imparfait, imposé par 'il était nécessaire que'. Cette construction impersonnelle a la valeur d'un ordre ou d'une nécessité absolue."
  },
  // ── Voix Passive ──
  {
    id: 14,
    rawText: "Le texte a été analysé par les élèves.",
    verbs: ["été analysé"],
    valueType: 'voix_passive',
    valueExplanation: "Voix passive : auxiliaire 'être' + participe passé.",
    answer: "Le verbe 'a été analysé' est à la voix passive. La voix passive est formée de l'auxiliaire 'être' au сложный passé + le participe passé du verbe 'analyser'. L'agent de l'action est 'par les élèves'. La voix passive permet de mettre en relief le complément d'objet ou l'agent."
  },
  {
    id: 15,
    rawText: "La thèse fut defendue avec passion.",
    verbs: ["fut defendue"],
    valueType: 'voix_passive',
    valueExplanation: "Passé simple de la voix passive (littéraire).",
    answer: "'Fut défendue' est au passé simple de la voix passive, avec l'auxiliaire 'être' au passé simple + participe passé. L'agent n'est pas explicité ici. L'emploi du passé simple confère un style soutenu et littéraire à la phrase."
  },
  // ── Infinitif ──
  {
    id: 16,
    rawText: "J'ai décidé de partir en voyage.",
    verbs: ["ai décidé", "partir"],
    valueType: 'infinitif',
    valueExplanation: "Infinitif présent après préposition 'de' = action à accomplir.",
    answer: "Le verbe 'ai décidé' est au passé composé (forme composée de l'indicatif). 'Partir' est à l'infinitif présent. L'infinitif a une valeur nominale : il fonctionne comme nom et peut être COD, sujet ou CC. Ici, 'partir en voyage' est COD du verbe 'décider'."
  },
  {
    id: 17,
    rawText: "Ne pas oublier de réviser avant l'examen.",
    verbs: ["oublier", "réviser"],
    valueType: 'infinitif',
    valueExplanation: "Infinitif négatif = ordre ou interdiction.",
    answer: "'Oublier' et 'réviser' sont à l'infinitif. L'infinitif négatif ('ne pas oublier') a une valeur d'ordre ou d'interdiction : il exprime une prescription de manière impersonnelle, sans sujet défini."
  },
  // ── Participe ──
  {
    id: 18,
    rawText: "Le soldat endormi dans l'herbe froide représente la paix.",
    verbs: ["endormi"],
    valueType: 'participe',
    valueExplanation: "Participe passé adjectival (= épithète) qualifiant le nom.",
    answer: "'Endormi' est un participe passé adjectivé. Il fonctionne comme épithète du nom 'soldat' et s'accorde en genre et en nombre avec lui. Il remplace une proposition relative ('le soldat qui est endormi') et a une valeur descriptive."
  },
  {
    id: 19,
    rawText: "Ayant terminé son exposé, le candidat s'assit.",
    verbs: ["Ayant terminé", "s'assit"],
    valueType: 'participe',
    valueExplanation: "Participe présent composé = antériorité par rapport au verbe principal.",
    answer: "'Ayant terminé' est un participe présent composé (participe présent de 'avoir' + participe passé 'terminé'). Il exprime l'antériorité par rapport à l'action principale 's'assit' : le candidat termina d'abord son exposé, puis s'assit. Le participe présent composé remplace une proposition subordonnée temporelle."
  },
  {
    id: 20,
    rawText: "Les résultats obtenus sont encourageants.",
    verbs: ["obtenus"],
    valueType: 'participe',
    valueExplanation: "Participe passé employed comme adjectif (épithète du nom).",
    answer: "'Obtenus' est un participe passé adjectivé, épithète du nom 'résultats'. Il s'accorde au pluriel masculin. Il remplace une proposition relative ('les résultats qui ont été obtenus'). Le participe présent东海形容词 a une valeur descriptive et remplace une subordonnée relative."
  }
];
