import { sql } from "@/lib/db";
import DataTable from "@/components/admin/DataTable";

export default async function AdminUsersPage() {
  const users = await sql`
    SELECT * FROM admin_users ORDER BY role, full_name
  `.catch(() => []);

  return (
    <div className="space-y-6">
      <DataTable
        title="Admin Users"
        description="Manajemen hak akses admin panel."
        data={users}
        columns={[
          { header: "Nama", cell: (u: any) => (
            <div>
              <p className="font-bold text-slate-900">{u.full_name}</p>
              <p className="text-[10px] text-slate-500">{u.email}</p>
            </div>
          ) },
          { header: "Role", cell: (u: any) => (
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded capitalize">
              {u.role.replace(/_/g, " ")}
            </span>
          ) },
          { header: "Status", cell: (u: any) => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {u.status}
            </span>
          ) },
          { header: "Login Terakhir", cell: (u: any) => <span className="text-xs text-slate-500">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("id-ID") : "Belum Pernah"}</span> },
        ]}
      />
    </div>
  );
}
