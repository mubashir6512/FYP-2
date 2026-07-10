import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PainterRef {
  painter_id: string;
  full_name: string;
  hourly_rate: number;
}

interface Props {
  painter: PainterRef | null;
  onClose: () => void;
}

export function BookPainterDialog({ painter, onClose }: Props) {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    job_type: "interior",
    location: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "",
    customer_phone: "",
  });

  if (!painter) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to book a painter");
      onClose();
      navigate("/login");
      return;
    }

    if (role !== "customer") {
      toast.error("Only customers can book painters");
      return;
    }

    if (!form.location.trim()) {
      toast.error("Please enter the job location");
      return;
    }

    setIsSubmitting(true);
    const hours = parseInt(form.estimated_hours) || 0;
    const cost = hours * painter.hourly_rate;

    const { error } = await supabase.from("painter_jobs").insert({
      painter_id: painter.painter_id,
      customer_id: user.id,
      customer_name: profile?.full_name || "Customer",
      customer_phone: form.customer_phone || null,
      job_type: form.job_type,
      location: form.location,
      description: form.description || null,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      estimated_hours: hours,
      estimated_cost: cost,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Booking request sent!", {
      description: `${painter.full_name} will review your request shortly.`,
    });
    onClose();
    setForm({
      job_type: "interior",
      location: "",
      description: "",
      scheduled_date: "",
      scheduled_time: "",
      estimated_hours: "",
      customer_phone: "",
    });
  };

  return (
    <Dialog open={!!painter} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {painter.full_name}</DialogTitle>
          <DialogDescription>
            Send a job request. The painter will review and confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="job_type">Job Type</Label>
            <select
              id="job_type"
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
              <option value="commercial">Commercial</option>
              <option value="decorative">Decorative</option>
              <option value="touch-up">Touch-up</option>
            </select>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Address or area"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customer_phone">Your Phone</Label>
            <Input
              id="customer_phone"
              type="tel"
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              placeholder="Contact number"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="scheduled_date">Preferred Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="mt-1"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="scheduled_time">Preferred Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              min="1"
              value={form.estimated_hours}
              onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
              placeholder="e.g. 8"
              className="mt-1"
            />
            {form.estimated_hours && painter.hourly_rate > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated cost: â‚¹{(parseInt(form.estimated_hours) * painter.hourly_rate).toFixed(0)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the work needed..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


