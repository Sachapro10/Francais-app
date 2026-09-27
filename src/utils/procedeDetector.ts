// Canonical procede names and their detection patterns
export const PROCEDE_CATEGORIES: Record<string, { keywords: string[]; category: string; description: string }> = {
  'Champ lexical': {
    keywords: ['champ lexical', 'champ semantique'],
    category: 'Semantique',
    description: 'Ensemble de mots releves d\'un meme domaine de sens',
  },
  'Metaphore': {
    keywords: ['metaphore', 'comparaison implicite', 'transfert semantique'],
    category: 'Semantique',
    description: 'Comparison sans mot de comparaison, substitution de sens',
  },
  'Comparaison': {
    keywords: ['comparaison', 'comme', 'tel que', 'ainsi que', 'pareil a'],
    category: 'Semantique',
    description: 'Mise en parallelisme de deux elements via un mot compare',
  },
  'Personnification': {
    keywords: ['personnification', 'anthropomorphisme', 'pronom personnel pour un objet'],
    category: 'Semantique',
    description: 'Attribution de traits humains a un element non humain',
  },
  'Antithese': {
    keywords: ['antithese', 'opposition', 'contraire', 'paradox'],
    category: 'Semantique',
    description: 'Opposition de deux termes ou idees opposees',
  },
  'Hyperbole': {
    keywords: ['hyperbole', 'exageration', 'depassement'],
    category: 'Semantique',
    description: 'Exageration pour amplifier ou minimiser',
  },
  'Euphémisme': {
    keywords: ['euphemisme', 'attnuation', 'minimisation', ' langage clemente'],
    category: 'Semantique',
    description: 'Attnuation du reel pour adoucir ou eviter',
  },
  'Metonymie': {
    keywords: ['metonymie', 'deplacement semantique', 'pars pro toto'],
    category: 'Semantique',
    description: 'Remplacement d\'un mot par un autre qui lui est lie par un rapport logique',
  },
  'Synecdoque': {
    keywords: ['synecdoque', 'partie pour le tout', 'generalisation'],
    category: 'Semantique',
    description: 'Figure ou une partie represente le tout ou inversement',
  },
  'Enumération': {
    keywords: ['enumeration', 'liste', 'accumulation', 'catalogue'],
    category: 'Syntagmatique',
    description: 'Accumulation de mots ou expressions de meme nature',
  },
  'Répétition': {
    keywords: ['repetition', 'anaphore', 'epanaphore', 'redi t'],
    category: 'Syntagmatique',
    description: 'Reprtition d\'un mot, groupe ou son pour insist er',
  },
  'Polyptote': {
    keywords: ['polyptote', 'variations grammaticales', 'memes mots differents'],
    category: 'Syntagmatique',
    description: 'Utilisation de formes grammaticales differentes d\'un meme mot',
  },
  'Assonance': {
    keywords: ['assonance', 'repetition de voyelles', 'son vocalique'],
    category: 'Phonetique',
    description: 'Repetition d\'un meme son vocalique (a, e, i, o, u)',
  },
  'Allitération': {
    keywords: ['alliteration', 'repetition de consonnes', 'son consonantique'],
    category: 'Phonetique',
    description: 'Repetition d\'un meme son consonantique (s, r, f, etc.)',
  },
  'Rime': {
    keywords: ['rime', 'sonrime', 'rime riche', 'rime suffisante', 'rime croisee', 'rime embrassee'],
    category: 'Phonetique',
    description: 'Repetition de sons en fin de vers ou de mots',
  },
  'Rejet': {
    keywords: ['rejet', 'contre-rejet', 'mot en debut de vers suivant'],
    category: 'Syntagmatique',
    description: 'Mot ou groupe mis en debut de vers suivant pour insister',
  },
  'Présentatif': {
    keywords: ['presentatif', 'voici', 'voila', 'c\'est', 'il y a', 'present de description'],
    category: 'Syntagmatique',
    description: 'Structure qui presente ou montre, souvent avec c\'est, voila, voici',
  },
  'Apostrophe': {
    keywords: ['apostrophe', 'interpellation', 'tu', 'vous', 'he'],
    category: 'Syntagmatique',
    description: 'Interpellation directe d\'un destinataire reel ou fictionnel',
  },
  'Interrogation oratoire': {
    keywords: ['interrogation oratoire', 'question rh orique', 'sans reponse attendue'],
    category: 'Syntagmatique',
    description: 'Question posee pour l\'effet sans attendre de reponse',
  },
  'Ellipse': {
    keywords: ['ellipse', 'suppression', 'mot manquant'],
    category: 'Syntagmatique',
    description: 'Suppression d\'un element grammaticalement attendu',
  },
  'Chiasme': {
    keywords: ['chiasme', 'symetrie inverse', 'ABBA'],
    category: 'Semantique',
    description: 'Disposition symetrique inverse des elements (A B B A)',
  },
  'Gradation': {
    keywords: ['gradation', 'accumul', 'crescendo', 'climax'],
    category: 'Syntagmatique',
    description: 'Suite de mots ou expressions allant crescendo ou decrescendo',
  },
  'Ponctuation': {
    keywords: ['ponctuation', 'deux-points', 'points de suspension', 'virgule expressive', 'point'],
    category: 'Syntagmatique',
    description: 'Usage expressif de la ponctuation pour creer un effet',
  },
  'Subordonnée relative': {
    keywords: ['subordonnee relative', 'phrase relative', 'qui', 'que', 'dont', 'ou'],
    category: 'Syntagmatique',
    description: 'Proposition relative qui complete ou precise un nom',
  },
  'Hypallag': {
    keywords: ['hypallage', 'deplacment epithete', 'attribution inverse'],
    category: 'Syntagmatique',
    description: 'Transfert d\'une epithete d\'un mot a un autre',
  },
  'Référence mythologique': {
    keywords: ['reference mythologique', 'allusion mythologique', 'mythe', 'greco-romain', 'dieux'],
    category: 'Reference',
    description: 'Reference a un recit, personnage ou theme mythologique',
  },
  'Référence biblique': {
    keywords: ['reference biblique', 'allusion biblique', 'bible', 'christianisme'],
    category: 'Reference',
    description: 'Reference a un recit, personnage ou theme biblique',
  },
  'Effet de boucle': {
    keywords: ['effet de boucle', 'recurrence', 'chiasme structural', 'reprise'],
    category: 'Composition',
    description: 'Reprise d\'un element du debut a la fin pour creer une boucle',
  },
  'Conditionnel': {
    keywords: ['conditionnel', '-rait', '-rait', 'hypothèse', 'irreel'],
    category: 'Morphosyntaxe',
    description: 'Temps ou mode exprimant l\'hypothèse, le souhait ou l\'irreel',
  },
  'Négation': {
    keywords: ['negation', 'ne', 'pas', 'plus', 'jamais', 'rien', 'aucun'],
    category: 'Morphosyntaxe',
    description: 'Utilisation expressive de la negation pour creer un effet',
  },
  'Complément circonstanciel': {
    keywords: ['complement circonstanciel', 'CCL', 'lieu', 'temps', 'maniere'],
    category: 'Morphosyntaxe',
    description: 'Complément qui precise les circonstances de l\'action',
  },
  'Dialogue': {
    keywords: ['dialogue', 'tirets', 'deux-points', 'guillemets', 'interlocuteurs'],
    category: 'Syntagmatique',
    description: 'Echange verbal entre personnages ou voix lyriques',
  },
  'Redondance': {
    keywords: ['redondance', 'pléonasme', 'radotage', 'répetition superflue'],
    category: 'Syntagmatique',
    description: 'Répetition qui insiste mais semble superflue',
  },
  'Synesthésie': {
    keywords: ['synesthesie', 'melange des sens', 'vue-odeur', 'son-couleur'],
    category: 'Semantique',
    description: 'Melange de plusieurs sens dans une meme expression',
  },
  'Adjectif qualificatif': {
    keywords: ['adjectif qualificatif', 'epithete', 'qualite', 'description'],
    category: 'Morphosyntaxe',
    description: 'Mot qui qualifie ou decrit un nom',
  },
  'Groupe nominal': {
    keywords: ['groupe nominal', 'GN', 'nom', 'determinant + nom'],
    category: 'Morphosyntaxe',
    description: 'Groupe centre sur un nom avec ses determinant et expansions',
  },
  'Valeur des temps': {
    keywords: ['valeur du present', 'present de description', 'present narratif', 'present de l\'habitude'],
    category: 'Morphosyntaxe',
    description: 'Analyse de la valeur d\'un temps verbal dans son contexte',
  },
};

export function detectProcede(input: string): { detected: string; confidence: number } {
  const normalized = input.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

  // Exact match first
  for (const [key, value] of Object.entries(PROCEDE_CATEGORIES)) {
    if (normalized === key.toLowerCase()) {
      return { detected: key, confidence: 1.0 };
    }
  }

  // Keyword match
  let bestMatch = '';
  let bestScore = 0;

  for (const [key, value] of Object.entries(PROCEDE_CATEGORIES)) {
    for (const keyword of value.keywords) {
      if (normalized.includes(keyword)) {
        const score = keyword.length / normalized.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = key;
        }
      }
    }
  }

  // Also check for key name matches directly
  for (const [key, value] of Object.entries(PROCEDE_CATEGORIES)) {
    const keyLower = key.toLowerCase();
    if (normalized.includes(keyLower) || keyLower.includes(normalized)) {
      const score = Math.min(keyLower.length, normalized.length) / Math.max(keyLower.length, normalized.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    }
  }

  if (bestScore > 0.1) {
    return { detected: bestMatch, confidence: Math.min(bestScore, 0.95) };
  }

  // Return the input as-is if no match found
  return { detected: input, confidence: 0 };
}

export const ALL_PROCEDES = Object.keys(PROCEDE_CATEGORIES);

export function getProcedeCategory(procede: string): string {
  const entry = Object.entries(PROCEDE_CATEGORIES).find(
    ([key]) => key.toLowerCase() === procede.toLowerCase()
  );
  return entry?.[1].category || 'Autre';
}