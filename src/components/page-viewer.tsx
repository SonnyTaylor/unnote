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

/** Map OneNote data-tag values to emoji icons for visual rendering */
const TAG_ICONS: Record<string, string> = {
  "important": "❗",
  "critical": "🔴",
  "question": "❓",
  "highlight": "💡",
  "contact": "👤",
  "address": "📍",
  "phone-number": "📞",
  "web-site-to-visit": "🔗",
  "idea": "💡",
  "password": "🔒",
  "remember-for-later": "📌",
  "remember-for-blog": "📝",
  "movie-to-see": "🎬",
  "book-to-read": "📖",
  "music-to-listen-to": "🎵",
  "source-for-article": "📰",
  "send-in-email": "📧",
  "schedule-meeting": "📅",
  "call-back": "📞",
  "discuss-with-person-a": "💬",
  "discuss-with-manager": "💬",
  "client-request": "📋",
  "project-a": "🅰️",
  "project-b": "🅱️",
};

/**
 * Post-process rendered OneNote HTML to enhance:
 * - To-do checkboxes (data-tag="to-do" / "to-do:completed")
 * - Note tags (data-tag="important", "question", etc.)
 * - Embedded file attachments (<object data-attachment="...">)
 */
function enhanceRenderedContent(container: HTMLElement) {
  // Process data-tag elements (checkboxes + note tags)
  const taggedElements = container.querySelectorAll("[data-tag]");
  taggedElements.forEach((el) => {
    const tags = (el.getAttribute("data-tag") ?? "").split(",").map((t) => t.trim());

    for (const tag of tags) {
      // Skip if already processed
      if (el.getAttribute("data-enhanced") === "true") continue;

      if (tag === "to-do" || tag === "to-do:completed") {
        const checked = tag === "to-do:completed";
        const checkbox = document.createElement("span");
        checkbox.className = `onenote-checkbox ${checked ? "checked" : ""}`;
        checkbox.setAttribute("role", "checkbox");
        checkbox.setAttribute("aria-checked", String(checked));
        checkbox.innerHTML = checked
          ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="var(--color-primary)" stroke="var(--color-primary)"/><path d="M4 8L7 11L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="0.5" y="0.5" width="15" height="15" rx="3" stroke="var(--color-border)" stroke-width="1.5"/></svg>';
        el.insertBefore(checkbox, el.firstChild);
        if (checked) el.classList.add("onenote-todo-done");
      } else {
        // Check for priority to-do variants
        if (tag.startsWith("to-do-priority-")) {
          const checked = tag.endsWith(":completed");
          const priorityNum = tag.replace("to-do-priority-", "").replace(":completed", "");
          const checkbox = document.createElement("span");
          checkbox.className = `onenote-checkbox priority-${priorityNum} ${checked ? "checked" : ""}`;
          checkbox.setAttribute("role", "checkbox");
          checkbox.setAttribute("aria-checked", String(checked));
          checkbox.innerHTML = checked
            ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="var(--color-primary)" stroke="var(--color-primary)"/><path d="M4 8L7 11L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="0.5" y="0.5" width="15" height="15" rx="3" stroke="var(--color-destructive)" stroke-width="2"/></svg>';
          el.insertBefore(checkbox, el.firstChild);
          if (checked) el.classList.add("onenote-todo-done");
        } else {
          // Regular note tag — add icon
          const baseTag = tag.replace(":completed", "");
          const icon = TAG_ICONS[baseTag];
          if (icon) {
            const badge = document.createElement("span");
            badge.className = "onenote-tag-icon";
            badge.textContent = icon;
            el.insertBefore(badge, el.firstChild);
          }
          if (tag.endsWith(":completed")) {
            el.classList.add("onenote-tag-done");
          }
        }
      }
    }
    el.setAttribute("data-enhanced", "true");
  });

  // Process embedded file attachments (<object> with data-attachment)
  const objects = container.querySelectorAll("object[data-attachment]");
  objects.forEach((obj) => {
    const filename = obj.getAttribute("data-attachment") ?? "File";
    const dataUrl = obj.getAttribute("data") ?? "";

    const card = document.createElement("div");
    card.className = "onenote-file-card";

    const ext = filename.split(".").pop()?.toUpperCase() ?? "FILE";
    const iconMap: Record<string, string> = {
      PDF: "📄", DOC: "📝", DOCX: "📝", XLS: "📊", XLSX: "📊",
      PPT: "📊", PPTX: "📊", ZIP: "📦", RAR: "📦",
      JPG: "🖼️", JPEG: "🖼️", PNG: "🖼️", GIF: "🖼️",
      MP3: "🎵", WAV: "🎵", MP4: "🎬", AVI: "🎬",
      TXT: "📄", CSV: "📊", JSON: "📄", XML: "📄",
    };
    const fileIcon = iconMap[ext] ?? "📎";

    card.innerHTML = `
      <span class="onenote-file-icon">${fileIcon}</span>
      <div class="onenote-file-info">
        <span class="onenote-file-name">${filename}</span>
        <span class="onenote-file-type">${ext} file</span>
      </div>
    `;

    // If we have a data URL, make it downloadable
    if (dataUrl) {
      card.style.cursor = "pointer";
      card.title = `Download ${filename}`;
      card.addEventListener("click", async () => {
        try {
          const token = await getAccessToken();
          if (!token) return;
          const response = await fetch(dataUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          }
        } catch {
          // silently ignore
        }
      });
    }

    obj.replaceWith(card);
  });

  // Process embedded iframes (videos) — ensure they're responsive
  const iframes = container.querySelectorAll("iframe[data-original-src]");
  iframes.forEach((iframe) => {
    const wrapper = document.createElement("div");
    wrapper.className = "onenote-video-wrapper";
    iframe.parentNode?.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    iframe.setAttribute("allowfullscreen", "true");
  });
}

export function PageViewer() {
  const { selectedPage, animationsEnabled } = useAppStore();
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

  // Post-render: auth images + enhance content
  useEffect(() => {
    if (!contentRef.current || !html) return;

    // Enhance checkboxes, tags, file attachments, videos
    enhanceRenderedContent(contentRef.current);

    // Auth Graph API images
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
    ADD_TAGS: ["meta", "object", "iframe"],
    ADD_ATTR: [
      "data-id", "data-src-type", "data-fullres-src", "data-fullres-src-type", "style",
      "data-tag", "data-attachment", "data-original-src", "data-index",
      "type", "data", "allowfullscreen",
    ],
  });

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <div
        className="flex-1 overflow-y-auto"
        style={{
          animation: animationsEnabled ? "fadeIn 250ms ease-out" : "none",
        }}
      >
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
