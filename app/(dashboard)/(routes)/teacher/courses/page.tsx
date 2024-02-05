import { Button } from "@/components/ui/button";
import Link from "next/link";

const CoursesPage = () => {
    return ( <div>
        <Link href="/teacher/create">
        <Button className="p-6">
            New Course
        </Button>
        </Link>
    </div> );
}
 
export default CoursesPage;