"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFormProps {
    initialData: {
        description: string;
    };
    courseId: string;
};

const fromSchema = z.object({
    description: z.string().min(1, { message: 'Description is required' }),
})

export const DescriptionForm = ({
    initialData,
    courseId,
}: DescriptionFormProps) => {

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const from = useForm<z.infer<typeof fromSchema>>({
        resolver: zodResolver(fromSchema),
        defaultValues: initialData
    });

    const { isSubmitting, isValid } = from.formState;

    const onSubmit = async (values: z.infer<typeof fromSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success('Course Description updated');
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error('Something went wrong');
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course Description
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Description
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn("text-sm mt-2",!initialData.description && "text-slate-500 italic")}>
                    {initialData.description || "No description"}
                </p>
            )}
            {isEditing && (
                <Form {...from}>
                    <form
                        onSubmit={from.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <FormField 
                        control={from.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                
                                <FormControl>
                                    <Textarea
                                    disabled={isSubmitting} 
                                    placeholder="e.g. 'This course is about...'"
                                    {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button
                            disabled={!isValid || isSubmitting}
                            type="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}