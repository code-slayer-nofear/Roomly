import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Button, Input } from "../../components/ui";
import type { ApiError } from "../../types";
import type { AxiosError } from "axios";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => api.post("/api/auth/register", data),
    onSuccess: ({ data }) => {
      setAuth(data.token, data.user);
      navigate("/", { replace: true });
    },
  });

  const apiError = (error as AxiosError<ApiError>)?.response?.data?.message;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-500 mb-8">Join Roomly and start exploring</p>

        <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
          {apiError && (
            <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{apiError}</p>
          )}
          <Input label="Full name" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" loading={isPending} className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-500 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
