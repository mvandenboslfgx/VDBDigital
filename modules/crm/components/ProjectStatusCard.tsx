import type { ClientProjectStatus } from "../types";

type Props = {
  project: ClientProjectStatus;
};

export function ProjectStatusCard({ project }: Props) {
  const statusLabel = project.status;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{project.name}</p>
          <p className="mt-1 text-xs text-gray-400">
            Status:{" "}
            <span className="text-gold font-medium">{statusLabel}</span>
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>
            Created on {project.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      {project.recentRequestCount > 0 && (
        <p className="mt-3 text-[11px] text-gray-400">
          {project.recentRequestCount} recent request
          {project.recentRequestCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default ProjectStatusCard;

