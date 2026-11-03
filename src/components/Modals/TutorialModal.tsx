import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Dices, 
  Users, 
  Home, 
  Wheat, 
  Wrench, 
  Utensils, 
  Scale, 
  Sparkles 
} from 'lucide-react';
import { ResourceIcon } from '../Common/ResourceIcon';

interface TutorialModalProps {
  onClose: () => void;
}

interface Step {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: 'Bienvenue dans L’Âge de Pierre',
      subtitle: 'Le classique du jeu de gestion préhistorique',
      icon: <Users className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-4 text-sm text-stone-300 leading-relaxed">
          <p>
            Vous êtes le chef d'une tribu à l'aube de l'humanité. Votre objectif est de faire prospérer votre peuple
            pour accumuler le plus de <strong className="text-amber-300">Points de Victoire (VP)</strong> avant la fin du jeu.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-2xl block mb-1">🪵</span>
              <span className="text-xs font-semibold text-stone-200">Récolter</span>
              <p className="text-[10px] text-stone-400">Bois, glaise, pierre, or</p>
            </div>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col items-center">
              <div className="h-8 flex items-center justify-center mb-1">
                <ResourceIcon type="building" size="md" />
              </div>
              <span className="text-xs font-semibold text-stone-200">Construire</span>
              <p className="text-[10px] text-stone-400">Huttes & bâtiments</p>
            </div>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-2xl block mb-1">📜</span>
              <span className="text-xs font-semibold text-stone-200">Civiliser</span>
              <p className="text-[10px] text-stone-400">Arts, sciences & tribus</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 italic">
            Une partie se joue en manches composées de 3 phases : Pose, Résolution, et Nourriture.
          </p>
        </div>
      ),
    },
    {
      title: '1. La Pose des Ouvriers',
      subtitle: 'Anticipation et placement tactique',
      icon: <Users className="w-8 h-8 text-blue-400" />,
      content: (
        <div className="space-y-4 text-sm text-stone-300 leading-relaxed">
          <p>
            Chaque joueur commence avec <strong className="text-amber-300">5 ouvriers</strong>.
          </p>
          <ul className="space-y-2 list-disc list-inside bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-xs">
            <li>
              À votre tour, vous choisissez <strong className="text-stone-100">un seul emplacement</strong> du plateau et y posez le nombre d'ouvriers désiré.
            </li>
            <li>
              Vous ne pouvez poser sur une zone qu'une <strong className="text-amber-300">seule fois par manche</strong> !
            </li>
            <li>
              Le tour tourne dans le sens horaire jusqu'à ce que tous les joueurs aient placé l'intégralité de leurs ouvriers.
            </li>
            <li>
              <strong className="text-red-400">Attention aux places limitées :</strong> les zones de ressources (max 7 ouvriers) et le village se remplissent vite !
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '2. La Récolte aux Dés & Les Outils',
      subtitle: 'Maîtriser le hasard avec ingéniosité',
      icon: <Dices className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
          <p>
            Pour chaque ouvrier envoyé récolter, vous lancez <strong>1 dé à 6 faces</strong>.
            La somme est ensuite divisée par la valeur de la ressource :
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
              <span>🍗 Chasse :</span>
              <span className="text-amber-300 font-bold">Total ÷ 2</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
              <span>🪵 Bois :</span>
              <span className="text-amber-300 font-bold">Total ÷ 3</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
              <span>🧱 Glaise :</span>
              <span className="text-amber-300 font-bold">Total ÷ 4</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
              <span>🪨 Pierre :</span>
              <span className="text-amber-300 font-bold">Total ÷ 5</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2 col-span-2">
              <span>✨ Or :</span>
              <span className="text-amber-300 font-bold">Total ÷ 6</span>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-xs text-amber-200 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Les Outils :</strong> Vous pouvez activer vos tuiles d'outils après le lancer pour ajouter des points fixes et atteindre le palier supérieur !
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '3. Le Village : Votre Moteur',
      subtitle: 'Les trois piliers du développement',
      icon: <Home className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
          <p>Le village permet d'améliorer durablement votre tribu :</p>
          <div className="space-y-2 text-xs">
            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center gap-3">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Wheat className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-stone-100">Le Champ (1 ouvrier) :</strong>
                <p className="text-stone-400">+1 niveau d’agriculture (fournit 1 ration automatique chaque tour).</p>
              </div>
            </div>

            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center gap-3">
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-stone-100">Le Fabricant d'outils (1 ouvrier) :</strong>
                <p className="text-stone-400">+1 outil réutilisable à chaque manche.</p>
              </div>
            </div>

            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center gap-3">
              <span className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-stone-100">La Hutte (2 ouvriers) :</strong>
                <p className="text-stone-400">Reproduction ! +1 nouvel ouvrier pour toute la suite (max 10).</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '4. Cartes, Bâtiments & Nourriture',
      subtitle: 'Scorer et éviter la famine',
      icon: <Utensils className="w-8 h-8 text-red-400" />,
      content: (
        <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5">
            <div className="font-semibold text-amber-300">🍗 Nourrir la tribu :</div>
            <p className="text-stone-400">
              À la fin de chaque tour, vous devez fournir <strong>1 nourriture par ouvrier</strong>.
              L'agriculture paye en priorité, puis vos réserves. Si vous ne pouvez pas : payez avec des matières premières, ou perdez <span className="text-red-400 font-bold">-10 Points de Victoire</span> !
            </p>
          </div>

          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5">
            <div className="font-semibold text-emerald-300">📜 Cartes & Bâtiments :</div>
            <p className="text-stone-400">
              • <strong>Bâtiments :</strong> rapportent immédiatement la valeur des ressources utilisées en VP.<br/>
              • <strong>Cartes Vertes :</strong> collections uniques ($K^2$ points : 5 symboles différents = 25 pts !).<br/>
              • <strong>Cartes Sable :</strong> multiplient vos ouvriers, outils, agriculture ou bâtiments en fin de partie.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '5. Les Variantes d’Équilibrage',
      subtitle: 'Une version moderne, équitable et compétitive',
      icon: <Scale className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
          <p>
            Dans les règles originales, le Joueur 1 a un avantage massif (accès garanti au village) et la fin de partie peut être brutale.
            Cette application intègre nativement les variantes d'équilibrage :
          </p>

          <div className="space-y-2 text-xs">
            <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
              <strong className="text-emerald-300">🌿 Tour 1 : Courtoisie du Village</strong>
              <p className="text-stone-400">
                À 3 joueurs, les 3 cases du village sont exceptionnellement ouvertes au Tour 1. Aucun joueur n'est exclu de force !
              </p>
            </div>

            <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60">
              <strong className="text-amber-300">⚖️ Fin de partie : Seuil à 2 Piles Vides</strong>
              <p className="text-stone-400">
                Évite les "rushs" prématurés : la fin ne se déclenche qu'à l'épuisement de 2 piles de bâtiments (ou du deck de cartes).
              </p>
            </div>

            <div className="bg-blue-950/40 p-2.5 rounded-xl border border-blue-800/60">
              <strong className="text-blue-300">🔄 Égalité Stricte des Tours (Cycle Complet)</strong>
              <p className="text-stone-400">
                La partie se termine uniquement lorsque chaque joueur a été 1er joueur exactement le même nombre de fois.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-amber-200">
                Didacticiel de Jeu
              </h3>
              <p className="text-xs text-stone-400">
                Étape {currentStep + 1} sur {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800 shrink-0">
              {current.icon}
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-100">{current.title}</h4>
              <p className="text-xs text-amber-400/90">{current.subtitle}</p>
            </div>
          </div>

          <div className="min-h-[220px]">
            {current.content}
          </div>
        </div>

        {/* Step Indicator dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-6 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 font-semibold rounded-xl transition-colors flex items-center gap-1 text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prêt à jouer !</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
