import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, Clock, MapPin, 
  ChevronLeft, ChevronRight, User, Loader2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function PainterSchedulePage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["painter-schedule", user?.id],
    queryFn: () => api("/painters"),
    enabled: !!user,
  });

  const activeJobs = jobs.filter((j: any) => j.status === "accepted");

  // Simple calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getJobsForDay = (day: number) => {
    return activeJobs.filter((j: any) => {
      const jobDate = new Date(j.scheduledDate);
      return jobDate.getDate() === day && 
             jobDate.getMonth() === currentDate.getMonth() && 
             jobDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <DashboardLayout role="painter">
      <PageHeader 
        title="My Schedule" 
        description="Plan your week and manage upcoming appointments."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent" />
                {monthName} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="bg-muted/50 p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
              {padding.map(i => (
                <div key={`p-${i}`} className="bg-background h-24 sm:h-32" />
              ))}
              {days.map(day => {
                const dayJobs = getJobsForDay(day);
                const isToday = day === new Date().getDate() && 
                                currentDate.getMonth() === new Date().getMonth() && 
                                currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={day} className={cn(
                    "bg-background h-24 sm:h-32 p-2 border-t border-l border-border transition-colors hover:bg-muted/10",
                    isToday && "bg-accent/5 ring-1 ring-inset ring-accent/20"
                  )}>
                    <span className={cn(
                      "text-sm font-medium",
                      isToday ? "w-7 h-7 flex items-center justify-center rounded-full bg-accent text-white" : "text-muted-foreground"
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayJobs.map((j: any) => (
                        <div 
                          key={j.id} 
                          className="text-[10px] p-1 rounded bg-info/10 text-info border border-info/20 truncate font-medium"
                          title={j.customerName}
                        >
                          {j.jobType} - {j.customerName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming List */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Next 7 Days
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm italic">No upcoming jobs scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.slice(0, 5).map((job: any) => (
                    <div key={job.id} className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="info" className="text-[10px]">{job.jobType}</Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(job.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="font-bold text-sm mb-1">{job.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="outline" className="w-full mt-6 text-xs uppercase font-bold tracking-widest h-11">
                Sync with Google Calendar
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated" className="bg-accent text-white border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold">Pro Tip</h4>
                  <p className="text-xs text-white/80">Schedule gaps between jobs</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Allow at least 2 hours between jobs for travel and preparation to maintain your 5-star rating.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Star } from "lucide-react";
