import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Globe, Bell, Palette, Shield, Save,
  ToggleLeft, ToggleRight, Percent, Mail, Phone, Info, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const defaultSettings = {
  platformName: "PaintVerse",
  supportEmail: "support@paintverse.com",
  supportPhone: "+92 300 0000000",
  commissionRate: 10,
  taxRate: 17,
  features: {
    aiVisualizer: true,
    painterBooking: true,
    dealerPOS: true,
    customerWishlist: true,
    analytics: true,
  },
  notifications: {
    emailOnNewUser: true,
    emailOnNewOrder: false,
    emailOnSecurityAlert: true,
  },
  maintenance: false,
};

type SettingsType = typeof defaultSettings;

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<SettingsType>(defaultSettings);

  const { data: remoteSettings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => api("/system"),
  });

  useEffect(() => {
    if (remoteSettings && Object.keys(remoteSettings).length > 0) {
      setLocalSettings(prev => ({ ...prev, ...remoteSettings }));
    }
  }, [remoteSettings]);

  const saveMutation = useMutation({
    mutationFn: (settings: SettingsType) => api("/system", {
      method: "POST",
      body: JSON.stringify(settings),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateFeature = (key: keyof SettingsType["features"], value: boolean) =>
    setLocalSettings(s => ({ ...s, features: { ...s.features, [key]: value } }));

  const updateNotif = (key: keyof SettingsType["notifications"], value: boolean) =>
    setLocalSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: value } }));

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          enabled ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border border-border"
        }`}
      >
        {enabled ? (
          <><ToggleRight className="w-4 h-4" /> Enabled</>
        ) : (
          <><ToggleLeft className="w-4 h-4" /> Disabled</>
        )}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Platform Settings" description="Configure platform-wide settings, features, and notifications.">
        <Button 
          variant="accent" 
          onClick={() => saveMutation.mutate(localSettings)} 
          disabled={saveMutation.isPending} 
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Platform Name</label>
                <Input
                  value={localSettings.platformName}
                  onChange={e => setLocalSettings(s => ({ ...s, platformName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Support Email
                </label>
                <Input
                  type="email"
                  value={localSettings.supportEmail}
                  onChange={e => setLocalSettings(s => ({ ...s, supportEmail: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Support Phone
                </label>
                <Input
                  value={localSettings.supportPhone}
                  onChange={e => setLocalSettings(s => ({ ...s, supportPhone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Platform Commission (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={localSettings.commissionRate}
                  onChange={e => setLocalSettings(s => ({ ...s, commissionRate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Tax Rate (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={localSettings.taxRate}
                  onChange={e => setLocalSettings(s => ({ ...s, taxRate: Number(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Flags */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card variant="elevated" className="mb-6">
            <CardHeader className="flex flex-row items-center gap-2">
              <Palette className="w-5 h-5 text-info" />
              <CardTitle className="text-lg">Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ToggleSwitch
                enabled={localSettings.features.aiVisualizer}
                onChange={v => updateFeature("aiVisualizer", v)}
                label="AI Room Visualizer"
              />
              <ToggleSwitch
                enabled={localSettings.features.painterBooking}
                onChange={v => updateFeature("painterBooking", v)}
                label="Painter Booking System"
              />
              <ToggleSwitch
                enabled={localSettings.features.dealerPOS}
                onChange={v => updateFeature("dealerPOS", v)}
                label="Dealer POS System"
              />
              <ToggleSwitch
                enabled={localSettings.features.customerWishlist}
                onChange={v => updateFeature("customerWishlist", v)}
                label="Customer Wishlist"
              />
              <ToggleSwitch
                enabled={localSettings.features.analytics}
                onChange={v => updateFeature("analytics", v)}
                label="Analytics Dashboard"
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Admin Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ToggleSwitch
                enabled={localSettings.notifications.emailOnNewUser}
                onChange={v => updateNotif("emailOnNewUser", v)}
                label="Email on New User Registration"
              />
              <ToggleSwitch
                enabled={localSettings.notifications.emailOnNewOrder}
                onChange={v => updateNotif("emailOnNewOrder", v)}
                label="Email on New Order"
              />
              <ToggleSwitch
                enabled={localSettings.notifications.emailOnSecurityAlert}
                onChange={v => updateNotif("emailOnSecurityAlert", v)}
                label="Email on Security Alert"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance Mode */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="elevated" className="mt-6 border-warning/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="w-5 h-5 text-warning" />
            <CardTitle className="text-lg">Maintenance Mode</CardTitle>
            {localSettings.maintenance && (
              <Badge className="ml-auto bg-warning/10 text-warning border-warning/20 border">Active</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-foreground mb-1">
                  When enabled, the platform will show a maintenance page to regular users.
                  Admins can still access the dashboard.
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Info className="w-3.5 h-3.5" />
                  This setting is now synchronized across the entire platform.
                </div>
              </div>
              <Button
                variant={localSettings.maintenance ? "destructive" : "outline"}
                onClick={() => setLocalSettings(s => ({ ...s, maintenance: !s.maintenance }))}
                className="shrink-0"
              >
                {localSettings.maintenance ? "Disable Maintenance" : "Enable Maintenance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
