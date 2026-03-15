import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";

let tauriWindow: any = null;

// Lazy-load the Tauri window API (only available inside Tauri)
async function getWindow() {
  if (tauriWindow) return tauriWindow;
  try {
    const mod = await import("@tauri-apps/api/window");
    tauriWindow = mod.getCurrentWindow();
    return tauriWindow;
  } catch {
    return null;
  }
}

export function Titlebar() {
  const [maximized, setMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    getWindow().then(async (win) => {
      if (!win) return;
      setIsTauri(true);
      setMaximized(await win.isMaximized());

      // Listen for maximize/unmaximize to update the icon
      const unlisten = await win.onResized(async () => {
        setMaximized(await win.isMaximized());
      });
      return () => { unlisten(); };
    });
  }, []);

  // Don't render titlebar when running in browser (dev without Tauri)
  if (!isTauri) return null;

  const handleMinimize = async () => {
    const win = await getWindow();
    win?.minimize();
  };

  const handleMaximize = async () => {
    const win = await getWindow();
    win?.toggleMaximize();
  };

  const handleClose = async () => {
    const win = await getWindow();
    win?.close();
  };

  const handleDragStart = async (e: React.MouseEvent) => {
    // Only start drag on left click, not on buttons
    if (e.button !== 0) return;
    const win = await getWindow();
    win?.startDragging();
  };

  const handleDoubleClick = async () => {
    const win = await getWindow();
    win?.toggleMaximize();
  };

  return (
    <div
      className="titlebar flex h-8 w-full items-center justify-end select-none shrink-0 bg-sidebar-background"
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag region takes up all space */}
      <div className="flex-1" />

      {/* Window controls */}
      <div className="flex h-full" onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={handleMinimize}
          className="flex h-full w-[46px] items-center justify-center text-foreground/60 hover:bg-foreground/8"
          title="Minimize"
        >
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-full w-[46px] items-center justify-center text-foreground/60 hover:bg-foreground/8"
          title={maximized ? "Restore" : "Maximize"}
        >
          {maximized ? (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Square className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={handleClose}
          className="flex h-full w-[46px] items-center justify-center text-foreground/60 hover:bg-red-500 hover:text-white"
          title="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
