import { useRef, useState } from "react";

// Drag & drop target with the same depth counter as the old setupDropTarget().
export default function useDropTarget(onDrop) {
  const [dragover, setDragover] = useState(false);
  const dragDepth = useRef(0);

  const handlers = {
    onDragEnter: (e) => {
      e.preventDefault();
      dragDepth.current++;
      setDragover(true);
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: () => {
      dragDepth.current--;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragover(false);
      }
    },
    onDrop: (e) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragover(false);
      if (e.dataTransfer.files.length) onDrop(e.dataTransfer.files);
    },
  };

  return [dragover, handlers];
}
