import { Activity } from "lucide-react";
import { supabase } from "../../../../../lib/supabase";
import { ActivityDetails } from "../../../../../components/ActivityDetails";
import serverUserFetcher from "../../../../../lib/ServerUserFetcher";
export default async function getDetails({ params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("production_activities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching details:", error);
    return <div>Error fetching details</div>;
  }

  const fetchUser = async () => {
    try {
      const { user, error } = await serverUserFetcher();

      if (error) throw error;
      return user;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  const users = await fetchUser();

  return <ActivityDetails activity={data} users={users} />;
}
