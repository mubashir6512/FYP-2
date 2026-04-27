import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, AlertTriangle, Info, Lock, Globe,
  Activity, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const securityAlerts = [
  { id: 1, type: "warning", title: "Multiple Failed Login Attempts", message: "5 failed login attempts detected from IP 192.168.1.105", time: "2 min ago", resolved: false },
  { id: 2, type: "warning", title: "Unusual API Activity", message: "Unusually high request rate from user ID abc123", time: "15 min ago", resolved: false },
  { id: 3, type: "info", title: "New Admin Login", message: "Admin account logged in from a new device", time: "1 hour ago", resolved: true },
  { id: 4, type: "info", title: "Database Backup", message: "Automated backup completed successfully", time: "3 hours ago", resolved: true },
  { id: 5, type: "warning", title: "Suspicious Account Registration", message: "Multiple accounts registered from same IP address", time: "5 hours ago", resolved: false },
];

const recentLogins = [
  { user: "admin@paintverse.com", role: "admin", ip: "192.168.1.1", time: "Just now", status: "success" },
  { user: "dealer@paintverse.com", role: "dealer", ip: "10.0.0.14", time: "5 min ago", status: "success" },
  { user: "unknown@test.com", role: "—", ip: "192.168.1.105", time: "8 min ago", status: "failed" },
  { user: "painter@pro.com", role: "painter", ip: "172.16.0.3", time: "20 min ago", status: "success" },
  { user: "customer@test.com", role: "customer", ip: "10.0.0.22", time: "35 min ago", status: "success" },
];

const systemChecks = [
  { name: "JWT Token Validation", status: "pass" },
  { name: "HTTPS/SSL Certificate", status: "pass" },
  { name: "CORS Configuration", status: "pass" },
  { name: "Password Hashing (bcrypt)", status: "pass" },
  { name: "Database Connection", status: "pass" },
  { name: "Rate Limiting", status: "warn" },
  { name: "Input Sanitization", status: "pass" },
];

export default function AdminSecurityPage() {
  const [alerts, setAlerts] = useState(securityAlerts);

  const resolveAlert = (id: number) => {
    setAlerts(a => a.map(x => x.id === id ? { ...x, resolved: true } : x));
    toast.success("Alert marked as resolved");
  };

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Security Center" description="Monitor platform security, login activity, and system health.">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${unresolvedCount > 0 ? "bg-warning/10" : "bg-success/10"}`}>
          <Shield className={`w-4 h-4 ${unresolvedCount > 0 ? "text-warning" : "text-success"}`} />
          <span className={`text-sm font-medium ${unresolvedCount > 0 ? "text-warning" : "text-success"}`}>
            {unresolvedCount > 0 ? `${unresolvedCount} Active Alerts` : "All Clear"}
          </span>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Security Alerts */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Security Alerts</CardTitle>
              {unresolvedCount > 0 && (
                <Badge className="ml-auto bg-warning/10 text-warning border-warning/20 border">
                  {unresolvedCount} unresolved
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    alert.resolved
                      ? "bg-muted/20 border-border opacity-60"
                      : alert.type === "warning"
                      ? "bg-warning/5 border-warning/20"
                      : "bg-info/5 border-info/20"
                  }`}
                >
                  {alert.type === "warning" ? (
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.resolved ? "text-muted-foreground" : "text-warning"}`} />
                  ) : (
                    <Info className={`w-4 h-4 mt-0.5 shrink-0 ${alert.resolved ? "text-muted-foreground" : "text-info"}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </p>
                  </div>
                  {!alert.resolved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-xs shrink-0"
                    >
                      Resolve
                    </Button>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Security Checks */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center gap-2">
            <Lock className="w-5 h-5 text-success" />
            <CardTitle className="text-lg">Security Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemChecks.map((check) => (
              <div key={check.name} className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground flex-1">{check.name}</span>
                {check.status === "pass" ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : check.status === "warn" ? (
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-border mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Overall Status</span>
                <Badge className="bg-success/10 text-success border-success/20 border text-xs">
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logins */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="w-5 h-5 text-info" />
          <CardTitle className="text-lg">Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogins.map((login, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${login.status === "success" ? "bg-success/10" : "bg-destructive/10"}`}>
                  {login.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{login.user}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {login.ip}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {login.time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {login.role !== "—" && (
                    <Badge variant="secondary" className="capitalize text-xs hidden sm:flex">
                      {login.role}
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs ${login.status === "success"
                      ? "bg-success/10 text-success border-success/20 border"
                      : "bg-destructive/10 text-destructive border-destructive/20 border"}`}
                  >
                    {login.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
