import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/msal";

// Convert OneNote absolute positioning to normal document flow
function normalizeOneNoteHtml(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content = bodyMatch?.[1] ?? html;

  // Remove absolute positioning from inline styles
  content = content.replace(/position:\s*absolute\s*;?/gi, "");
  content = content.replace(/left:\s*[\d.]+px\s*;?/gi, "");
  content = content.replace(/top:\s*[\d.]+px\s*;?/gi, "");

  // Remove data-absolute-enabled
  content = content.replace(/data-absolute-enabled="[^"]*"/gi, "");

  return content;
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

  // Handle image authentication - replace Graph API image URLs with blob URLs
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
          const blobUrl = URL.createObjectURL(blob);
          img.setAttribute("src", blobUrl);
        }
      } catch {
        // Image load failed silently
      }
    });

    return () => {
      // Cleanup blob URLs
      const images = contentRef.current?.querySelectorAll("img[src^='blob:']");
      images?.forEach((img) => {
        const src = img.getAttribute("src");
        if (src) URL.revokeObjectURL(src);
      });
    };
  }, [html]);

  if (!selectedPage) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <img src="/unnote.svg" alt="UnNote" className="h-16 w-16 opacity-40" />
          <p className="text-lg">Select a page to view</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Failed to load page content
      </div>
    );
  }

  // Normalize OneNote HTML (strip absolute positioning) then sanitize
  const normalizedContent = normalizeOneNoteHtml(html);

  const sanitized = DOMPurify.sanitize(normalizedContent, {
    ADD_TAGS: ["meta"],
    ADD_ATTR: [
      "data-id",
      "data-src-type",
      "data-fullres-src",
      "data-fullres-src-type",
      "style",
    ],
  });

  return (
    <main className="flex-1 overflow-auto bg-muted/20">
      {/* Page title bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-6 py-3">
        <h1 className="text-lg font-semibold">{selectedPage.title || "Untitled"}</h1>
        <p className="text-xs text-muted-foreground">
          Last modified{" "}
          {new Date(selectedPage.lastModifiedDateTime).toLocaleDateString()}
        </p>
      </div>

      {/* Page content */}
      <div
        ref={contentRef}
        className="onenote-content relative mx-auto max-w-4xl bg-background px-8 py-8 shadow-sm min-h-full"
        style={{ fontFamily: 'Calibri, "Segoe UI", system-ui, sans-serif', fontSize: "14.5px" }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </main>
  );
}
