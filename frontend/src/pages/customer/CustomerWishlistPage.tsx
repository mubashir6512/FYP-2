import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardComponents";
import { Heart } from "lucide-react";

export default function CustomerWishlistPage() {
    return (
        <DashboardLayout role="customer">
            <PageHeader
                title="My Wishlist"
                description="Save products you love for later."
            />
            <EmptyState
                icon={Heart}
                title="Your Wishlist is Empty"
                description="Browse our catalog and heart your favorite items to see them here."
            />
        </DashboardLayout>
    );
}
