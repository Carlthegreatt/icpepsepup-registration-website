"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventForm } from '@/hooks/event/use-event-form';
import { AdminNavbar } from '@/components/admin/admin-navbar';
import BokehBackground from '@/components/create-event/bokeh-background';
import Squares from '@/components/create-event/squares-background';
import EventForm from '@/components/create-event/EventForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUserStore } from '@/store/useUserStore';

export default function CreateEventPage() {
  const router = useRouter();
  const { userId, loading, initialize } = useUserStore();
  const {
    formData,
    updateField,
    addQuestion,
    removeQuestion,
    updateQuestion,
  } = useEventForm();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !userId) {
      router.replace('/?next=/create-event');
    }
  }, [loading, userId, router]);

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Don't render form if not authenticated (will redirect)
  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1f14] via-[#0a1520] to-[#120c08] text-white-100 relative isolate font-urbanist flex flex-col">
      <BokehBackground />
      <Squares direction="diagonal" speed={0.3} />

      <AdminNavbar activeTab="create-event" />

      <main className="flex-1 w-full max-w-[1600px] mx-auto relative z-10 px-4 sm:px-6 md:px-12 py-6 md:py-8 mt-16">
        <div className="w-full py-4 md:py-8">
          <EventForm
            formData={formData}
            updateField={updateField}
            addQuestion={addQuestion}
            removeQuestion={removeQuestion}
            updateQuestion={updateQuestion}
          />
        </div>
      </main>
    </div>
  );
}
