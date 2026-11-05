export interface VocabularyTerm {
  id: string;
  term: string;
  definition: string;
  category: 'figures-de-style' | 'classes-de-mots' | 'termes-d-analyse';
  example?: string;
}

export const vocabularyTerms: VocabularyTerm[] = [
  // Figures de style
  { id: 'vocab-1', term: 'La métaphore', definition: 'Figure de style qui consiste à remplacer un mot par un autre mot ou expression, sans outil de comparaison, sur la base d\'une ressemblance ou d\'une analogie.', category: 'figures-de-style', example: 'Cette faucheuse s\'appelle la mort. (Victor Hugo)' },
  { id: 'vocab-2', term: 'La comparaison', definition: 'Figure de style qui rapproche deux éléments pour souligner leurs points communs, à l\'aide d\'un outil de comparaison (comme, tel, semblable à, etc.).', category: 'figures-de-style', example: 'Il est fort comme un lion.' },
  { id: 'vocab-3', term: 'La personnification', definition: 'Figure de style qui attribue des caractéristiques humaines à des objets inanimés, des animaux ou des idées abstraites.', category: 'figures-de-style', example: 'Le vent murmure des secrets aux arbres.' },
  { id: 'vocab-4', term: 'L\'allégorie', definition: 'Représentation concrète d\'une idée abstraite par une image, un personnage ou un objet.', category: 'figures-de-style', example: 'La Faucheuse représente la mort.' },
  { id: 'vocab-5', term: 'L\'oxymore', definition: 'Figure de style qui réunit deux termes contradictoires dans une même expression.', category: 'figures-de-style', example: 'Une obscure clarté, un silence assourdissant.' },
  { id: 'vocab-6', term: 'L\'antithèse', definition: 'Figure de style qui oppose deux mots ou groupes de mots dans une phrase pour créer un contraste fort.', category: 'figures-de-style', example: 'Je vis, je meurs ; je brûle et je me noie.' },
  { id: 'vocab-7', term: 'L\'hyperbole', definition: 'Figure de style qui exagère l\'expression d\'une idée pour la rendre plus frappante.', category: 'figures-de-style', example: 'Je meurs de soif, je meurs de faim.' },
  { id: 'vocab-8', term: 'La litote', definition: 'Figure de style qui consiste à dire moins pour suggérer davantage.', category: 'figures-de-style', example: 'Ce n\'est pas mauvais (pour dire que c\'est très bon).' },
  { id: 'vocab-9', term: 'L\'euphémisme', definition: 'Figure de style qui adoucit une expression jugée trop brutale ou désagréable.', category: 'figures-de-style', example: 'Il nous a quittés (pour dire il est mort).' },
  { id: 'vocab-10', term: 'L\'ironie', definition: 'Figure de style par laquelle on dit le contraire de ce que l\'on pense, souvent sur un ton moqueur.', category: 'figures-de-style', example: 'Quel temps magnifique ! (sous une pluie battante).' },
  { id: 'vocab-11', term: 'La métonymie', definition: 'Figure de style qui remplace un mot par un autre mot lié par une relation de contiguïté (cause, effet, contenant, contenu, etc.).', category: 'figures-de-style', example: 'Boire un verre (le contenant pour le contenu).' },
  { id: 'vocab-12', term: 'La synecdoque', definition: 'Figure de style qui prend la partie pour le tout, ou le tout pour la partie.', category: 'figures-de-style', example: 'Les voiles à l\'horizon (les voiles pour les bateaux).' },
  { id: 'vocab-13', term: 'Le chiasme', definition: 'Figure de style qui organise les termes d\'une phrase selon une structure croisée (ABBA).', category: 'figures-de-style', example: 'Il faut manger pour vivre et non pas vivre pour manger.' },
  { id: 'vocab-14', term: 'L\'anaphore', definition: 'Figure de style qui consiste à répéter un mot ou groupe de mots en début de phrase ou de vers.', category: 'figures-de-style', example: 'Paris ! Paris ! Paris !' },
  { id: 'vocab-15', term: 'L\'ellipse', definition: 'Figure de style qui supprime un ou plusieurs mots facilement compréhensibles par le contexte.', category: 'figures-de-style', example: 'Il a pris son sac, elle, son parapluie.' },
  { id: 'vocab-16', term: 'L\'assonance', definition: 'Figure de style qui consiste en la répétition d\'une voyelle à la fin de plusieurs mots.', category: 'figures-de-style', example: 'L\'eau coule, la vie s\'écoule.' },
  { id: 'vocab-17', term: 'L\'allitération', definition: 'Figure de style qui consiste en la répétition d\'une consonne dans une phrase ou un vers.', category: 'figures-de-style', example: 'Pour qui sont ces serpents qui sifflent sur vos têtes ? (Racine)' },
  { id: 'vocab-18', term: 'La gradation', definition: 'Figure de style qui dispose les termes selon une intensité croissante ou décroissante.', category: 'figures-de-style', example: 'Je meurs, je suis mort, je suis enterré.' },
  { id: 'vocab-19', term: 'L\'apostrophe', definition: 'Figure de style par laquelle l\'auteur s\'adresse directement à quelqu\'un ou quelque chose.', category: 'figures-de-style', example: 'Ô temps, suspends ton vol !' },
  { id: 'vocab-20', term: 'Le parallélisme', definition: 'Figure de style qui établit une symétrie entre deux éléments d\'une phrase.', category: 'figures-de-style', example: 'L\'un riche, l\'autre pauvre ; l\'un heureux, l\'autre triste.' },

  // Classes de mots
  { id: 'vocab-21', term: 'Le nom', definition: 'Mot qui désigne une personne, un animal, une chose ou une idée. Il peut être commun ou propre.', category: 'classes-de-mots', example: 'La table, Paris, le bonheur.' },
  { id: 'vocab-22', term: 'Le verbe', definition: 'Mot qui exprime une action, un état ou un devenir. Il se conjugue selon le temps, le mode, la personne et le nombre.', category: 'classes-de-mots', example: 'Chanter, être, devenir.' },
  { id: 'vocab-23', term: 'L\'adjectif', definition: 'Mot qui se joint au nom pour le qualifier ou le déterminer. Il s\'accorde en genre et en nombre.', category: 'classes-de-mots', example: 'Un beau jardin, une grande maison.' },
  { id: 'vocab-24', term: 'L\'adverbe', definition: 'Mot invariable qui modifie le sens d\'un verbe, d\'un adjectif ou d\'un autre adverbe.', category: 'classes-de-mots', example: 'Il court vite, très grand, assez bien.' },
  { id: 'vocab-25', term: 'Le pronom', definition: 'Mot qui remplace un nom ou un groupe nominal. Il existe différentes sortes : personnels, relatifs, démonstratifs, possessifs, etc.', category: 'classes-de-mots', example: 'Il, qui, celui, le mien.' },
  { id: 'vocab-26', term: 'La préposition', definition: 'Mot invariable qui introduit un complément.', category: 'classes-de-mots', example: 'À, de, dans, pour, avec, sur.' },
  { id: 'vocab-27', term: 'La conjonction', definition: 'Mot invariable qui sert à lier des mots ou des propositions.', category: 'classes-de-mots', example: 'Et, ou, mais, car, parce que, lorsque.' },
  { id: 'vocab-28', term: 'L\'article', definition: 'Déterminant qui introduit un nom. Il peut être défini (le, la, les) ou indéfini (un, une, des).', category: 'classes-de-mots', example: 'Le chat, une pomme, des fleurs.' },
  { id: 'vocab-29', term: 'Le déterminant', definition: 'Mot qui précède le nom et indique son genre, son nombre et son degré de détermination.', category: 'classes-de-mots', example: 'Ce livre, ma maison, trois jours.' },
  { id: 'vocab-30', term: 'L\'interjection', definition: 'Mot invariable qui exprime une émotion, un sentiment ou un bruit.', category: 'classes-de-mots', example: 'Ah ! Oh ! Aïe ! Pouf !' },

  // Termes d'analyse
  { id: 'vocab-31', term: 'L\'alexandrin', definition: 'Vers de douze syllabes, très utilisé dans la poésie française classique.', category: 'termes-d-analyse', example: 'Et qui detache ainsi des grands fonds de l\'abîme. (Racine)' },
  { id: 'vocab-32', term: 'Le décasyllabe', definition: 'Vers de dix syllabes.', category: 'termes-d-analyse', example: 'Maître Corbeau, sur un arbre perché. (La Fontaine)' },
  { id: 'vocab-33', term: 'L\'octosyllabe', definition: 'Vers de huit syllabes.', category: 'termes-d-analyse', example: 'Le lac aux eaux dormantes. (Lamartine)' },
  { id: 'vocab-34', term: 'La rime', definition: 'Homophonie des sons finaux de deux ou plusieurs vers. Elle peut être plate (AABB), croisée (ABAB) ou embrassée (ABBA).', category: 'termes-d-analyse', example: 'amour / jour (rime plate).' },
  { id: 'vocab-35', term: 'La diérèse', definition: 'Prononciation séparée de deux voyelles qui forment normalement une seule syllabe.', category: 'termes-d-analyse', example: 'Po-é-sie (4 syllabes au lieu de 3).' },
  { id: 'vocab-36', term: 'La synérèse', definition: 'Prononciation en une seule syllabe de deux voyelles successives.', category: 'termes-d-analyse', example: 'Poi-sie (2 syllabes).' },
  { id: 'vocab-37', term: 'L\'enjambement', definition: 'Décalage entre la fin du vers et la fin de la phrase : la phrase continue au vers suivant sans pause.', category: 'termes-d-analyse', example: 'Il regarde passer les trains / de nuit. (le complément continue au vers suivant)' },
  { id: 'vocab-38', term: 'Le rejet', definition: 'Report d\'un mot ou d\'un groupe de mots en début de vers suivant, après un enjambement, ce qui le met en valeur.', category: 'termes-d-analyse', example: 'Il sortit / de la salle, furieux. (rejet de l\'expression)' },
  { id: 'vocab-39', term: 'Le contre-rejet', definition: 'Report d\'un mot ou d\'un groupe de mots à la fin du vers précédent, créant un effet de suspens.', category: 'termes-d-analyse', example: 'De la salle / il sortit, furieux. (contre-rejet du verbe)' },
  { id: 'vocab-40', term: 'La strophe', definition: 'Ensemble de vers formant une unité dans un poème. On distingue le quatrain (4 vers), le tercet (3 vers), etc.', category: 'termes-d-analyse', example: 'Un sonnet comprend deux quatrains et deux tercets.' },
  { id: 'vocab-41', term: 'Le quatrain', definition: 'Strophe de quatre vers.', category: 'termes-d-analyse', example: 'Les deux premiers quatrains d\'un sonnet.' },
  { id: 'vocab-42', term: 'Le tercet', definition: 'Strophe de trois vers.', category: 'termes-d-analyse', example: 'Les deux derniers tercets d\'un sonnet.' },
  { id: 'vocab-43', term: 'Le sonnet', definition: 'Poème de 14 vers, généralement composé de deux quatrains et deux tercets.', category: 'termes-d-analyse', example: 'Les Sonnets de Baudelaire.' },
  { id: 'vocab-44', term: 'La prose', definition: 'Texte écrit sans contraintes de versification ni de rimes.', category: 'termes-d-analyse', example: 'Un roman, un article de journal.' },
  { id: 'vocab-45', term: 'Le vers libre', definition: 'Vers qui ne respecte pas les règles traditionnelles de la versification (nombre de syllabes, rimes).', category: 'termes-d-analyse', example: 'La poésie moderne de Verlaine ou Rimbaud.' },
  { id: 'vocab-46', term: 'Le registre lyrique', definition: 'Registre qui exprime des sentiments personnels, souvent avec émotion et subjectivité.', category: 'termes-d-analyse', example: 'Les poèmes de Lamartine ou Hugo.' },
  { id: 'vocab-47', term: 'Le registre épique', definition: 'Registre qui met en scène des actions héroïques, des combats, des exploits grandioses.', category: 'termes-d-analyse', example: 'La Chanson de Roland.' },
  { id: 'vocab-48', term: 'Le registre tragique', definition: 'Registre qui évoque le destin, la fatalité, les conflits insolubles menant souvent à la mort.', category: 'termes-d-analyse', example: 'Les tragédies de Racine.' },
  { id: 'vocab-49', term: 'Le registre comique', definition: 'Registre qui vise à faire rire par des situations, des personnages ou des procédés linguistiques.', category: 'termes-d-analyse', example: 'Les comédies de Molière.' },
  { id: 'vocab-50', term: 'Le registre satirique', definition: 'Registre qui critique la société ou les mœurs par l\'ironie et la moquerie.', category: 'termes-d-analyse', example: 'Les Fables de La Fontaine.' },
];

export const vocabularyCategories = [
  { id: 'figures-de-style', name: 'Figures de style', count: 20 },
  { id: 'classes-de-mots', name: 'Classes de mots', count: 10 },
  { id: 'termes-d-analyse', name: 'Termes d\'analyse', count: 20 },
];
