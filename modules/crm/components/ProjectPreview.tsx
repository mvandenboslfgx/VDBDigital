"use client";

import { motion } from "framer-motion";

type ProjectPreviewProps = {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    previewUrl?: string | null;
  }>;
};

export function ProjectPreview({ projects }: ProjectPreviewProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        WEBSITE PREVIEW
      </p>
      {projects.length === 0 ? (
        <p className="mt-3 text-sm text-gray-200">
          Your live project URLs and preview environments will appear here as
          projects are onboarded.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/10 bg-black/60 p-4"
            >
              <p className="text-sm font-semibold text-white">{project.name}</p>
              <p className="mt-1 text-[11px] text-gray-400">{project.status}</p>
              {project.previewUrl ? (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-gold hover:underline"
                >
                  View preview →
                </a>
              ) : (
                <p className="mt-3 text-[11px] text-gray-500">
                  Preview link will be shared when ready.
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-gray-400">
        Share links with your team and stakeholders for review without leaving
        the portal.
      </p>
    </div>
  );
}

export default ProjectPreview;
