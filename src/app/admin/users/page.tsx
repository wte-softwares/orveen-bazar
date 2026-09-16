"use client";

import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/StoreProvider";
import { AdminShell, DataTable, StatusBadge } from "@/components/admin/AdminKit";
import { ErrorState } from "@/components/ui/feedback";
import { organizations, type OrgSlug } from "@/data/organizations";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { state, setUserStatus, setUserOrgs } = useAdminStore();
  const { user } = useAuth();
  const { push } = useToast();
  usePageTitle(t("admin.usersTitle"), "Users");

  const isAdmin = user?.role === "admin";

  return (
    <AdminShell title={t("admin.usersTitle")}>
      {!isAdmin ? (
        <ErrorState
          title={t("admin.accessDenied")}
          description={t("admin.accessDeniedDesc")}
        />
      ) : (
        <DataTable
          head={[
            t("admin.userName"),
            t("admin.userEmail"),
            t("admin.userRole"),
            t("admin.userOrg"),
            t("admin.userStatus"),
            t("admin.actions"),
          ]}
        >
          {state.users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 font-semibold text-[#17242A]">{u.name}</td>
              <td className="px-4 py-3 text-[#66777D]">{u.email}</td>
              <td className="px-4 py-3 capitalize text-[#17242A]">{u.role}</td>
              <td className="px-4 py-3 text-[#66777D]">
                {u.orgs === "all" ? (
                  t("admin.allOrgs")
                ) : u.role === "staff" ? (
                  <span className="flex flex-wrap gap-1" aria-label={t("admin.assignOrgs")}>
                    {organizations.map((org) => {
                      const has = (u.orgs as string[]).includes(org.slug);
                      return (
                        <button
                          key={org.slug}
                          type="button"
                          aria-pressed={has}
                          title={t("admin.assignOrgs")}
                          onClick={() =>
                            setUserOrgs(
                              u.id,
                              (has
                                ? (u.orgs as string[]).filter((o) => o !== org.slug)
                                : [...(u.orgs as string[]), org.slug]) as OrgSlug[],
                            )
                          }
                          className={
                            has
                              ? "rounded-full bg-[#075ED1] px-2.5 py-1 text-[10.5px] font-bold text-white"
                              : "rounded-full border border-[#E2E8EA] px-2.5 py-1 text-[10.5px] font-semibold text-[#66777D] transition hover:bg-[#EAF3FE]"
                          }
                        >
                          {org.slug}
                        </button>
                      );
                    })}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={u.status} />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setUserStatus(u.id, u.status === "active" ? "inactive" : "active");
                    push(u.status === "active" ? t("admin.inactive") : t("admin.active"), "info");
                  }}
                  className="rounded-lg border border-[#E2E8EA] px-3 py-1.5 text-[12px] font-semibold text-[#075ED1] transition hover:bg-[#EAF3FE]"
                >
                  {u.status === "active" ? t("admin.deactivate") : t("admin.activate")}
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </AdminShell>
  );
}
