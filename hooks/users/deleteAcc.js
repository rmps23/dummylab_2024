import { supabase } from "@/supabase";
import { useRouter } from "next/navigation";


export async function deleteAcc(user_id) {

    const { data, error } = await supabase.auth.admin.deleteUser(
        user_id
    )

    if (error) {
        console.error("Error fetching user data:", error.message);
        return null;
    } else {
        router.push("/");
    }

}
