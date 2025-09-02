import SignInFormField from "@/components/common/SignInFormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSignIn } from "@/helper/auth";
import { signInSchema } from "@/schema/Sign-in";
import useUserStore from "@/store/user.store";
import type { UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type z from "zod";


function SignIn() {
  const { mutate } = useSignIn();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      mutate(data, {
        onError: (error) => {
          console.log(error)
          if (error instanceof AxiosError) {
            toast('Sign in Failed', {
              description: error.response?.data.message,
            });
          }
        },
        onSuccess: (data) => {
          console.log(data.data.data.user)
          setUser(data.data?.data?.user as UserType)
          navigate("/chat");

        },

      });
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Real Time Chat App
          </h1>
          <p className="mb-4">Sign up to start chat your friend and family</p>
        </div>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>


            <SignInFormField
              control={form.control}
              type="text"
              name="identifier"
              label="Email Or Username"
              placeholder="Email Or Username"
            />
            <SignInFormField
              control={form.control}
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
            />

            <Button type="submit" className='w-full' >
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn