"use client";

export default function ArchitectGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,169,93,0.08),transparent_60%)]" />

      {/* Grid layer */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Gold vertical accent lines */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(198,169,93,0.4) 50%, transparent 100%)
          `,
          backgroundSize: "400px 100%",
        }}
      />
    </div>
  );
}

