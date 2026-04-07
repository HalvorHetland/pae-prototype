import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-4">
        Master Thesis Prototype · 2026
      </p>
      <h1 className="text-4xl font-bold text-white mb-4">
        Progressive Agent Enhancement
      </h1>
      <p className="text-gray-400 text-lg mb-3 leading-relaxed max-w-2xl mx-auto">
        Et rammeverk for nettsteder som betjener to brukergrupper simultaneously —
        mennesker og AI-agenter — uten å gå på kompromiss med noen av dem.
      </p>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-xl mx-auto">
        Fremtidens nett vil i stor grad navigeres av AI-agenter på vegne av mennesker.
        Hvert steg en agent tar koster tokens, tid og energi. Denne prototypen utforsker
        hvordan ett nettsted kan optimaliseres for begge brukergrupper — og hva det betyr
        for bærekraft.
      </p>

      {/* PAE Concept */}
      <div className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/60 px-8 py-7 text-left">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">PAE — Rammeverket</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-mono text-gray-500 mb-2">LAG 3</div>
            <div className="text-white font-semibold mb-1">Menneskelig opplevelse</div>
            <p className="text-sm text-gray-400">Visuelt design, animasjoner, kalender og flerstegsflyt — alt optimalisert for mennesker.</p>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 mb-2">LAG 2</div>
            <div className="text-white font-semibold mb-1">Maskinlesbar struktur</div>
            <p className="text-sm text-gray-400">
              <code className="text-purple-300 text-xs">data-agent-*</code> attributter, semantisk HTML og ARIA-roller — usynlig for mennesker, kritisk for agenter.
            </p>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 mb-2">LAG 1</div>
            <div className="text-white font-semibold mb-1">Agent-API-lag</div>
            <p className="text-sm text-gray-400">JSON-LD manifest og direkte API-endepunkt. Agenten fullfører oppgaven i én request — ingen navigasjon nødvendig.</p>
          </div>
        </div>
      </div>

      {/* Energy stat */}
      <div className="mb-10 grid sm:grid-cols-3 gap-4 text-center">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-3xl font-bold text-red-400 mb-1">20 900</div>
          <div className="text-xs text-gray-500">tokens — tradisjonelt nettsted</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-3xl font-bold text-green-400 mb-1">615</div>
          <div className="text-xs text-gray-500">tokens — PAE-optimalisert</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-3xl font-bold text-purple-400 mb-1">97%</div>
          <div className="text-xs text-gray-500">reduksjon i token-forbruk</div>
        </div>
      </div>

      {/* Pages */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <Link href="/human" className="group block rounded-xl border border-gray-800 hover:border-indigo-500 bg-gray-900 p-5 transition-all">
          <div className="text-2xl mb-2">🌐</div>
          <h2 className="font-semibold text-white mb-1">Menneske-first</h2>
          <p className="text-sm text-gray-400">Tradisjonelt bookingskjema — kalender, navigasjonssteg og visuell UI-logikk.</p>
          <p className="mt-3 text-xs text-indigo-400 group-hover:text-indigo-300">Se siden →</p>
        </Link>
        <Link href="/agent" className="group block rounded-xl border border-gray-800 hover:border-green-500 bg-gray-900 p-5 transition-all">
          <div className="text-2xl mb-2">⚡</div>
          <h2 className="font-semibold text-white mb-1">Agent-first</h2>
          <p className="text-sm text-gray-400">JSON-schema og direkte API. Én forespørsel og booking er gjort.</p>
          <p className="mt-3 text-xs text-green-400 group-hover:text-green-300">Se siden →</p>
        </Link>
        <Link href="/compare" className="group block rounded-xl border border-gray-800 hover:border-yellow-500 bg-gray-900 p-5 transition-all">
          <div className="text-2xl mb-2">⇄</div>
          <h2 className="font-semibold text-white mb-1">Sammenligning</h2>
          <p className="text-sm text-gray-400">Tokens, handlinger og CO₂ side om side — animert og målbar.</p>
          <p className="mt-3 text-xs text-yellow-400 group-hover:text-yellow-300">Se sammenligning →</p>
        </Link>
        <Link href="/hybrid" className="group block rounded-xl border border-gray-800 hover:border-purple-500 bg-gray-900 p-5 transition-all">
          <div className="text-2xl mb-2">✦</div>
          <h2 className="font-semibold text-white mb-1">Hybrid · PAE</h2>
          <p className="text-sm text-gray-400">Menneskedesign med usynlig agent-lag. Bytt til «agent-modus» for å se hva som skjuler seg.</p>
          <p className="mt-3 text-xs text-purple-400 group-hover:text-purple-300">Se hybrid →</p>
        </Link>
      </div>

      <p className="mt-12 text-xs text-gray-700 leading-relaxed">
        Token-tall målt empirisk med BPE-tokenisering (cl100k_base) via js-tiktoken · CO₂-estimat: 0,002 g/1 000 tokens (Patterson et al. 2021)
      </p>
    </div>
  );
}
