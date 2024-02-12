"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import qs from "query-string";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const SearchInput = () => {

    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentCategoryId = searchParams.get("categoryId");

    useEffect(() => {
       const url = qs.stringifyUrl({
           url: pathname,
           query: {
               categoryId: currentCategoryId,
               title: debouncedValue,
           }
       },{ skipNull: true, skipEmptyString: true })
       router.push(url);
    },[debouncedValue, currentCategoryId, pathname, router]);

    return (
        <div className="relative">
            <Search 
            className="h-4 w-4 absolute top-3 left-3 text-slate-600"
            />
            <Input 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
            placeholder="Search for a course..."
            />
        </div>
    )
}