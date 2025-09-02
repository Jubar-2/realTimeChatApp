import type { signInSchema } from "@/schema/Sign-in";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import type { Control } from "react-hook-form";
import type z from "zod";

// type SignInFormValues = {
//     identifier: string;
//     password: string;
// };

type SignInFormValues = z.infer<typeof signInSchema>;

interface props {
    control: Control<SignInFormValues, any, SignInFormValues>;
    name: keyof SignInFormValues,
    type: string,
    label: string,
    placeholder: string
}

function SignInFormField({ control, name, type, label, placeholder }: props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={type} placeholder={placeholder} {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default SignInFormField