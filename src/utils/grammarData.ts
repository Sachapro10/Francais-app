export interface PropositionDetail {
  text: string;
  type: 'Principale' | 'Juxtaposition' | 'Coordination' | 'Subordonnée relative' | 'Complétive' | 'Circonstancielle';
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
    rawText: "Le vent soufflait fort quand la nuit est tombée.",
    bracketedText: "[Le vent soufflait (V) fort] P.P. [quand la nuit est tombée (V).] S.C.",
    verbs: ["soufflait", "est tombée"],
    propositions: [
      { text: "Le vent soufflait fort", type: "Principale" },
      { text: "quand la nuit est tombée", type: "Circonstancielle" }
    ],
    ruleExplanation: "« quand » introduit une subordonnée conjonctive circonstancielle de temps."
  },
  {
    id: 2,
    rawText: "L'enfant qui joue dans le jardin est mon frère.",
    bracketedText: "[L'enfant [qui joue (V) dans le jardin] S.R. est (V) mon frère.] P.P.",
    verbs: ["joue", "est"],
    propositions: [
      { text: "L'enfant est mon frère", type: "Principale" },
      { text: "qui joue dans le jardin", type: "Subordonnée relative" }
    ],
    ruleExplanation: "« qui » est un pronom relatif ayant pour antécédent « L'enfant »."
  },
  {
    id: 3,
    rawText: "Je pense que ce projet réussira.",
    bracketedText: "[Je pense (V)] P.P. [que ce projet réussira (V).] S.C.",
    verbs: ["pense", "réussira"],
    propositions: [
      { text: "Je pense", type: "Principale" },
      { text: "que ce projet réussira", type: "Complétive" }
    ],
    ruleExplanation: "« que ce projet réussira » est une subordonnée conjonctive complétive COD du verbe penser."
  },
  {
    id: 4,
    rawText: "Le soleil brille, les oiseaux chantent.",
    bracketedText: "[Le soleil brille (V)], Ind. [les oiseaux chantent (V).] Ind.",
    verbs: ["brille", "chantent"],
    propositions: [
      { text: "Le soleil brille", type: "Juxtaposition" },
      { text: "les oiseaux chantent", type: "Juxtaposition" }
    ],
    ruleExplanation: "Deux propositions indépendantes juxtaposées par une virgule."
  },
  {
    id: 5,
    rawText: "Bien qu'il pleuve, nous ferons une promenade.",
    bracketedText: "[Bien qu'il pleuve (V)], S.C. [nous ferons (V) une promenade.] P.P.",
    verbs: ["pleuve", "ferons"],
    propositions: [
      { text: "Bien qu'il pleuve", type: "Circonstancielle" },
      { text: "nous ferons une promenade", type: "Principale" }
    ],
    ruleExplanation: "« Bien que » est une locution conjonctive introduisant une concession avec verbe au subjonctif."
  },
  {
    id: 6,
    rawText: "Elle m'a demandé si j'avais terminé mes devoirs.",
    bracketedText: "[Elle m'a demandé (V)] P.P. [si j'avais terminé (V) mes devoirs.] S.I.I.",
    verbs: ["a demandé", "avais terminé"],
    propositions: [
      { text: "Elle m'a demandé", type: "Principale" },
      { text: "si j'avais terminé mes devoirs", type: "Complétive" }
    ],
    ruleExplanation: "« si j'avais terminé mes devoirs » est une interrogation indirecte."
  },
  {
    id: 7,
    rawText: "Le livre dont tu m'as parlé est épuisé.",
    bracketedText: "[Le livre [dont tu m'as parlé (V)] S.R. est (V) épuisé.] P.P.",
    verbs: ["as parlé", "est"],
    propositions: [
      { text: "Le livre est épuisé", type: "Principale" },
      { text: "dont tu m'as parlé", type: "Subordonnée relative" }
    ],
    ruleExplanation: "« dont » est le pronom relatif complément d'objet indirect de « m'as parlé »."
  },
  {
    id: 8,
    rawText: "La nuit tombée, les voyageurs cherchèrent un abri.",
    bracketedText: "[La nuit tombée (V)], S.P. [les voyageurs cherchèrent (V) un abri.] P.P.",
    verbs: ["tombée", "cherchèrent"],
    propositions: [
      { text: "La nuit tombée", type: "Circonstancielle" },
      { text: "les voyageurs cherchèrent un abri", type: "Principale" }
    ],
    ruleExplanation: "« La nuit tombée » a son propre sujet (« La nuit ») et un participe passé (« tombée ») : c'est une participiale."
  },
  {
    id: 9,
    rawText: "Je vois les enfants courir dans la cour.",
    bracketedText: "[Je vois (V)] P.P. [les enfants courir (V) dans la cour.] S.Inf.",
    verbs: ["vois", "courir"],
    propositions: [
      { text: "Je vois", type: "Principale" },
      { text: "les enfants courir dans la cour", type: "Complétive" }
    ],
    ruleExplanation: "« les enfants courir » est une proposition infinitive avec sujet propre (« les enfants »)."
  },
  {
    id: 10,
    rawText: "Puisque tu es là, aide-moi à ranger.",
    bracketedText: "[Puisque tu es (V) là], S.C. [aide-moi (V) à ranger (V).] P.P.",
    verbs: ["es", "aide", "ranger"],
    propositions: [
      { text: "Puisque tu es là", type: "Circonstancielle" },
      { text: "aide-moi à ranger", type: "Principale" }
    ],
    ruleExplanation: "« Puisque » introduit une subordonnée conjonctive de cause."
  },
  {
    id: 11,
    rawText: "Il faut que nous partions avant le lever du jour.",
    bracketedText: "[Il faut (V)] P.P. [que nous partions (V) avant le lever du jour.] S.C.",
    verbs: ["faut", "partions"],
    propositions: [
      { text: "Il faut", type: "Principale" },
      { text: "que nous partions avant le lever du jour", type: "Complétive" }
    ]
  },
  {
    id: 12,
    rawText: "La ville où je suis né a beaucoup changé.",
    bracketedText: "[La ville [où je suis né (V)] S.R. a (V) beaucoup changé (V).] P.P.",
    verbs: ["suis né", "a changé"],
    propositions: [
      { text: "La ville a beaucoup changé", type: "Principale" },
      { text: "où je suis né", type: "Subordonnée relative" }
    ]
  },
  {
    id: 13,
    rawText: "Bien qu'elle soit fatiguée, elle continue de travailler.",
    bracketedText: "[Bien qu'elle soit (V) fatiguée], S.C. [elle continue (V) de travailler (V).] P.P.",
    verbs: ["soit", "continue", "travailler"],
    propositions: [
      { text: "Bien qu'elle soit fatiguée", type: "Circonstancielle" },
      { text: "elle continue de travailler", type: "Principale" }
    ]
  },
  {
    id: 14,
    rawText: "Comme le train avait du retard, nous avons manqué la correspondance.",
    bracketedText: "[Comme le train avait (V) du retard], S.C. [nous avons manqué (V) la correspondance.] P.P.",
    verbs: ["avait", "avons manqué"],
    propositions: [
      { text: "Comme le train avait du retard", type: "Circonstancielle" },
      { text: "nous avons manqué la correspondance", type: "Principale" }
    ]
  },
  {
    id: 15,
    rawText: "Je me demande pourquoi il n'est pas venu hier.",
    bracketedText: "[Je me demande (V)] P.P. [pourquoi il n'est pas venu (V) hier.] S.I.I.",
    verbs: ["me demande", "est venu"],
    propositions: [
      { text: "Je me demande", type: "Principale" },
      { text: "pourquoi il n'est pas venu hier", type: "Complétive" }
    ]
  },
  {
    id: 16,
    rawText: "Dès que le signal sera donné, le départ aura lieu.",
    bracketedText: "[Dès que le signal sera donné (V)], S.C. [le départ aura (V) lieu.] P.P.",
    verbs: ["sera donné", "aura"],
    propositions: [
      { text: "Dès que le signal sera donné", type: "Circonstancielle" },
      { text: "le départ aura lieu", type: "Principale" }
    ]
  },
  {
    id: 17,
    rawText: "Ce musicien, que tout le monde admire, donnera un concert ce soir.",
    bracketedText: "[Ce musicien, [que tout le monde admire (V)], S.R. donnera (V) un concert ce soir.] P.P.",
    verbs: ["admire", "donnera"],
    propositions: [
      { text: "Ce musicien donnera un concert ce soir", type: "Principale" },
      { text: "que tout le monde admire", type: "Subordonnée relative" }
    ]
  },
  {
    id: 18,
    rawText: "Le professeur exige que tous les étudiants soient attentifs.",
    bracketedText: "[Le professeur exige (V)] P.P. [que tous les étudiants soient (V) attentifs.] S.C.",
    verbs: ["exige", "soient"],
    propositions: [
      { text: "Le professeur exige", type: "Principale" },
      { text: "que tous les étudiants soient attentifs", type: "Complétive" }
    ]
  },
  {
    id: 19,
    rawText: "Le repas terminé, chacun regagna sa chambre.",
    bracketedText: "[Le repas terminé (V)], S.P. [chacun regagna (V) sa chambre.] P.P.",
    verbs: ["terminé", "regagna"],
    propositions: [
      { text: "Le repas terminé", type: "Circonstancielle" },
      { text: "chacun regagna sa chambre", type: "Principale" }
    ]
  },
  {
    id: 20,
    rawText: "J'entends la pluie battre contre les carreaux.",
    bracketedText: "[J'entends (V)] P.P. [la pluie battre (V) contre les carreaux.] S.Inf.",
    verbs: ["entends", "battre"],
    propositions: [
      { text: "J'entends", type: "Principale" },
      { text: "la pluie battre contre les carreaux", type: "Complétive" }
    ]
  },
  {
    id: 21,
    rawText: "Si tu étudies avec soin, tu réussiras tes examens.",
    bracketedText: "[Si tu étudies (V) avec soin], S.C. [tu réussiras (V) tes examens.] P.P.",
    verbs: ["étudies", "réussiras"],
    propositions: [
      { text: "Si tu étudies avec soin", type: "Circonstancielle" },
      { text: "tu réussiras tes examens", type: "Principale" }
    ]
  },
  {
    id: 22,
    rawText: "La maison dont le toit est rouge appartient à mon oncle.",
    bracketedText: "[La maison [dont le toit est (V) rouge] S.R. appartient (V) à mon oncle.] P.P.",
    verbs: ["est", "appartient"],
    propositions: [
      { text: "La maison appartient à mon oncle", type: "Principale" },
      { text: "dont le toit est rouge", type: "Subordonnée relative" }
    ]
  },
  {
    id: 23,
    rawText: "Il court afin d'arriver à l'heure à la gare.",
    bracketedText: "[Il court (V)] P.P. [afin d'arriver (V) à l'heure à la gare.] S.Inf.",
    verbs: ["court", "arriver"],
    propositions: [
      { text: "Il court", type: "Principale" },
      { text: "afin d'arriver à l'heure à la gare", type: "Circonstancielle" }
    ]
  },
  {
    id: 24,
    rawText: "Quoiqu'il fasse très chaud, il porte un manteau épais.",
    bracketedText: "[Quoiqu'il fasse (V) très chaud], S.C. [il porte (V) un manteau épais.] P.P.",
    verbs: ["fasse", "porte"],
    propositions: [
      { text: "Quoiqu'il fasse très chaud", type: "Circonstancielle" },
      { text: "il porte un manteau épais", type: "Principale" }
    ]
  },
  {
    id: 25,
    rawText: "On ne sait jamais qui frappera à la porte.",
    bracketedText: "[On ne sait (V) jamais] P.P. [qui frappera (V) à la porte.] S.I.I.",
    verbs: ["sait", "frappera"],
    propositions: [
      { text: "On ne sait jamais", type: "Principale" },
      { text: "qui frappera à la porte", type: "Complétive" }
    ]
  },
  {
    id: 26,
    rawText: "Les étudiants révisent et les professeurs corrigent les copies.",
    bracketedText: "[Les étudiants révisent (V)] Ind. et [les professeurs corrigent (V) les copies.] Ind.",
    verbs: ["révisent", "corrigent"],
    propositions: [
      { text: "Les étudiants révisent", type: "Coordination" },
      { text: "les professeurs corrigent les copies", type: "Coordination" }
    ]
  },
  {
    id: 27,
    rawText: "Une fois la leçon comprise, tout devient plus facile.",
    bracketedText: "[Une fois la leçon comprise (V)], S.P. [tout devient (V) plus facile.] P.P.",
    verbs: ["comprise", "devient"],
    propositions: [
      { text: "Une fois la leçon comprise", type: "Circonstancielle" },
      { text: "tout devient plus facile", type: "Principale" }
    ]
  },
  {
    id: 28,
    rawText: "Je me souviens du jour où nous nous sommes rencontrés.",
    bracketedText: "[Je me souviens (V) du jour [où nous nous sommes rencontrés (V).]] S.R.",
    verbs: ["me souviens", "sommes rencontrés"],
    propositions: [
      { text: "Je me souviens du jour", type: "Principale" },
      { text: "où nous nous sommes rencontrés", type: "Subordonnée relative" }
    ]
  },
  {
    id: 29,
    rawText: "Bien que le chemin fût étroit, ils avancèrent sans peur.",
    bracketedText: "[Bien que le chemin fût (V) étroit], S.C. [ils avancèrent (V) sans peur.] P.P.",
    verbs: ["fût", "avancèrent"],
    propositions: [
      { text: "Bien que le chemin fût étroit", type: "Circonstancielle" },
      { text: "ils avancèrent sans peur", type: "Principale" }
    ]
  },
  {
    id: 30,
    rawText: "Elle a expliqué comment elle avait résolu cette énigme.",
    bracketedText: "[Elle a expliqué (V)] P.P. [comment elle avait résolu (V) cette énigme.] S.I.I.",
    verbs: ["a expliqué", "avait résolu"],
    propositions: [
      { text: "Elle a expliqué", type: "Principale" },
      { text: "comment elle avait résolu cette énigme", type: "Complétive" }
    ]
  },
  {
    id: 31,
    rawText: "Tandis que les uns travaillent, les autres se reposent.",
    bracketedText: "[Tandis que les uns travaillent (V)], S.C. [les autres se reposent (V).] P.P.",
    verbs: ["travaillent", "se reposent"],
    propositions: [
      { text: "Tandis que les uns travaillent", type: "Circonstancielle" },
      { text: "les autres se reposent", type: "Principale" }
    ]
  },
  {
    id: 32,
    rawText: "Le peintre qui a réalisé cette toile est célèbre.",
    bracketedText: "[Le peintre [qui a réalisé (V) cette toile] S.R. est (V) célèbre.] P.P.",
    verbs: ["a réalisé", "est"],
    propositions: [
      { text: "Le peintre est célèbre", type: "Principale" },
      { text: "qui a réalisé cette toile", type: "Subordonnée relative" }
    ]
  },
  {
    id: 33,
    rawText: "Nous craignons que le gel ne détruise les récoltes.",
    bracketedText: "[Nous craignons (V)] P.P. [que le gel ne détruise (V) les récoltes.] S.C.",
    verbs: ["craignons", "détruise"],
    propositions: [
      { text: "Nous craignons", type: "Principale" },
      { text: "que le gel ne détruise les récoltes", type: "Complétive" }
    ]
  },
  {
    id: 34,
    rawText: "Le vent souffle, la mer se déchaîne.",
    bracketedText: "[Le vent souffle (V)], Ind. [la mer se déchaîne (V).] Ind.",
    verbs: ["souffle", "se déchaîne"],
    propositions: [
      { text: "Le vent souffle", type: "Juxtaposition" },
      { text: "la mer se déchaîne", type: "Juxtaposition" }
    ]
  },
  {
    id: 35,
    rawText: "La tempête apaisée, les marins rentrèrent au port.",
    bracketedText: "[La tempête apaisée (V)], S.P. [les marins rentrèrent (V) au port.] P.P.",
    verbs: ["apaisée", "rentrèrent"],
    propositions: [
      { text: "La tempête apaisée", type: "Circonstancielle" },
      { text: "les marins rentrèrent au port", type: "Principale" }
    ]
  },
  {
    id: 36,
    rawText: "Il prétend qu'il n'a rien entendu d'insolite.",
    bracketedText: "[Il prétend (V)] P.P. [qu'il n'a rien entendu (V) d'insolite.] S.C.",
    verbs: ["prétend", "a entendu"],
    propositions: [
      { text: "Il prétend", type: "Principale" },
      { text: "qu'il n'a rien entendu d'insolite", type: "Complétive" }
    ]
  },
  {
    id: 37,
    rawText: "La clé que tu cherchais est sur la table.",
    bracketedText: "[La clé [que tu cherchais (V)] S.R. est (V) sur la table.] P.P.",
    verbs: ["cherchais", "est"],
    propositions: [
      { text: "La clé est sur la table", type: "Principale" },
      { text: "que tu cherchais", type: "Subordonnée relative" }
    ]
  },
  {
    id: 38,
    rawText: "Je t'appellerai dès que j'arriverai à destination.",
    bracketedText: "[Je t'appellerai (V)] P.P. [dès que j'arriverai (V) à destination.] S.C.",
    verbs: ["appellerai", "arriverai"],
    propositions: [
      { text: "Je t'appellerai", type: "Principale" },
      { text: "dès que j'arriverai à destination", type: "Circonstancielle" }
    ]
  },
  {
    id: 39,
    rawText: "Dis-moi quand tu seras prêt à partir.",
    bracketedText: "[Dis-moi (V)] P.P. [quand tu seras (V) prêt à partir (V).] S.I.I.",
    verbs: ["Dis", "seras", "partir"],
    propositions: [
      { text: "Dis-moi", type: "Principale" },
      { text: "quand tu seras prêt à partir", type: "Complétive" }
    ]
  },
  {
    id: 40,
    rawText: "Aussitôt que la cloche sonna, les enfants sortirent en courant.",
    bracketedText: "[Aussitôt que la cloche sonna (V)], S.C. [les enfants sortirent (V) en courant.] P.P.",
    verbs: ["sonna", "sortirent"],
    propositions: [
      { text: "Aussitôt que la cloche sonna", type: "Circonstancielle" },
      { text: "les enfants sortirent en courant", type: "Principale" }
    ]
  },
  {
    id: 41,
    rawText: "Le village auquel je pense se trouve dans les montagnes.",
    bracketedText: "[Le village [auquel je pense (V)] S.R. se trouve (V) dans les montagnes.] P.P.",
    verbs: ["pense", "se trouve"],
    propositions: [
      { text: "Le village se trouve dans les montagnes", type: "Principale" },
      { text: "auquel je pense", type: "Subordonnée relative" }
    ]
  },
  {
    id: 42,
    rawText: "Quoique la tâche soit difficile, nous la terminerons.",
    bracketedText: "[Quoique la tâche soit (V) difficile], S.C. [nous la terminerons (V).] P.P.",
    verbs: ["soit", "terminerons"],
    propositions: [
      { text: "Quoique la tâche soit difficile", type: "Circonstancielle" },
      { text: "nous la terminerons", type: "Principale" }
    ]
  },
  {
    id: 43,
    rawText: "Je vois les nuages se dissiper peu à peu.",
    bracketedText: "[Je vois (V)] P.P. [les nuages se dissiper (V) peu à peu.] S.Inf.",
    verbs: ["vois", "se dissiper"],
    propositions: [
      { text: "Je vois", type: "Principale" },
      { text: "les nuages se dissiper peu à peu", type: "Complétive" }
    ]
  },
  {
    id: 44,
    rawText: "Il agit de sorte que tout le monde soit satisfait.",
    bracketedText: "[Il agit (V)] P.P. [de sorte que tout le monde soit (V) satisfait.] S.C.",
    verbs: ["agit", "soit"],
    propositions: [
      { text: "Il agit", type: "Principale" },
      { text: "de sorte que tout le monde soit satisfait", type: "Circonstancielle" }
    ]
  },
  {
    id: 45,
    rawText: "Elle ignore quel chemin il a emprunté.",
    bracketedText: "[Elle ignore (V)] P.P. [quel chemin il a emprunté (V).] S.I.I.",
    verbs: ["ignore", "a emprunté"],
    propositions: [
      { text: "Elle ignore", type: "Principale" },
      { text: "quel chemin il a emprunté", type: "Complétive" }
    ]
  },
  {
    id: 46,
    rawText: "Les cours finis, la salle se videra rapidement.",
    bracketedText: "[Les cours finis (V)], S.P. [la salle se videra (V) rapidement.] P.P.",
    verbs: ["finis", "se videra"],
    propositions: [
      { text: "Les cours finis", type: "Circonstancielle" },
      { text: "la salle se videra rapidement", type: "Principale" }
    ]
  },
  {
    id: 47,
    rawText: "Si vous désirez venir, prévenez-moi à l'avance.",
    bracketedText: "[Si vous désirez (V) venir (V)], S.C. [prévenez-moi (V) à l'avance.] P.P.",
    verbs: ["désirez", "venir", "prévenez"],
    propositions: [
      { text: "Si vous désirez venir", type: "Circonstancielle" },
      { text: "prévenez-moi à l'avance", type: "Principale" }
    ]
  },
  {
    id: 48,
    rawText: "L'artiste dont l'œuvre est exposée ici est très talentueux.",
    bracketedText: "[L'artiste [dont l'œuvre est exposée (V) ici] S.R. est (V) très talentueux.] P.P.",
    verbs: ["est exposée", "est"],
    propositions: [
      { text: "L'artiste est très talentueux", type: "Principale" },
      { text: "dont l'œuvre est exposée ici", type: "Subordonnée relative" }
    ]
  },
  {
    id: 49,
    rawText: "Il bavarde pendant que le professeur explique la règle.",
    bracketedText: "[Il bavarde (V)] P.P. [pendant que le professeur explique (V) la règle.] S.C.",
    verbs: ["bavarde", "explique"],
    propositions: [
      { text: "Il bavarde", type: "Principale" },
      { text: "pendant que le professeur explique la règle", type: "Subordonnée conjonctive" }
    ]
  },
  {
    id: 50,
    rawText: "Elle se demande où elle a égaré ses clés.",
    bracketedText: "[Elle se demande (V)] P.P. [où elle a égaré (V) ses clés.] S.I.I.",
    verbs: ["se demande", "a égaré"],
    propositions: [
      { text: "Elle se demande", type: "Principale" },
      { text: "où elle a égaré ses clés", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 51,
    rawText: "Pourvu qu'il fasse beau, la fête aura lieu en plein air.",
    bracketedText: "[Pourvu qu'il fasse (V) beau], S.C. [la fête aura (V) lieu en plein air.] P.P.",
    verbs: ["fasse", "aura"],
    propositions: [
      { text: "Pourvu qu'il fasse beau", type: "Subordonnée conjonctive" },
      { text: "la fête aura lieu en plein air", type: "Principale" }
    ]
  },
  {
    id: 52,
    rawText: "Ce livre raconte l'histoire d'un héros que rien ne décourage.",
    bracketedText: "[Ce livre raconte (V) l'histoire d'un héros [que rien ne décourage (V).]] S.R.",
    verbs: ["raconte", "décourage"],
    propositions: [
      { text: "Ce livre raconte l'histoire d'un héros", type: "Principale" },
      { text: "que rien ne décourage", type: "Subordonnée relative" }
    ]
  },
  {
    id: 53,
    rawText: "Sans qu'aucun bruit se fasse entendre, l'ombre glissa dans la nuit.",
    bracketedText: "[Sans qu'aucun bruit se fasse (V) entendre (V)], S.C. [l'ombre glissa (V) dans la nuit.] P.P.",
    verbs: ["fasse", "entendre", "glissa"],
    propositions: [
      { text: "Sans qu'aucun bruit se fasse entendre", type: "Subordonnée conjonctive" },
      { text: "l'ombre glissa dans la nuit", type: "Principale" }
    ]
  },
  {
    id: 54,
    rawText: "Le chat dort sur le fauteuil, le chien monte la garde.",
    bracketedText: "[Le chat dort (V) sur le fauteuil], Ind. [le chien monte (V) la garde.] Ind.",
    verbs: ["dort", "monte"],
    propositions: [
      { text: "Le chat dort sur le fauteuil", type: "Indépendante" },
      { text: "le chien monte la garde", type: "Indépendante" }
    ]
  },
  {
    id: 55,
    rawText: "La porte fermée à clé, nous fûmes en sécurité.",
    bracketedText: "[La porte fermée (V) à clé], S.P. [nous fûmes (V) en sécurité.] P.P.",
    verbs: ["fermée", "fûmes"],
    propositions: [
      { text: "La porte fermée à clé", type: "Subordonnée participiale" },
      { text: "nous fûmes en sécurité", type: "Principale" }
    ]
  },
  {
    id: 56,
    rawText: "Je doute qu'il soit au courant des derniers événements.",
    bracketedText: "[Je doute (V)] P.P. [qu'il soit (V) au courant des derniers événements.] S.C.",
    verbs: ["doute", "soit"],
    propositions: [
      { text: "Je doute", type: "Principale" },
      { text: "qu'il soit au courant des derniers événements", type: "Subordonnée conjonctive" }
    ]
  },
  {
    id: 57,
    rawText: "Le paysage que nous admirons s'étend à perte de vue.",
    bracketedText: "[Le paysage [que nous admirons (V)] S.R. s'étend (V) à perte de vue.] P.P.",
    verbs: ["admirons", "s'étend"],
    propositions: [
      { text: "Le paysage s'étend à perte de vue", type: "Principale" },
      { text: "que nous admirons", type: "Subordonnée relative" }
    ]
  },
  {
    id: 58,
    rawText: "À mesure que le temps passe, les souvenirs s'estompent.",
    bracketedText: "[À mesure que le temps passe (V)], S.C. [les souvenirs s'estompent (V).] P.P.",
    verbs: ["passe", "s'estompent"],
    propositions: [
      { text: "À mesure que le temps passe", type: "Subordonnée conjonctive" },
      { text: "les souvenirs s'estompent", type: "Principale" }
    ]
  },
  {
    id: 59,
    rawText: "Raconte-moi ce qui s'est passé pendant mon absence.",
    bracketedText: "[Raconte-moi (V)] P.P. [ce qui s'est passé (V) pendant mon absence.] S.R.",
    verbs: ["Raconte", "s'est passé"],
    propositions: [
      { text: "Raconte-moi", type: "Principale" },
      { text: "ce qui s'est passé pendant mon absence", type: "Subordonnée relative" }
    ]
  },
  {
    id: 60,
    rawText: "Tellement il était épuisé qu'il s'endormit immédiatement.",
    bracketedText: "[Tellement il était (V) épuisé] P.P. [qu'il s'endormit (V) immédiatement.] S.C.",
    verbs: ["était", "s'endormit"],
    propositions: [
      { text: "Tellement il était épuisé", type: "Principale" },
      { text: "qu'il s'endormit immédiatement", type: "Subordonnée conjonctive" }
    ]
  },
  {
    id: 61,
    rawText: "Chaque fois qu'il parle, tout le monde l'écoute.",
    bracketedText: "[Chaque fois qu'il parle (V)], S.C. [tout le monde l'écoute (V).] P.P.",
    verbs: ["parle", "écoute"],
    propositions: [
      { text: "Chaque fois qu'il parle", type: "Subordonnée conjonctive" },
      { text: "tout le monde l'écoute", type: "Principale" }
    ]
  },
  {
    id: 62,
    rawText: "L'endroit où nous avons campé était magnifique.",
    bracketedText: "[L'endroit [où nous avons campé (V)] S.R. était (V) magnifique.] P.P.",
    verbs: ["avons campé", "était"],
    propositions: [
      { text: "L'endroit était magnifique", type: "Principale" },
      { text: "où nous avons campé", type: "Subordonnée relative" }
    ]
  },
  {
    id: 63,
    rawText: "Bien que le vent souffle fort, les marins restent calmes.",
    bracketedText: "[Bien que le vent souffle (V) fort], S.C. [les marins restent (V) calmes.] P.P.",
    verbs: ["souffle", "restent"],
    propositions: [
      { text: "Bien que le vent souffle fort", type: "Subordonnée conjonctive" },
      { text: "les marins restent calmes", type: "Principale" }
    ]
  },
  {
    id: 64,
    rawText: "Je ne comprends pas comment cette machine fonctionne.",
    bracketedText: "[Je ne comprends (V) pas] P.P. [comment cette machine fonctionne (V).] S.I.I.",
    verbs: ["comprends", "fonctionne"],
    propositions: [
      { text: "Je ne comprends pas", type: "Principale" },
      { text: "comment cette machine fonctionne", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 65,
    rawText: "Le travail achevé, nous pourrons célébrer notre réussite.",
    bracketedText: "[Le travail achevé (V)], S.P. [nous pourrons (V) célébrer (V) notre réussite.] P.P.",
    verbs: ["achevé", "pourrons", "célébrer"],
    propositions: [
      { text: "Le travail achevé", type: "Subordonnée participiale" },
      { text: "nous pourrons célébrer notre réussite", type: "Principale" }
    ]
  },
  {
    id: 66,
    rawText: "Si le temps se gâte, nous rentrerons à la maison.",
    bracketedText: "[Si le temps se gâte (V)], S.C. [nous rentrerons (V) à la maison.] P.P.",
    verbs: ["se gâte", "rentrerons"],
    propositions: [
      { text: "Si le temps se gâte", type: "Subordonnée conjonctive" },
      { text: "nous rentrerons à la maison", type: "Principale" }
    ]
  },
  {
    id: 67,
    rawText: "Le poème que tu as récite m'a profondément ému.",
    bracketedText: "[Le poème [que tu as récité (V)] S.R. m'a (V) profondément ému.] P.P.",
    verbs: ["as récité", "a ému"],
    propositions: [
      { text: "Le poème m'a profondément ému", type: "Principale" },
      { text: "que tu as récité", type: "Subordonnée relative" }
    ]
  },
  {
    id: 68,
    rawText: "Tant que tu seras honnête, on te fera confiance.",
    bracketedText: "[Tant que tu seras (V) honnête], S.C. [on te fera (V) confiance.] P.P.",
    verbs: ["seras", "fera"],
    propositions: [
      { text: "Tant que tu seras honnête", type: "Subordonnée conjonctive" },
      { text: "on te fera confiance", type: "Principale" }
    ]
  },
  {
    id: 69,
    rawText: "Dis-moi si tu connais cette chanson.",
    bracketedText: "[Dis-moi (V)] P.P. [si tu connais (V) cette chanson.] S.I.I.",
    verbs: ["Dis", "connais"],
    propositions: [
      { text: "Dis-moi", type: "Principale" },
      { text: "si tu connais cette chanson", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 70,
    rawText: "Le train parti, la gare retrouva son calme habituel.",
    bracketedText: "[Le train parti (V)], S.P. [la gare retrouva (V) son calme habituel.] P.P.",
    verbs: ["parti", "retrouva"],
    propositions: [
      { text: "Le train parti", type: "Subordonnée participiale" },
      { text: "la gare retrouva son calme habituel", type: "Principale" }
    ]
  },
  {
    id: 71,
    rawText: "Il me semble que cette décision est la meilleure.",
    bracketedText: "[Il me semble (V)] P.P. [que cette décision est (V) la meilleure.] S.C.",
    verbs: ["semble", "est"],
    propositions: [
      { text: "Il me semble", type: "Principale" },
      { text: "que cette décision est la meilleure", type: "Subordonnée conjonctive" }
    ]
  },
  {
    id: 72,
    rawText: "Le secret dont il garde le souvenir ne sera jamais révélé.",
    bracketedText: "[Le secret [dont il garde (V) le souvenir] S.R. ne sera (V) jamais révélé.] P.P.",
    verbs: ["garde", "sera révélé"],
    propositions: [
      { text: "Le secret ne sera jamais révélé", type: "Principale" },
      { text: "dont il garde le souvenir", type: "Subordonnée relative" }
    ]
  },
  {
    id: 73,
    rawText: "Avant que l'hiver n'arrive, nous devons faire des réserves.",
    bracketedText: "[Avant que l'hiver n'arrive (V)], S.C. [nous devons (V) faire (V) des réserves.] P.P.",
    verbs: ["arrive", "devons", "faire"],
    propositions: [
      { text: "Avant que l'hiver n'arrive", type: "Subordonnée conjonctive" },
      { text: "nous devons faire des réserves", type: "Principale" }
    ]
  },
  {
    id: 74,
    rawText: "J'observe les feuilles tomber doucement de l'arbre.",
    bracketedText: "[J'observe (V)] P.P. [les feuilles tomber (V) doucement de l'arbre.] S.Inf.",
    verbs: ["observe", "tomber"],
    propositions: [
      { text: "J'observe", type: "Principale" },
      { text: "les feuilles tomber doucement de l'arbre", type: "Subordonnée infinitive" }
    ]
  },
  {
    id: 75,
    rawText: "Quoiqu'on en dise, cet effort en valait la peine.",
    bracketedText: "[Quoiqu'on en dise (V)], S.C. [cet effort en valait (V) la peine.] P.P.",
    verbs: ["dise", "valait"],
    propositions: [
      { text: "Quoiqu'on en dise", type: "Subordonnée conjonctive" },
      { text: "cet effort en valait la peine", type: "Principale" }
    ]
  },
  {
    id: 76,
    rawText: "Le vent souffle en rafales, les branches craquent.",
    bracketedText: "[Le vent souffle (V) en rafales], Ind. [les branches craquent (V).] Ind.",
    verbs: ["souffle", "craquent"],
    propositions: [
      { text: "Le vent souffle en rafales", type: "Indépendante" },
      { text: "les branches craquent", type: "Indépendante" }
    ]
  },
  {
    id: 77,
    rawText: "La question à laquelle il a répondu était complexe.",
    bracketedText: "[La question [à laquelle il a répondu (V)] S.R. était (V) complexe.] P.P.",
    verbs: ["a répondu", "était"],
    propositions: [
      { text: "La question était complexe", type: "Principale" },
      { text: "à laquelle il a répondu", type: "Subordonnée relative" }
    ]
  },
  {
    id: 78,
    rawText: "Dès que le jour se lève, le coq chante.",
    bracketedText: "[Dès que le jour se lève (V)], S.C. [le coq chante (V).] P.P.",
    verbs: ["se lève", "chante"],
    propositions: [
      { text: "Dès que le jour se lève", type: "Subordonnée conjonctive" },
      { text: "le coq chante", type: "Principale" }
    ]
  },
  {
    id: 79,
    rawText: "Je me demande ce qui a provoqué cet accident.",
    bracketedText: "[Je me demande (V)] P.P. [ce qui a provoqué (V) cet accident.] S.I.I.",
    verbs: ["me demande", "a provoqué"],
    propositions: [
      { text: "Je me demande", type: "Principale" },
      { text: "ce qui a provoqué cet accident", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 80,
    rawText: "Une fois le soleil couché, la température chuta brusquement.",
    bracketedText: "[Une fois le soleil couché (V)], S.P. [la température chuta (V) brusquement.] P.P.",
    verbs: ["couché", "chuta"],
    propositions: [
      { text: "Une fois le soleil couché", type: "Subordonnée participiale" },
      { text: "la température chuta brusquement", type: "Principale" }
    ]
  },
  {
    id: 81,
    rawText: "Bien qu'il soit jeune, il possède une grande maturité.",
    bracketedText: "[Bien qu'il soit (V) jeune], S.C. [il possède (V) une grande maturité.] P.P.",
    verbs: ["soit", "possède"],
    propositions: [
      { text: "Bien qu'il soit jeune", type: "Subordonnée conjonctive" },
      { text: "il possède une grande maturité", type: "Principale" }
    ]
  },
  {
    id: 82,
    rawText: "L'idée qu'il a proposée a séduit tout le comité.",
    bracketedText: "[L'idée [qu'il a proposée (V)] S.R. a séduit (V) tout le comité.] P.P.",
    verbs: ["a proposée", "a séduit"],
    propositions: [
      { text: "L'idée a séduit tout le comité", type: "Principale" },
      { text: "qu'il a proposée", type: "Subordonnée relative" }
    ]
  },
  {
    id: 83,
    rawText: "Pendant que les enfants dorment, les parents préparent la fête.",
    bracketedText: "[Pendant que les enfants dorment (V)], S.C. [les parents préparent (V) la fête.] P.P.",
    verbs: ["dorment", "préparent"],
    propositions: [
      { text: "Pendant que les enfants dorment", type: "Subordonnée conjonctive" },
      { text: "les parents préparent la fête", type: "Principale" }
    ]
  },
  {
    id: 84,
    rawText: "Explique-moi ce que tu as appris aujourd'hui.",
    bracketedText: "[Explique-moi (V)] P.P. [ce que tu as appris (V) aujourd'hui.] S.I.I.",
    verbs: ["Explique", "as appris"],
    propositions: [
      { text: "Explique-moi", type: "Principale" },
      { text: "ce que tu as appris aujourd'hui", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 85,
    rawText: "Les feux d'artifice éclatèrent, la foule applaudit.",
    bracketedText: "[Les feux d'artifice éclatèrent (V)], Ind. [la foule applaudit (V).] Ind.",
    verbs: ["éclatèrent", "applaudit"],
    propositions: [
      { text: "Les feux d'artifice éclatèrent", type: "Indépendante" },
      { text: "la foule applaudit", type: "Indépendante" }
    ]
  },
  {
    id: 86,
    rawText: "La décision prise, nul ne revint en arrière.",
    bracketedText: "[La décision prise (V)], S.P. [nul ne revint (V) en arrière.] P.P.",
    verbs: ["prise", "revint"],
    propositions: [
      { text: "La décision prise", type: "Subordonnée participiale" },
      { text: "nul ne revint en arrière", type: "Principale" }
    ]
  },
  {
    id: 87,
    rawText: "Si tu m'avais prévenu à temps, j'aurais pu t'aider.",
    bracketedText: "[Si tu m'avais prévenu (V) à temps], S.C. [j'aurais pu (V) t'aider (V).] P.P.",
    verbs: ["avais prévenu", "aurais pu", "aider"],
    propositions: [
      { text: "Si tu m'avais prévenu à temps", type: "Subordonnée conjonctive" },
      { text: "j'aurais pu t'aider", type: "Principale" }
    ]
  },
  {
    id: 88,
    rawText: "Le monument devant lequel nous passons date du Moyen Âge.",
    bracketedText: "[Le monument [devant lequel nous passons (V)] S.R. date (V) du Moyen Âge.] P.P.",
    verbs: ["passons", "date"],
    propositions: [
      { text: "Le monument date du Moyen Âge", type: "Principale" },
      { text: "devant lequel nous passons", type: "Subordonnée relative" }
    ]
  },
  {
    id: 89,
    rawText: "Afin que nul n'ignore la loi, elle est publiée au journal officiel.",
    bracketedText: "[Afin que nul n'ignore (V) la loi], S.C. [elle est publiée (V) au journal officiel.] P.P.",
    verbs: ["ignore", "est publiée"],
    propositions: [
      { text: "Afin que nul n'ignore la loi", type: "Subordonnée conjonctive" },
      { text: "elle est publiée au journal officiel", type: "Principale" }
    ]
  },
  {
    id: 90,
    rawText: "J'écoute l'eau couler le long du ruisseau.",
    bracketedText: "[J'écoute (V)] P.P. [l'eau couler (V) le long du ruisseau.] S.Inf.",
    verbs: ["écoute", "couler"],
    propositions: [
      { text: "J'écoute", type: "Principale" },
      { text: "l'eau couler le long du ruisseau", type: "Subordonnée infinitive" }
    ]
  },
  {
    id: 91,
    rawText: "Bien que la nuit fût tombée, la ville restait animée.",
    bracketedText: "[Bien que la nuit fût tombée (V)], S.C. [la ville restait (V) animée.] P.P.",
    verbs: ["fût tombée", "restait"],
    propositions: [
      { text: "Bien que la nuit fût tombée", type: "Subordonnée conjonctive" },
      { text: "la ville restait animée", type: "Principale" }
    ]
  },
  {
    id: 92,
    rawText: "L'homme à qui tu as parlé est le directeur.",
    bracketedText: "[L'homme [à qui tu as parlé (V)] S.R. est (V) le directeur.] P.P.",
    verbs: ["as parlé", "est"],
    propositions: [
      { text: "L'homme est le directeur", type: "Principale" },
      { text: "à qui tu as parlé", type: "Subordonnée relative" }
    ]
  },
  {
    id: 93,
    rawText: "Sitôt que le soleil apparut, la brume se dissipa.",
    bracketedText: "[Sitôt que le soleil apparut (V)], S.C. [la brume se dissipa (V).] P.P.",
    verbs: ["apparut", "se dissipa"],
    propositions: [
      { text: "Sitôt que le soleil apparut", type: "Subordonnée conjonctive" },
      { text: "la brume se dissipa", type: "Principale" }
    ]
  },
  {
    id: 94,
    rawText: "Je me demande si ce chemin mène au sommet.",
    bracketedText: "[Je me demande (V)] P.P. [si ce chemin mène (V) au sommet.] S.I.I.",
    verbs: ["me demande", "mène"],
    propositions: [
      { text: "Je me demande", type: "Principale" },
      { text: "si ce chemin mène au sommet", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 95,
    rawText: "Le signal donné, les coureurs s'élancèrent.",
    bracketedText: "[Le signal donné (V)], S.P. [les coureurs s'élancèrent (V).] P.P.",
    verbs: ["donné", "s'élancèrent"],
    propositions: [
      { text: "Le signal donné", type: "Subordonnée participiale" },
      { text: "les coureurs s'élancèrent", type: "Principale" }
    ]
  },
  {
    id: 96,
    rawText: "Pour peu que tu fasses un effort, tu réussiras.",
    bracketedText: "[Pour peu que tu fasses (V) un effort], S.C. [tu réussiras (V).] P.P.",
    verbs: ["fasses", "réussiras"],
    propositions: [
      { text: "Pour peu que tu fasses un effort", type: "Subordonnée conjonctive" },
      { text: "tu réussiras", type: "Principale" }
    ]
  },
  {
    id: 97,
    rawText: "La maison où j'ai grandi a été démolie.",
    bracketedText: "[La maison [où j'ai grandi (V)] S.R. a été démolie (V).] P.P.",
    verbs: ["ai grandi", "a été démolie"],
    propositions: [
      { text: "La maison a été démolie", type: "Principale" },
      { text: "où j'ai grandi", type: "Subordonnée relative" }
    ]
  },
  {
    id: 98,
    rawText: "Tandis que l’orage gronde au loin, la pluie commence à tomber.",
    bracketedText: "[Tandis que l’orage gronde (V) au loin], S.C. [la pluie commence (V) à tomber (V).] P.P.",
    verbs: ["gronde", "commence", "tomber"],
    propositions: [
      { text: "Tandis que l’orage gronde au loin", type: "Subordonnée conjonctive" },
      { text: "la pluie commence à tomber", type: "Principale" }
    ]
  },
  {
    id: 99,
    rawText: "Dis-nous pourquoi tu as choisi ce livre.",
    bracketedText: "[Dis-nous (V)] P.P. [pourquoi tu as choisi (V) ce livre.] S.I.I.",
    verbs: ["Dis", "as choisi"],
    propositions: [
      { text: "Dis-nous", type: "Principale" },
      { text: "pourquoi tu as choisi ce livre", type: "Subordonnée interrogative indirecte" }
    ]
  },
  {
    id: 100,
    rawText: "La tempête calmée, les navires purent enfin reprendre la mer.",
    bracketedText: "[La tempête calmée (V)], S.P. [les navires purent (V) enfin reprendre (V) la mer.] P.P.",
    verbs: ["calmée", "purent", "reprendre"],
    propositions: [
      { text: "La tempête calmée", type: "Subordonnée participiale" },
      { text: "les navires purent enfin reprendre la mer", type: "Principale" }
    ]
  }
];
