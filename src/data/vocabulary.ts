export interface VocabularyEntry {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  category: 'figures-style' | 'classes-mots' | 'termes-analyse';
}

export const vocabularyList: VocabularyEntry[] = [
  // Figures de style
  { id: 'v1', word: 'Métaphore', definition: 'Transfert de sens d\'un mot à un autre par comparaison implicite, sans mot de comparaison.', partOfSpeech: 'nom féminin', example: '"Son regard est une arme" — la comparaison sans "comme"', category: 'figures-style' },
  { id: 'v2', word: 'Comparaison', definition: 'Rapprochement de deux éléments через un mot de comparaison (comme, tel, pareils à).', partOfSpeech: 'nom féminin', example: '"Sage comme une image"', category: 'figures-style' },
  { id: 'v3', word: 'Personnification', definition: 'Figure qui attribue des caractéristiques humaines à un animal, une chose ou une abstraction.', partOfSpeech: 'nom féminin', example: '"La nuit s\'étend sur la ville"', category: 'figures-style' },
  { id: 'v4', word: 'Métonymie', definition: 'Remplacement d\'un mot par un autre qui lui est logiquement lié (contenant pour contenu, cause pour effet).', partOfSpeech: 'nom féminin', example: '"Boire un verre" (le contenu pour le contenant)', category: 'figures-style' },
  { id: 'v5', word: 'Synecdoque', definition: 'Figure consistant à prendre la partie pour le tout ou le tout pour la partie.', partOfSpeech: 'nom féminin', example: '"Les voiles" pour "les bateaux"', category: 'figures-style' },
  { id: 'v6', word: 'Hypotypose', definition: 'Figure qui rend une scène de manière si vivante qu\'elle semble se dérouler sous nos yeux.', partOfSpeech: 'nom féminin', example: '"Je voyais le couteau s\'enfoncer dans sa chair"', category: 'figures-style' },
  { id: 'v7', word: 'Antithèse', definition: 'Opposition de deux termes ou idées contrastés dans un même vers/phrase.', partOfSpeech: 'nom féminin', example: '"Grandir et mourir", "lumière et ténèbres"', category: 'figures-style' },
  { id: 'v8', word: 'Paradoxe', definition: 'Assertion qui semble absurde mais qui révèle une vérité profonde.', partOfSpeech: 'nom masculin', example: '"Il faut traverser la nuit pour voir l\'aurore"', category: 'figures-style' },
  { id: 'v9', word: 'Oxymore', definition: 'Association de deux termes contradictoires qui créent un effet de sens.', partOfSpeech: 'nom masculin', example: '"Un silence bruyant", "une obscure clarté"', category: 'figures-style' },
  { id: 'v10', word: 'Euphémisme', definition: 'Atténuation d\'une idée dure ou unpleasant par un terme plus doux.', partOfSpeech: 'nom masculin', example: '"Il s\'est éteint" pour "il est mort"', category: 'figures-style' },
  { id: 'v11', word: 'Hyperbole', definition: 'Exagération outrancière pour renforcer une idée ou une émotion.', partOfSpeech: 'nom féminin', example: '"Je t\'attends depuis mille ans"', category: 'figures-style' },
  { id: 'v12', word: 'Litote', definition: 'Figure qui dit moins pour suggérer plus, par understatement.', partOfSpeech: 'nom féminin', example: '"Il n\'est paslaid" pour "il est beau"', category: 'figures-style' },
  { id: 'v13', word: 'Cliché', definition: 'Expression utilisée à force d\'être répétée, qui perd son originalité.', partOfSpeech: 'nom masculin', example: '"Avoir un cœur de pierre"', category: 'figures-style' },
  { id: 'v14', word: 'Répétition', definition: 'Reprise d\'un mot ou d\'une expression pour insister ou créer un rythme.', partOfSpeech: 'nom féminin', example: '"Ah! le vent, le vent, le vent!"', category: 'figures-style' },
  { id: 'v15', word: 'Anaphore', definition: 'Répétition d\'un mot ou groupe de mots en début de vers ou phrases consécutives.', partOfSpeech: 'nom féminin', example: '"Je suis..., je suis..., je suis..."', category: 'figures-style' },
  { id: 'v16', word: 'Énumération', definition: 'Suite de mots ou expressions détaillant une série.', partOfSpeech: 'nom féminin', example: '"Fruits, légumes, fromages, viandes"', category: 'figures-style' },
  { id: 'v17', word: 'Gradation', definition: 'Suite de termes allant crescendo ou decrescendo en intensité.', partOfSpeech: 'nom féminin', example: '"Je suis triste, meurtri, brisé"', category: 'figures-style' },
  { id: 'v18', word: 'Allitération', definition: 'Répétition d\'une même consonne pour créer un effet sonore.', partOfSpeech: 'nom féminin', example: '"Les sanglots longs des violons"', category: 'figures-style' },
  { id: 'v19', word: 'Assonance', definition: 'Répétition d\'une même voyelle pour créer une harmonie sonore.', partOfSpeech: 'nom féminin', example: '"Le vent qui gémit, l\'amour qui pleure"', category: 'figures-style' },
  { id: 'v20', word: 'Chiasme', definition: 'Disposition symétrique inversée de deux éléments.', partOfSpeech: 'nom masculin', example: '"Les mauvais choix font les bonnes fin" (A-B-B-A)', category: 'figures-style' },

  // Classes de mots
  { id: 'v21', word: 'Article défini', definition: 'Le, la, les, l\' — indique quelque chose de spécifique.', partOfSpeech: 'déterminant', example: '"Le chat noir"', category: 'classes-mots' },
  { id: 'v22', word: 'Article indéfini', definition: 'Un, une, des — indique quelque chose de non identifié.', partOfSpeech: 'déterminant', example: '"Un oiseau chante"', category: 'classes-mots' },
  { id: 'v23', word: 'Pronom personnel', definition: 'Mot qui remplace un nom (je, tu, il, nous, vous, ils...).', partOfSpeech: 'pronom', example: '"Je suis content"', category: 'classes-mots' },
  { id: 'v24', word: 'Adjectif possessif', definition: 'Déterminant qui indique la possession (mon, ton, son, notre...).', partOfSpeech: 'déterminant', example: '"Mon livre, ta maison"', category: 'classes-mots' },
  { id: 'v25', word: 'Adjectif démonstratif', definition: 'Déterminant qui montre (ce, cette, ces).', partOfSpeech: 'déterminant', example: '"Ce livre, cette fleur"', category: 'classes-mots' },
  { id: 'v26', word: 'Adjectif numéral', definition: 'Mot qui indique une quantité ou un ordre (un, deux, premier...).', partOfSpeech: 'déterminant', example: '"Trois enfants, le premier"', category: 'classes-mots' },
  { id: 'v27', word: 'Adverbe', definition: 'Mot invariable qui modifie un verbe, un adjectif ou un autre adverbe.', partOfSpeech: 'invariable', example: '"Très beau, marcher lentement"', category: 'classes-mots' },
  { id: 'v28', word: 'Préposition', definition: 'Mot invariable qui établit un rapport entre deux éléments.', partOfSpeech: 'invariable', example: '"à, de, pour, avec, sans"', category: 'classes-mots' },
  { id: 'v29', word: 'Conjonction de coordination', definition: 'Mot invariable qui relie deux éléments de même fonction.', partOfSpeech: 'invariable', example: '"mais, ou, et, donc, or, ni, car"', category: 'classes-mots' },
  { id: 'v30', word: 'Interjection', definition: 'Mot exclamatif exprimant une émotion ou un ordre.', partOfSpeech: 'invariable', example: '"Ah! Oh! Hélas! Vive la France!"', category: 'classes-mots' },

  // Termes d'analyse
  { id: 'v31', word: 'Thème', definition: 'Sujet principal d\'un texte, ce dont il parle.', partOfSpeech: 'nom masculin', example: '"Le thème de la mort dans ce poème"', category: 'termes-analyse' },
  { id: 'v32', word: 'Variations', definition: 'Évolution du thème à travers le texte ou lauteur.', partOfSpeech: 'nom féminin', example: '"Les variations du thème de l\'amour"', category: 'termes-analyse' },
  { id: 'v33', word: 'Tonalité', definition: 'Registre émotionnel dominant du texte (lyrique, ironique, tragiques...).', partOfSpeech: 'nom féminin', example: '"Tonalité élégiaque, tonoalité comique"', category: 'termes-analyse' },
  { id: 'v34', word: 'Registre', definition: 'Type de texte répondant à une intention communicationnelle (lyrique, narratif, argumentatif...).', partOfSpeech: 'nom masculin', example: '"Registre lyrique, registre satirique"', category: 'termes-analyse' },
  { id: 'v35', word: 'Champ lexical', definition: 'Ensemble de mots liés à un même domaine de sens.', partOfSpeech: 'nom masculin', example: '"Champ lexical de la mer: vagues, rivage, naufrage..."', category: 'termes-analyse' },
  { id: 'v36', word: 'Champ sémantique', definition: 'Ensemble des meanings possibles d\'un mot dans son contexte.', partOfSpeech: 'nom masculin', example: '"Le champ sémantique de "forêt""', category: 'termes-analyse' },
  { id: 'v37', word: 'Sémantique', definition: 'Étude du sens des mots et des phrases.', partOfSpeech: 'nom féminin', example: 'L\'analyse sémantique d\'un terme', category: 'termes-analyse' },
  { id: 'v38', word: 'Vers', definition: 'Ligne de texte dans un poème, avec ou sans rime.', partOfSpeech: 'nom masculin', example: '"Ce poème compte 14 vers"', category: 'termes-analyse' },
  { id: 'v39', word: 'Strophe', definition: 'Groupe de vers séparé par un espace blanc.', partOfSpeech: 'nom féminin', example: '"Les quatre strophes du sonnet"', category: 'termes-analyse' },
  { id: 'v40', word: 'Rime', definition: 'Identité sonore entre la fin de deux vers.', partOfSpeech: 'nom féminin', example: '"Rime embrassée: ABBA"', category: 'termes-analyse' },
  { id: 'v41', word: 'Prosodie', definition: 'Étude de la versification: rythme, longueur des syllabes, accents.', partOfSpeech: 'nom féminin', example: 'La prosodie du vers alexandrin', category: 'termes-analyse' },
  { id: 'v42', word: 'Prosaïque', definition: 'Qui concerne la prose ou qui est banal, terre-à-terre.', partOfSpeech: 'adjectif', example: '"Un ton prosaïque"', category: 'termes-analyse' },
  { id: 'v43', word: 'Élocution', definition: 'Manière de sexprimer à l\'oral, clarté et articulation.', partOfSpeech: 'nom féminin', example: '"Élocution parfaite"', category: 'termes-analyse' },
  { id: 'v44', word: 'Rhétorique', definition: 'Art de bien parler et de persuader.', partOfSpeech: 'nom féminin', example: 'La rhétorique de ce discours', category: 'termes-analyse' },
  { id: 'v45', word: 'Injonction', definition: 'Ordre ou consigne donné au lecteur ou auditeur.', partOfSpeech: 'nom féminin', example: '"Écoute, regarde, comprends"', category: 'termes-analyse' },
  { id: 'v46', word: 'Apostrophe', definition: 'Interpellation directe d\'une personne ou d\'une chose.', partOfSpeech: 'nom féminin', example: '"Ô temps, suspends ton vol!"', category: 'termes-analyse' },
  { id: 'v47', word: 'Interrogation oratoire', definition: 'Question rhétorique qui ne demande pas de réponse.', partOfSpeech: 'locution', example: '"Qui ne pleurerait devant cette misère?"', category: 'termes-analyse' },
  { id: 'v48', word: 'Exclamation', definition: 'Phrase qui exprime une émotion vive, terminée par !.', partOfSpeech: 'nom féminin', example: '"Quel malheur!"', category: 'termes-analyse' },
  { id: 'v49', word: 'Hypothese', definition: 'Supposition présentée comme base de raisonnement.', partOfSpeech: 'nom féminin', example: '"Si tu venais demain..."', category: 'termes-analyse' },
  { id: 'v50', word: 'Polysémie', definition: 'Propriété d\'un mot d\'avoir plusieurs sens.', partOfSpeech: 'nom féminin', example: '"La "feuille" de papier ou d\'arbre"', category: 'termes-analyse' },
];

export const categoryLabels: Record<VocabularyEntry['category'], string> = {
  'figures-style': 'Figures de style',
  'classes-mots': 'Classes de mots',
  'termes-analyse': 'Termes d\'analyse',
};
