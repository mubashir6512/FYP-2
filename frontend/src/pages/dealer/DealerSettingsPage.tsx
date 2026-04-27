import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings, User, Store, Bell, Save, Shield,
  Mail, Phone, MapPin, Eye, EyeOff, Info, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DealerSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: profile?.fullName || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    businessName: profile?.businessName || "",
    address: profile?.address || "",
    city: profile?.city || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailOnNewOrder: profile?.notifications?.emailOnNewOrder ?? true,
    emailOnLowStock: profile?.notifications?.emailOnLowStock ?? true,
    smsOnNewOrder: profile?.notifications?.smsOnNewOrder ?? false,
  });

  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        businessName: profile.businessName || "",
        address: profile.address || "",
        city: profile.city || "",
      }));
      if (profile.notifications) {
        setNotifications(profile.notifications);
      }
    }
  }, [profile]);

  const update = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const updateNotif = (key: string, value: boolean) =>
    setNotifications(n => ({ ...n, [key]: value }));

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          notifications,
          password: form.newPassword || undefined,
        }),
      });
      await refreshProfile();
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({
    enabled, onChange, label, description,
  }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          enabled ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border border-border"
        }`}
      >
        {enabled ? "On" : "Off"}
      </button>
    </div>
  );

  return (
    <DashboardLayout role="dealer">
      <PageHeader title="Account Settings" description="Manage your profile, business info, and preferences.">
        <Button variant="accent" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border mb-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
                  {(form.fullName || user?.email || "D").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{form.fullName || "—"}</p>
                  <Badge variant="secondary" className="text-xs capitalize">Company Account</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
                <Input value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <Input value={form.email} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Email cannot be changed here. Contact admin.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+92 300 0000000" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card variant="elevated" className="mb-6">
            <CardHeader className="flex flex-row items-center gap-2">
              <Store className="w-5 h-5 text-info" />
              <CardTitle className="text-lg">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Business / Shop Name</label>
                <Input value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="My Paint Shop" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </label>
                <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Street address" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">City</label>
                <Input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Karachi" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ToggleSwitch
                enabled={notifications.emailOnNewOrder}
                onChange={v => updateNotif("emailOnNewOrder", v)}
                label="Email on New Order"
                description="Get notified when a POS order is placed"
              />
              <ToggleSwitch
                enabled={notifications.emailOnLowStock}
                onChange={v => updateNotif("emailOnLowStock", v)}
                label="Low Stock Alerts"
                description="Get alerted when products are running low"
              />
              <ToggleSwitch
                enabled={notifications.smsOnNewOrder}
                onChange={v => updateNotif("smsOnNewOrder", v)}
                label="SMS on New Order"
                description="Requires a verified phone number"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="elevated" className="mt-6">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={e => update("newPassword", e.target.value)}
                    placeholder="New password"
                  />
                  <button
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Confirm Password</label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => update("confirmPassword", e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Leave blank to keep your current password.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
