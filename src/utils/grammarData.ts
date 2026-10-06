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
}

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
    ruleExplanation: "La proposition commence par 'que' et complète le verbe 'pense'."
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
    ruleExplanation: "'qui' est un pronom relatif qui complète le nom 'chat'."
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
    ruleExplanation: "'Quand' introduit une circonstance de temps."
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
    ruleExplanation: "Complétive introduite par 'que'."
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
    ruleExplanation: "Le pronom relatif 'que' complète le nom 'maison'."
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
    ruleExplanation: "'Si' introduit une circonstance de condition."
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
    ruleExplanation: "Propositions coordonnées par 'et' et 'mais'."
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
    ruleExplanation: "La complétive complète le verbe 'crois'."
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
    ruleExplanation: "'Puisque' introduit une circonstance de cause."
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
    ruleExplanation: "'dont' est un pronom relatif qui complète le nom 'livre'."
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
    ruleExplanation: "'Bien que' introduit une circonstance de concession."
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
