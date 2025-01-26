import { createClient } from "../lib/supabase";

async function getActivities(equipmentId) {
  const supabase = createClient();

  const { data: activities, error } = await supabase
    .from("production_activities")
    .select("*")
    .eq("linked_eqp", equipmentId);

  if (error) {
    throw new Error("Failed to fetch activities");
  }

  return activities;
}

export async function Activities({ equipmentId }) {
  const activities = await getActivities(equipmentId);

  if (!activities.length) {
    return <div className="p-4">No activities found for this equipment.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Description</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b">
              <td className="py-3 px-4">{activity.activity_name}</td>
              <td className="py-3 px-4">{activity.start_date}</td>
              {/* Add more cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
