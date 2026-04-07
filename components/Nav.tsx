"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/human", label: "🧠 Human" },
  { href: "/agent", label: "⚡ Agent" },
  { href: "/hybrid", label: "✦ Hybrid" },
  { href: "/compare", label: "📊 Compare" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-xs font-mono text-gray-500 mr-4 hidden sm:block">
          PAE
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              pathname === l.href
                ? l.href === "/hybrid"
                  ? "bg-purple-700 text-white"
                  : "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
