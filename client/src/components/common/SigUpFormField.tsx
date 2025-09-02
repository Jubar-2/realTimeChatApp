import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import type { Control } from "react-hook-form";

type SignUpFormValues = {
    username: string;
    name: string;
    email: string;
    password: string;
};

interface props {
    control: Control<SignUpFormValues, any, SignUpFormValues>;
    neme: keyof SignUpFormValues,
    type: string,
    label: string,
    placeholder: string
}

function SignUpFormField({ control, neme, type, label, placeholder }: props) {
    return (
        <FormField
            control={control}
            name={neme}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={type} placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default SignUpFormField