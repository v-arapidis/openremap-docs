import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-[#3d4145] py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-6 text-sm text-neutral-500">
        <p>
          <a href="/" className="text-neutral-300 hover:text-[#99ddff]">
            {siteConfig.name}
          </a>
          {" — the wiki for the open-source ECU binary toolkit."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={siteConfig.websiteUrl}
            className="hover:text-[#99ddff]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </a>
          <a
            href={`https://github.com/${siteConfig.projectRepo}`}
            className="hover:text-[#99ddff]"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="/project/disclaimer" className="hover:text-[#99ddff]">
            Disclaimer
          </a>
          <a href="/project/license" className="hover:text-[#99ddff]">
            License
          </a>
        </div>
        <p className="text-xs text-neutral-600">
          Offline-first. No accounts, no telemetry.
        </p>
      </div>
    </footer>
  );
}
