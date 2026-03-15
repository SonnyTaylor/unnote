import { useCallback } from "react";

interface ResizeHandleProps {
  onDelta: (delta: number) => void;
  onEnd: () => void;
}

export function ResizeHandle({ onDelta, onEnd }: ResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      let lastX = e.clientX;

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - lastX;
        lastX = e.clientX;
        onDelta(delta);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        onEnd();
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onDelta, onEnd]
  );

  return (
    <div
      className="group relative z-10 w-[5px] cursor-col-resize flex-shrink-0"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-y-0 left-[2px] w-px bg-border/60 group-hover:bg-primary/40 group-hover:w-[2px] group-hover:left-[1.5px] transition-all duration-150" />
    </div>
  );
}
