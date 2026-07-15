import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useState } from "react";
import { BookingDialog } from "@/components/painters/BookingDialog";

export function PaintersSection() {
  const [selectedPainter, setSelectedPainter] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: paintersList = [], isLoading } = useQuery({
    queryKey: ["featured-painters"],
    queryFn: async () => {
      return api("/painters/all");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const painters = paintersList.map((p: any) => ({
    id: p.id,
    name: p.profile?.fullName || p.email,
    specialty: p.profile?.specialization || "Professional Painter",
    rating: Number(p.profile?.rating || 4.5),
    reviews: p.profile?.reviewsCount || 0,
    location: p.profile?.city || p.profile?.address || "Available Locally",
    experience: `${p.profile?.experience || 5} years`,
    hourlyRate: Number(p.profile?.hourlyRate) > 0 ? Number(p.profile?.hourlyRate) : 3000,
    availability: p.profile?.availability || "Available",
    avatar: (p.profile?.fullName || p.email).substring(0, 2).toUpperCase(),
    skills: p.profile?.skills || ["Interior", "Exterior"],
  }));
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">
            Professional Services
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Top-Rated Painters Near You
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect with verified professionals. Read reviews, compare rates, and book instantly.
          </p>
        </motion.div>

        {/* Painters Grid */}
        {painters.length === 0 ? (
          <div className="text-center py-24 bg-background/50 rounded-3xl border border-dashed border-border mb-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Painters Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any verified painters at the moment. Check back soon or join as a painter to offer your services!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {painters.map((painter, index) => (
              <motion.div
                key={painter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {painter.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">
                          {painter.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{painter.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{painter.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({painter.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {painter.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {painter.experience} experience
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Badge
                          variant={painter.availability === "Available" ? "success" : "warning"}
                        >
                          {painter.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {painter.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          Rs. {painter.hourlyRate}
                        </span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          setSelectedPainter(painter);
                          setIsBookingOpen(true);
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {selectedPainter && (
          <BookingDialog
            painter={selectedPainter}
            open={isBookingOpen}
            onOpenChange={setIsBookingOpen}
          />
        )}

        {/* CTA */}
        {painters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button variant="outline" size="lg" asChild>
              <Link to="/painters" className="gap-2">
                View All Painters
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
