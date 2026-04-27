import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, MessageSquare, Award, TrendingUp, 
  User, Calendar, Loader2, AlertTriangle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function PainterReviewsPage() {
  const { user } = useAuth();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["painter-reviews", user?.id],
    queryFn: () => api("/painters/reviews"),
    enabled: !!user,
  });

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <DashboardLayout role="painter">
      <PageHeader 
        title="Ratings & Reviews" 
        description="See what customers are saying about your work and grow your reputation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Average Rating" 
          value={avgRating.toFixed(1)} 
          icon={Star} 
          iconColor="text-warning"
        />
        <StatCard 
          title="Total Reviews" 
          value={reviews.length} 
          icon={MessageSquare} 
          iconColor="text-info"
        />
        <StatCard 
          title="Positive Feedback" 
          value={`${Math.round(ratingCounts.find(r => r.star === 5)?.percentage || 0 + (ratingCounts.find(r => r.star === 4)?.percentage || 0))}%`} 
          icon={TrendingUp} 
          iconColor="text-success"
        />
        <StatCard 
          title="Excellence Badges" 
          value="4" 
          icon={Award} 
          iconColor="text-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Distribution */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-bold">{star}</span>
                  <Star className="w-3 h-3 fill-warning text-warning" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-warning transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
              </div>
            ))}
            <div className="pt-6 border-t border-border mt-6">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Ratings are verified and calculated based on your last 12 months of activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            Recent Feedback
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-2" />
              <p className="text-muted-foreground">Error loading reviews</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic">No reviews yet. Complete jobs to start receiving feedback!</p>
            </div>
          ) : (
            reviews.map((review: any, index: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {(review.customerName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{review.customerName || "Verified Customer"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-xl italic">
                        "{review.comment}"
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No comment provided.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
