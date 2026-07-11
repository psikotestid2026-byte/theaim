import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminPaymentInstructionsPage() {
  const instructions = await sql`
    SELECT pi.*, pm.name as method_name
    FROM payment_instructions pi
    JOIN payment_methods pm ON pm.id = pi.payment_method_id
    ORDER BY pm.name, pi.sort_order
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Instruksi Pembayaran"
        description="Langkah-langkah pembayaran per metode yang tampil di checkout."
        data={instructions}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Metode Pembayaran", accessorKey: "method_name" },
          { header: "Judul Langkah", accessorKey: "title" },
          { header: "Urutan", accessorKey: "sort_order" },
          { header: "Aksi", cell: () => (
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Edit ↗</span>
          ) },
        ]}
      />
    </div>
  );
}
