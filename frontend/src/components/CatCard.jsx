import { useState } from "react";

// Expandable card; clicking the header toggles "open" like the old inline onclick.
export default function CatCard({ defaultOpen, header, children, ...attrs }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"cat-card" + (open ? " open" : "")} {...attrs}>
      <div className="cat-header" onClick={() => setOpen(o => !o)}>
        {header}
      </div>
      <div className="cat-body">
        {children}
      </div>
    </div>
  );
}
