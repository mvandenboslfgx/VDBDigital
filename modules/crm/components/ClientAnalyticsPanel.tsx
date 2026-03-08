import type { ClientAnalyticsSummary } from "../types";

type Props = {
  summary: ClientAnalyticsSummary;
};

export function ClientAnalyticsPanel({ summary }: Props) {
  return (
    <section className="glass-panel border-white/10 bg-black/80 p-6">
      <h3 className="text-sm font-semibold text-white">Project overview</h3>
      <p className="mt-2 text-xs text-gray-400">
        A quick overview of your projects, from kickoff to completion.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 text-sm">
        <div className="rounded-2xl bg-black/60 p-4 border border-white/10">
          <p className="text-xs text-gray-400">Total projects</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.totalProjects}
          </p>
        </div>
        <div className="rounded-2xl bg-black/60 p-4 border border-white/10">
          <p className="text-xs text-gray-400">Active</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.activeProjects}
          </p>
        </div>
        <div className="rounded-2xl bg-black/60 p-4 border border-white/10">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.completedProjects}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ClientAnalyticsPanel;

