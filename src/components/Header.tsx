import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { GitHubIcon, ExternalLinkIcon, LogoIcon } from "./icons";
import SearchDialog from "./SearchDialog";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#333338] bg-[#1b1b1f]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="text-base font-semibold tracking-tight text-neutral-100">
            OpenRemap<span className="text-emerald-400"> Docs</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <a
            href={siteConfig.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100 sm:flex"
          >
            openremap.com
            <ExternalLinkIcon size={13} />
          </a>
          <a
            href={`https://github.com/${siteConfig.projectRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-[#333338] bg-[#222226]/60 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-[#4a4a52] hover:text-white"
            aria-label="GitHub repository"
          >
            <GitHubIcon size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
