import { supabase } from "../../../../lib/supabase";
import AreaListComponent from "../../../../components/AreaListComponent";
import serverUserFetcher from "../../../../lib/ServerUserFetcher";

export default async function Page() {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("AreaMaster").select();
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

      if (error) throw error;
      return user;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  const lists = await fetchData();
  const users = await fetchUser();

  return (
    <div className="w-full h-screen">
      <AreaListComponent lists={lists} user={users} />
    </div>
  );
}
