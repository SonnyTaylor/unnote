import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/msal";

function normalizeOneNoteHtml(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content = bodyMatch?.[1] ?? html;

  content = content.replace(/position:\s*absolute\s*;?/gi, "");
  content = content.replace(/left:\s*[\d.]+px\s*;?/gi, "");
  content = content.replace(/top:\s*[\d.]+px\s*;?/gi, "");
  content = content.replace(/data-absolute-enabled="[^"]*"/gi, "");

  return content;
}

function formatPageDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PageViewer() {
  const { selectedPage } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const groupId = (selectedPage as any)?.groupId as string | undefined;

  const { data: html, isLoading } = useQuery({
    queryKey: ["page-content", selectedPage?.id, groupId],
    queryFn: async () => {
      if (!selectedPage) return null;
      if (groupId) {
        return graphClient.getGroupPageContent(groupId, selectedPage.id);
      }
      return graphClient.getPageContent(selectedPage.id);
    },
    enabled: !!selectedPage,
  });

  useEffect(() => {
    if (!contentRef.current || !html) return;

    const images = contentRef.current.querySelectorAll("img[src*='graph.microsoft.com']");
    images.forEach(async (img) => {
      const src = img.getAttribute("src");
      if (!src) return;

      try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(src, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const blob = await response.blob();
          img.setAttribute("src", URL.createObjectURL(blob));
        }
      } catch {
        // silently ignore
      }
    });

    return () => {
      const images = contentRef.current?.querySelectorAll("img[src^='blob:']");
      images?.forEach((img) => {
        const src = img.getAttribute("src");
        if (src) URL.revokeObjectURL(src);
      });
    };
  }, [html]);

  if (!selectedPage) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
          <img src="/unnote.svg" alt="UnNote" className="h-16 w-16 opacity-20" />
          <p className="text-sm text-muted-foreground/50">Select a page to view</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
        Failed to load page content
      </div>
    );
  }

  const normalizedContent = normalizeOneNoteHtml(html);
  const sanitized = DOMPurify.sanitize(normalizedContent, {
    ADD_TAGS: ["meta"],
    ADD_ATTR: ["data-id", "data-src-type", "data-fullres-src", "data-fullres-src-type", "style"],
  });

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        {/* Page title area */}
        <div className="mx-auto max-w-4xl px-12 pb-0 pt-10">
          <h1 className="text-[26px] font-semibold leading-tight text-foreground tracking-tight">
            {selectedPage.title || "Untitled"}
          </h1>
          <p className="mt-1.5 text-[12px] text-muted-foreground/60">
            {formatPageDate(selectedPage.lastModifiedDateTime)}
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />
        </div>

        {/* OneNote HTML content */}
        <div
          ref={contentRef}
          className="onenote-content mx-auto max-w-4xl px-12 py-6"
          style={{ fontFamily: 'Calibri, "Segoe UI", system-ui, sans-serif', fontSize: "14.5px" }}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    </main>
  );
}
