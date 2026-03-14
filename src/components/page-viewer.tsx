import { useQuery } from "@tanstack/react-query";
import { graphClient } from "@/lib/graph";
import { useAppStore } from "@/stores/app-store";
import { Loader2, BookOpen } from "lucide-react";
import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/msal";

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
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <BookOpen className="h-12 w-12" />
          <p>Select a page to view</p>
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

  // Extract body content from the full HTML document
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch?.[1] ?? html;

  // Sanitize HTML
  const sanitized = DOMPurify.sanitize(bodyContent, {
    ADD_TAGS: ["meta"],
    ADD_ATTR: [
      "data-absolute-enabled",
      "data-id",
      "data-src-type",
      "data-fullres-src",
      "data-fullres-src-type",
      "style",
    ],
  });

  return (
    <main className="flex-1 overflow-auto">
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
        className="onenote-content relative mx-auto max-w-4xl px-6 py-6"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </main>
  );
}
