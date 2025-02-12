import { supabase } from "../../../../lib/supabase";
import CalibrationListComponent from "../../../../components/CalibrationListComponent";
import serverUserFetcher from "../../../../lib/ServerUserFetcher";

export default async function Page() {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("EqpMaster")
        .select()
        .order("eqpid", { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching equipment data:", err);
      return null;
    }
  };
  const fetchUser = async () => {
    try {
      const { user, error } = await serverUserFetcher();
      const { data, errorx } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      if (errorx) throw errorx;
      return { user, data };
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  const lists = await fetchData();
  const users = await fetchUser();

  return (
    <div className="w-full h-screen">
      <CalibrationListComponent lists={lists} user={users} />
    </div>
  );
}
