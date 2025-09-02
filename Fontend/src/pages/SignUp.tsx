import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./../components/ui/button"
import { Form } from "../components/ui/form"
import { Link } from "react-router";
import { signUpSchema } from "@/schema/Sign-up"
import { useSignUp } from "@/helper/auth"
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios"
import SignUpFormField from "@/components/common/SigUpFormField"
import { toast } from "sonner";

function SignUp() {
  const { mutate } = useSignUp();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: ""

    },
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      mutate(data, {
        onError: (error) => {
          if (error instanceof AxiosError) {

            toast('Sign Up Failed', {
              description: error.response?.data.message,
            });
          }

        },
        onSuccess: () => {
          console.log("seucess")
          navigate("/signin");

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

            <SignUpFormField
              control={form.control}
              type="text"
              neme="name"
              label="Full Name"
              placeholder="Full Name"
            />

            <SignUpFormField
              control={form.control}
              type="text"
              neme="username"
              label="User Name"
              placeholder="User name"
            />

            <SignUpFormField
              control={form.control}
              type="email"
              neme="email"
              label="Email"
              placeholder="Email"
            />
            <SignUpFormField
              control={form.control}
              type="password"
              neme="password"
              label="Password"
              placeholder="Password"
            />

            <Button type="submit" className='w-full' >
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link to="/signin" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp