import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";
import { Button, Input } from "../../components/ui";
import { Spinner } from "../../components/ui";
import { useBooking } from "../../hooks/useBooking";
import { useAuthStore } from "../../store/authStore";
import type { ApiError } from "../../types";
import type { AxiosError } from "axios";

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Please enter at least 10 characters").max(1000),
});

type FormData = z.infer<typeof schema>;

export default function ReviewFormPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(id!);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const bookingGuestId = booking?.guest?.id;

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => api.post("/reviews", {
      bookingId: id,
      type: bookingGuestId === user?.id ? "guest_to_host" : "host_to_guest",
      rating: data.rating,
      categories: {},
      comment: data.comment,
    }),
    onSuccess: () => {
      navigate(`/bookings/${id}`, { replace: true });
    },
  });

  const apiError = (error as AxiosError<ApiError>)?.response?.data?.message;

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  if (!booking) {
    return <div className="text-center py-32 text-gray-400">Booking not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Leave a review</h1>
        <p className="text-gray-500 mt-1">Share your experience for {booking.listing?.title ?? "this stay"}.</p>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="mt-6 space-y-4">
          {apiError && (
            <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{apiError}</p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            <input
              type="number"
              min={1}
              max={5}
              {...register("rating", { valueAsNumber: true })}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {errors.rating && <p className="text-sm text-rose-500 mt-1">{errors.rating.message}</p>}
          </label>

          <Input
            label="Comment"
            as="textarea"
            rows={5}
            {...register("comment")}
            error={errors.comment?.message}
          />

          <div className="flex gap-3">
            <Button type="submit" loading={isPending}>Submit review</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
