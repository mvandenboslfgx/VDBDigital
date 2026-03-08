import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("admin");
  if (!user) redirect("/login");
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!invoice) notFound();

  const due = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          VDB Digital
        </h1>
        <p className="mt-1 text-sm text-gray-500">Invoice</p>
        <hr className="my-8 border-gray-200" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              From
            </p>
            <p className="mt-1 font-medium text-gray-900">VDB Digital</p>
            <p className="text-sm text-gray-600">[Your business address]</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Bill to
            </p>
            <p className="mt-1 font-medium text-gray-900">{invoice.client.name}</p>
            <p className="text-sm text-gray-600">{invoice.client.email}</p>
          </div>
        </div>
        <table className="mt-8 w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 text-gray-900">
                {invoice.description || "Invoice"}
              </td>
              <td className="py-4 text-right font-medium">
                €{(invoice.amount / 100).toLocaleString()} {invoice.currency.toUpperCase()}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-8 flex justify-between text-sm text-gray-600">
          <span>Due date: {due}</span>
          <span className="font-medium uppercase">{invoice.status}</span>
        </div>
        <p className="mt-12 text-xs text-gray-400">
          Thank you for your business. Use your browser&apos;s Print → Save as PDF to export.
        </p>
      </div>
    </div>
  );
}
