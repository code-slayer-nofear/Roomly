import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import { Button, Input } from "../../components/ui";
import type { ApiError } from "../../types";
import type { AxiosError } from "axios";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  avatarUrl: z.string().url("Enter a valid avatar URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      phone: user?.phone ?? "",
      city: user?.address?.city ?? "",
      country: user?.address?.country ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => api.patch("/users/me", {
      name: data.name,
      bio: data.bio,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      address: {
        city: data.city,
        country: data.country,
      },
    }),
    onSuccess: ({ data }) => {
      setUser(data);
      navigate("/profile", { replace: true });
    },
  });

  const apiError = (error as AxiosError<ApiError>)?.response?.data?.message;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Edit profile</h1>
        <p className="text-gray-500 mt-1">Update your public information.</p>

        <form onSubmit={handleSubmit((d) => mutate(d))} className="mt-6 space-y-4">
          {apiError && (
            <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{apiError}</p>
          )}

          <Input label="Full name" {...register("name")} error={errors.name?.message} />
          <Input label="Avatar URL" {...register("avatarUrl")} error={errors.avatarUrl?.message} />
          <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" {...register("city")} error={errors.city?.message} />
            <Input label="Country" {...register("country")} error={errors.country?.message} />
          </div>
          <Input label="Bio" {...register("bio")} error={errors.bio?.message} />

          <div className="flex gap-3">
            <Button type="submit" loading={isPending}>Save changes</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/profile")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
