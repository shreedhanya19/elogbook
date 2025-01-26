import { supabase } from "../../../../../lib/supabase";
import AuditTrailComponent from "../../../../../components/AuditTrailComponent";
import serverUserFetcher from "../../../../../lib/ServerUserFetcher";

export default async function EquipmentAudit({ params }) {
  const { id } = await params;

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("EqpMaster")
        .select("*")
        .eq("eqpid", id);

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
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

  const equipment = await fetchData();
  const user = await fetchUser();

  return (
    <div className="w-full h-screen">
      <AuditTrailComponent equipment={equipment} user={user} />
    </div>
  );
}
