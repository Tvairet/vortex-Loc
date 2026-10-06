
export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--carbon))] text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
              <Zap className="h-4 w-4 text-[hsl(var(--volt))]" fill="currentColor" />
            </span>
            <span className="font-heading font-extrabold text-lg">VORTEX'LOC</span>
          </div>
          <p className="text-sm text-white/50 mt-4 max-w-xs">
            Location de véhicules premium. La route, à votre rythme.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Flotte</p>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#flotte" className="hover:text-[hsl(var(--volt))]">Citadines</a></li>
            <li><a href="#flotte" className="hover:text-[hsl(var(--volt))]">Berlines & SUV</a></li>
            <li><a href="#flotte" className="hover:text-[hsl(var(--volt))]">Utilitaires</a></li>
            <li><a href="#flotte" className="hover:text-[hsl(var(--volt))]">Luxe & Sport</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Société</p>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#services" className="hover:text-[hsl(var(--volt))]">Nos services</a></li>
            <li><a href="#avis" className="hover:text-[hsl(var(--volt))]">Avis clients</a></li>
            <li><a href="#contact" className="hover:text-[hsl(var(--volt))]">Contact</a></li>
            <li><a href="#flotte" className="hover:text-[hsl(var(--volt))]">Réserver</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Légal</p>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a href="#" className="hover:text-[hsl(var(--volt))]">Conditions générales</a></li>
            <li><a href="#" className="hover:text-[hsl(var(--volt))]">Politique de confidentialité</a></li>
            <li><a href="#" className="hover:text-[hsl(var(--volt))]">Mentions légales</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} VORTEX'LOC. Tous droits réservés. Projet pédagogique.</p>
          <p className="text-xs text-white/40">Conçu avec précision.</p>
        </div>
      </div>
    </footer>
  );
}