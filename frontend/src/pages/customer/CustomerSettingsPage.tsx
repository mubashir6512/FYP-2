import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Phone, Mail, Shield } from "lucide-react";

export default function CustomerSettingsPage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || "",
        phone: profile?.phone || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: We'll need to ensure the profile endpoint exists or use a generic update
            await api(`/auth/profile/${user?.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            toast.success("Profile updated successfully!");
            // Force refresh or update context if possible
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="customer">
            <PageHeader
                title="Settings"
                description="Manage your account preferences and profile information."
            />

            <div className="grid gap-6 max-w-4xl">
                <Card variant="elevated">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-accent" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription>Update your personal details displayed on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        className="pl-10"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        className="pl-10 bg-muted/50 cursor-not-allowed"
                                        value={user?.email || ""}
                                        disabled
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-10"
                                        placeholder="e.g. +92 300 1234567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="accent" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card variant="elevated" className="border-destructive/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-destructive" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Manage your password and account security settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="text-destructive hover:bg-destructive/5 border-destructive/30">
                            Reset Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
