import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Edit2,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from "../../lib/permissions";

function SettingsRoles() {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  useEffect(() => {
    void fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await client.get("/admin/roles");
      const rolesData = res?.data?.data?.roles || res?.data?.data || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch {
      toast.error(tx("adminPages.settingsRoles.fetchError", "Failed to load roles"));
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions(new Set());
    setEditingRole(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRole(role);
    setRoleName(role.name || "");
    setRoleDescription(role.description || "");
    setSelectedPermissions(new Set(role.permissions || []));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error(tx("adminPages.settingsRoles.roleNameRequired", "Role name is required"));
      return;
    }
    if (selectedPermissions.size === 0) {
      toast.error(tx("adminPages.settingsRoles.permissionsRequired", "Select at least one permission"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        permissions: Array.from(selectedPermissions),
      };

      if (editingRole?.id) {
        await client.patch(`/admin/roles/${editingRole.id}`, payload);
        toast.success(tx("adminPages.settingsRoles.updated", "Role updated successfully"));
      } else {
        await client.post("/admin/roles", payload);
        toast.success(tx("adminPages.settingsRoles.created", "Role created successfully"));
      }

      resetForm();
      await fetchRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || tx("adminPages.settingsRoles.saveFailed", "Failed to save role"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(tx("adminPages.settingsRoles.deleteConfirm", `Delete role "${role.name}"?`))) return;
    try {
      await client.delete(`/admin/roles/${role.id}`);
      toast.success(tx("adminPages.settingsRoles.deleted", "Role deleted successfully"));
      await fetchRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || tx("adminPages.settingsRoles.deleteFailed", "Failed to delete role"));
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <PageHeader title={tx("adminPages.settingsRoles.title", "Roles & Permissions")} subtitle={tx("adminPages.settingsRoles.subtitle", "Manage role access matrix")} />
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-16 dark:border-white/8 dark:bg-[#1A1A22]">
          <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={tx("adminPages.settingsRoles.title", "Roles & Permissions")}
        subtitle={tx("adminPages.settingsRoles.subtitle", "Manage role access matrix")}
        action={
          !showForm ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              {tx("adminPages.settingsRoles.newRole", "New Role")}
            </button>
          ) : null
        }
      />

      {showForm ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingRole ? tx("adminPages.settingsRoles.editRole", "Edit Role") : tx("adminPages.settingsRoles.createRole", "Create Role")}
            </h3>
            <button onClick={resetForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder={tx("adminPages.settingsRoles.roleName", "Role name")}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
              <input
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder={tx("adminPages.settingsRoles.description", "Description")}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </div>

            <div className="space-y-4">
              {Object.entries(PERMISSION_GROUPS).map(([groupId, group]) => (
                <div key={groupId} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{group.label}</p>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedPermissions);
                        group.permissions.forEach((p) => next.add(p.key));
                        setSelectedPermissions(next);
                      }}
                      className="text-xs font-bold text-[#B91C1C]"
                    >
                      {tx("adminPages.settingsRoles.selectAll", "Select all")}
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.permissions.map((perm) => {
                      const checked = selectedPermissions.has(perm.key);
                      return (
                        <label key={perm.key} className={`flex items-center justify-between rounded-lg border p-3 text-sm ${checked ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-slate-200 dark:border-white/10"}`}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{perm.label}</span>
                            <span className="text-[11px] text-slate-500">{perm.key}</span>
                          </div>
                          <input type="checkbox" checked={checked} onChange={() => togglePermission(perm.key)} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Array.from(selectedPermissions).some((p) => !ALL_PERMISSIONS.includes(p)) ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <div className="mb-2 inline-flex items-center gap-2 font-bold">
                    <AlertCircle className="h-4 w-4" />
                    {tx("adminPages.settingsRoles.legacy", "Legacy permissions")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedPermissions)
                      .filter((p) => !ALL_PERMISSIONS.includes(p))
                      .map((p) => (
                        <button key={p} type="button" onClick={() => togglePermission(p)} className="rounded-md border border-amber-300 px-2 py-1">
                          {p}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-white/10 dark:text-white">
                {tx("common.cancel", "Cancel")}
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-bold text-white disabled:opacity-70">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {tx("adminPages.settingsRoles.save", "Save Permissions")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.length ? (
          roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="mb-4 flex items-start justify-between">
                <div className="inline-flex rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(role)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(role)} disabled={Number(role.userCount || 0) > 0} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{role.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-slate-500 dark:text-slate-400">{role.description || "—"}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {role.permissions?.length || 0} {tx("adminPages.settingsRoles.permissions", "Permissions")}
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="h-4 w-4 text-blue-500" />
                  {role.userCount || 0}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-white/20 dark:bg-[#1A1A22]">
            <Shield className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tx("adminPages.settingsRoles.emptyTitle", "No custom roles yet")}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tx("adminPages.settingsRoles.emptyDesc", "Create your first role to configure access control.")}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default SettingsRoles;

