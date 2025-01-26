"use client";
import { use, useEffect, useState } from "react";

import { ChevronRight, Shapes } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const AuditTrailComponent = ({ equipment, user }) => {
  const [equipments, setEquipments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const [activity, setActivity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const router = useRouter();

  const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  function getDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0"); // Get day with leading zero
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getTimeFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours(); // Get the hours (0-23)
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Get minutes with leading zero
    const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
    hours = hours % 12 || 12; // Convert 0-23 hours to 1-12
    return `${hours}:${minutes} ${ampm}`;
  }

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", equipment[0].tag_id)
          .order("start_time", { ascending: false });

        if (error) {
          throw error;
        }
        if (data.length == 0) setActivity(undefined);
        else setActivity(data);
      } catch (err) {
        console.error("Error fetching activities:", err);
        return null;
      }
    };
    fetchActivities();
    const fetchData = async () => {
      try {
        setEquipments(equipment);

        if (error) {
          throw error;
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        return null;
      }
    };
    fetchData();
  }, []);

  //   const fetchActivities = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from("production_activities")
  //         .select("*")
  //         .eq("linked_eqp", lists[0].tag_id)
  //         .eq("activity_status", "Completed")
  //         .eq("approval_status", "Pending");

  //       if (error) {
  //         throw error;
  //       }
  //       if (data.length == 0) setActivity(undefined);
  //       else setActivity(data);
  //     } catch (err) {
  //       console.error("Error fetching activities:", err);
  //       return null;
  //     }
  //   };

  const handleClick = (index) => {
    setSelected(index);
  };

  const handleApprove = async (value) => {
    console.log("Function received:", value);
    try {
      const myId = await selectedActivity;
      const { data, error } = await supabase
        .from("production_activities") // Replace with your table name
        .update({
          approved_by: users.email,
          approved_at: getCurrentTime(),
          approval_status: value,
          updated_at: getCurrentTime(),
          updated_by: users.email,
        })
        .eq("id", selectedActivity.id);

      if (error) {
        throw error;
      }
      setOpen(false);
      fetchActivities();
    } catch (err) {
      console.error(err.message);
    } finally {
    }
  };

  return (
    <div className="overflow-auto">
      <div className="flex w-full h-screen ">
        {/* Right Section: 75% Width */}
        <div className="flex flex-col w-full h-full overflow-auto">
          <div className="flex-1 m-3 p-3 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Equipment Details
            </h5>
            <div className="grid grid-cols-2 grid-rows-2 justify-start align-middle mt-3 border-b-2 pb-6">
              <div className="p-2">
                Equipment Name :{" "}
                <b> {!equipments ? "..." : equipments[0].eqp_name}</b>
              </div>

              <div className="p-2">
                Equipment ID :{" "}
                <b>{!equipments ? "..." : equipments[0].tag_id}</b>
              </div>
              <div className="p-2">
                Location : <b>{!equipments ? "..." : equipments[0].location}</b>
              </div>
              <div className="p-2">
                Make / Model :{" "}
                <b>
                  {!equipments
                    ? "..."
                    : equipments[0].make + " / " + equipments[0].model}
                </b>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <div className="flex items-center justify-start">
                <h4 className="text-xl font-bold leading-none text-gray-900 dark:text-white mt-6 mb-6 w-1/4">
                  Audit Trail
                </h4>
                <div className="">Filter By </div>
              </div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Product / Protocol Name
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Batch / Protocol No
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Activity Name
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Start Date & Time
                    </th>
                    <th scope="col" className="px-2 py-3">
                      End Date & Time
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Activity Status
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Started By
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Reviewed By
                    </th>
                    <th scope="col" className="px-2 py-3">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!activity ? (
                    <tr>
                      <td colSpan="7" className="py-5 px-4 text-center">
                        No pending activities
                      </td>
                    </tr>
                  ) : (
                    activity.map((act, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-2 py-4">
                          {getDateFromTimestamp(act.start_time)}
                        </td>
                        <td className="px-2 py-3">{act.product_name}</td>
                        <td className="px-2 py-3">{act.batch_no}</td>
                        <td className="px-2 py-3">{act.activity_name}</td>
                        <td className="px-2 py-3">
                          {getTimeFromTimestamp(act.start_time)}
                        </td>
                        <td className="px-2 py-3">
                          {!act.end_time
                            ? ""
                            : getTimeFromTimestamp(act.end_time)}
                        </td>
                        <td className="px-2 py-3">{act.activity_status}</td>
                        <td className="px-2 py-3">{act.performed_by}</td>
                        <td className="px-2 py-3">{act.approved_by}</td>
                        <td className="px-2 py-3">{act.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-40 text-center ">
            <DialogPanel
              transition
              className=" w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 dark:bg-zinc-900">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900 w-full dark:text-white"
                    >
                      Approving Activity for{" "}
                      {!equipments ? "..." : equipments[0].eqp_name}
                    </DialogTitle>
                    <div className="mt-6 w-full  ">
                      <form className="w-full">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Product Name / Protocol Name
                            </label>
                            <input
                              type="text"
                              name="product_name"
                              id="name"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.product_name
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Batch No / Protocol No
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.batch_no
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Activity Name
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.activity_name
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Performed By
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.performed_by
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Start Date & Time
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.start_time
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              End Date & Time
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.end_time
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Remarks
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                !selectedActivity
                                  ? "..."
                                  : selectedActivity.remarks
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-zinc-900">
                <button
                  type="submit"
                  onClick={() => handleApprove("Approved")}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >
                  Approve Activity
                </button>
                <button
                  type="submit"
                  onClick={() => handleApprove("Rejected")}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Reject Activity
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AuditTrailComponent;
