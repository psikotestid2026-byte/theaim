import { getAllPackages } from "@/lib/queries/service-packages";
import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export default async function AdminServicePackagesPage() {
  const packages = await getAllPackages().catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Daftar Paket Layanan"
        description="Manajemen harga dan detail paket layanan."
        data={packages}
        columns={[
          { header: "Layanan", cell: (p) => (
            <span className="font-medium text-slate-700">{String(p.service_name || "-")}</span>
          ) },
          { header: "Nama Paket", cell: (p) => (
            <div>
              <p className="font-bold text-slate-900">{p.name}</p>
              {p.test_code && <p className="text-xs text-slate-500 font-mono">Kode Tes: {p.test_code}</p>}
            </div>
          ) },
          { header: "Tipe Harga", cell: (p) => (
            <span className="text-sm capitalize">{p.price_type}</span>
          ) },
          { header: "Harga", cell: (p) => {
            if (p.price_type === "fixed" && p.price_amount) {
              return <span className="font-bold">{formatIDR(Number(p.price_amount))}</span>;
            } else if (p.price_type === "range" && p.price_min && p.price_max) {
              return <span className="font-bold text-xs">{formatIDR(Number(p.price_min))} - {formatIDR(Number(p.price_max))}</span>;
            }
            return <span className="text-slate-500 italic">Sesuai Kesepakatan</span>;
          } },
          { header: "Satuan", cell: (p) => (
            <span className="text-xs text-slate-500 capitalize">{p.price_unit?.replace(/_/g, " ")}</span>
          ) },
          { header: "Status", cell: (p) => {
            const isActive = p.status === "active";
            return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {String(p.status)}
              </span>
            );
          } },
          { header: "Aksi", cell: (p) => (
            <Link href={`/panel/service-packages/${p.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Edit ↗
            </Link>
          ) },
        ]}
        action={
          <button className="btn-primary px-4 py-2 rounded-xl text-sm shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            + Tambah Paket
          </button>
        }
      />
    </div>
  );
}
