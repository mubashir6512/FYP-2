import { useEffect, useState } from "react";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  specialty: z
    .string()
    .trim()
    .min(2, { message: "Specialty must be at least 2 characters" })
    .max(80, { message: "Specialty must be less than 80 characters" }),
  hourly_rate: z
    .number({ invalid_type_error: "Hourly rate is required" })
    .min(1, { message: "Hourly rate must be greater than 0" })
    .max(100000, { message: "Hourly rate seems too high" }),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(120, { message: "Location must be less than 120 characters" }),
  bio: z
    .string()
    .trim()
    .max(1000, { message: "Bio must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
  experience_years: z
    .number({ invalid_type_error: "Experience is required" })
    .int({ message: "Must be a whole number" })
    .min(0, { message: "Cannot be negative" })
    .max(80, { message: "Please enter a realistic value" }),
  availability: z.enum(["available", "busy"], {
    errorMap: () => ({ message: "Select an availability option" }),
  }),
  skills: z
    .array(z.string().trim().min(1).max(40))
    .max(20, { message: "Up to 20 skills allowed" }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof profileSchema>, string>>;

export default function PainterProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-painter-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("painter_profiles")
        .select("*")
        .eq("painter_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [form, setForm] = useState({
    specialty: "",
    hourly_rate: "",
    location: "",
    bio: "",
    experience_years: "",
    availability: "available",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (profile) {
      setForm({
        specialty: profile.specialty || "",
        hourly_rate: String(profile.hourly_rate || ""),
        location: profile.location || "",
        bio: profile.bio || "",
        experience_years: String(profile.experience_years || ""),
        availability: profile.availability || "available",
        skills: profile.skills || [],
      });
    }
  }, [profile]);

  const validate = () => {
    const parsed = profileSchema.safeParse({
      specialty: form.specialty,
      hourly_rate: form.hourly_rate === "" ? NaN : Number(form.hourly_rate),
      location: form.location,
      bio: form.bio,
      experience_years: form.experience_years === "" ? NaN : Number(form.experience_years),
      availability: form.availability,
      skills: form.skills,
    });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return parsed.data;
  };

  const saveMutation = useMutation({
    mutationFn: async (validated: z.infer<typeof profileSchema>) => {
      const payload = {
        painter_id: user!.id,
        specialty: validated.specialty,
        hourly_rate: validated.hourly_rate,
        location: validated.location,
        bio: validated.bio || null,
        experience_years: validated.experience_years,
        availability: validated.availability,
        skills: validated.skills,
      };
      if (profile) {
        const { error } = await supabase
          .from("painter_profiles")
          .update(payload)
          .eq("painter_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("painter_profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile saved!");
      queryClient.invalidateQueries({ queryKey: ["my-painter-profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-painters"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validate();
    if (!validated) {
      toast.error("Please fix the errors below");
      return;
    }
    saveMutation.mutate(validated);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (s.length > 40) {
      setErrors({ ...errors, skills: "Each skill must be under 40 characters" });
      return;
    }
    if (form.skills.includes(s)) {
      setErrors({ ...errors, skills: "Skill already added" });
      return;
    }
    if (form.skills.length >= 20) {
      setErrors({ ...errors, skills: "Up to 20 skills allowed" });
      return;
    }
    setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput("");
    setErrors({ ...errors, skills: undefined });
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const errorClass = (field: keyof FieldErrors) =>
    errors[field] ? "border-destructive focus-visible:ring-destructive" : "";

  if (isLoading) {
    return (
      <DashboardLayout role="painter">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="painter">
      <PageHeader
        title="My Public Profile"
        description="This information appears to customers browsing painters."
      />

      <Card variant="elevated" className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="e.g. Interior & Exterior"
                  maxLength={80}
                  className={cn("mt-1", errorClass("specialty"))}
                  aria-invalid={!!errors.specialty}
                />
                {errors.specialty && (
                  <p className="text-sm text-destructive mt-1">{errors.specialty}</p>
                )}
              </div>
              <div>
                <Label htmlFor="hourly_rate">Per Day Rate (Rs.)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  placeholder="500"
                  className={cn("mt-1", errorClass("hourly_rate"))}
                  aria-invalid={!!errors.hourly_rate}
                />
                {errors.hourly_rate && (
                  <p className="text-sm text-destructive mt-1">{errors.hourly_rate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, area"
                  maxLength={120}
                  className={cn("mt-1", errorClass("location"))}
                  aria-invalid={!!errors.location}
                />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location}</p>
                )}
              </div>
              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  placeholder="5"
                  className={cn("mt-1", errorClass("experience_years"))}
                  aria-invalid={!!errors.experience_years}
                />
                {errors.experience_years && (
                  <p className="text-sm text-destructive mt-1">{errors.experience_years}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="availability">Availability</Label>
                  <span
                    role="status"
                    aria-live="polite"
                    aria-label={`Current availability status: ${
                      form.availability === "available" ? "Available for new jobs" : "Busy, not accepting new jobs"
                    }`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      form.availability === "available"
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-destructive/10 text-destructive border-destructive/30",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-2 h-2 rounded-full",
                        form.availability === "available"
                          ? "bg-success animate-pulse"
                          : "bg-destructive",
                      )}
                    />
                    {form.availability === "available" ? "Available" : "Busy"}
                  </span>
                </div>
                <select
                  id="availability"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  aria-describedby="availability-help"
                  className={cn(
                    "w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1",
                    errors.availability && "border-destructive",
                  )}
                  aria-invalid={!!errors.availability}
                >
                  <option value="available">Available â€” accepting new jobs</option>
                  <option value="busy">Busy â€” not accepting new jobs</option>
                </select>
                <p id="availability-help" className="sr-only">
                  Choose whether customers can book you for new painting jobs.
                </p>
                {errors.availability && (
                  <p className="text-sm text-destructive mt-1">{errors.availability}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell customers about your work..."
                rows={4}
                maxLength={1000}
                className={cn("mt-1", errors.bio && "border-destructive focus-visible:ring-destructive")}
                aria-invalid={!!errors.bio}
              />
              <div className="flex justify-between mt-1">
                {errors.bio ? (
                  <p className="text-sm text-destructive">{errors.bio}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">{form.bio.length}/1000</p>
              </div>
            </div>

            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  maxLength={40}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill} className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {errors.skills && (
                <p className="text-sm text-destructive mt-1">{errors.skills}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {form.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="gap-2"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}


