import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

interface BookingDialogProps {
    painter: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ painter, open, onOpenChange }: BookingDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jobType: "interior",
        location: "",
        scheduledDate: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.location || !formData.scheduledDate) {
            toast.error("Please fill in location and date");
            return;
        }

        setLoading(true);
        try {
            await api("/painters", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    painterId: painter.id,
                    customerName: "", // Will be handled by backend from user profile
                    estimatedCost: (painter.hourlyRate || 500) * 8, // Default 8 hours estimate
                }),
            });

            toast.success(`Booking request sent to ${painter.name}!`);
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book {painter?.name}</DialogTitle>
                    <DialogDescription>
                        Send a booking request for your painting project.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select
                            value={formData.jobType}
                            onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="interior">Interior Painting</SelectItem>
                                <SelectItem value="exterior">Exterior Painting</SelectItem>
                                <SelectItem value="texture">Texture & Design</SelectItem>
                                <SelectItem value="touchup">Touch-up Work</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location / Address</Label>
                        <Input
                            id="location"
                            placeholder="Enter your address"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scheduledDate">Preferred Date</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="scheduledDate"
                                type="date"
                                className="pl-10"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Project Details (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g. number of rooms, specific colors..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="accent" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Booking
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
