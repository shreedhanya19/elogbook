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

const ClientListComponent = ({ lists, user }) => {
  const [listsx, setLists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    rejection_reason: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLists(lists);
        setUsers(user);
        if (error) {
          throw error;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", lists[0].tag_id)
          .eq("activity_status", "Completed")
          .eq("approval_status", "Pending");

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
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", lists[selected].tag_id)
          .eq("activity_status", "Completed")
          .eq("approval_status", "Pending");

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
  }, [selected]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .select("*")
        .eq("linked_eqp", lists[0].tag_id)
        .eq("activity_status", "Completed")
        .eq("approval_status", "Pending");

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClick = (index) => {
    setSelected(index);
  };

  const handleApprove = async (value) => {
    console.log("Function received:", value);
    try {
      const myId = await selectedActivity;
      if (value === "Approved") {
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
        setApproveOpen(false);
      } else {
        const { data, error } = await supabase
          .from("production_activities") // Replace with your table name
          .update({
            rejected_by: users.email,
            rejected_at: getCurrentTime(),
            rejected_reason: formData.rejection_reason,
            approval_status: value,
            updated_at: getCurrentTime(),
            updated_by: users.email,
          })
          .eq("id", selectedActivity.id);

        if (error) {
          throw error;
        }
        setRejectOpen(false);
      }
      fetchActivities();
    } catch (err) {
      console.error(err.message);
    } finally {
    }
  };

  return (
    <div className="overflow-auto">
      {/* Left Section: 25% Width */}
      <div className="flex w-full h-screen ">
        <div className="w-1/4 h-full p-3">
          <div className="w-full h-full overflow-y-auto max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
            <div className=" flex items-center justify-between mb-4 ">
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                Equipment List
              </h5>
            </div>
            <div className="flow-root">
              <ul
                role="list"
                className="divide-y divide-gray-200 dark:divide-gray-700"
              >
                {lists.map((list, index) => (
                  <li
                    key={index}
                    className="py-3 sm:py-4 cursor-pointer"
                    onClick={() => handleClick(index)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Shapes
                          color={selected === index ? "black" : "#A9A9A9"}
                          size={24}
                        />
                      </div>
                      <div className="flex-1 min-w-0 ms-4">
                        <p
                          className={`text-sm ${selected === index ? "font-bold" : "font-medium"} text-gray-900 truncate dark:text-white`}
                        >
                          {list.eqp_name}
                        </p>
                        <p
                          className={`text-sm ${selected === index ? "font-bold" : "font-medium"} text-gray-500 truncate dark:text-gray-400`}
                        >
                          {list.tag_id}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        <ChevronRight
                          color={selected === index ? "black" : "#A9A9A9"}
                          size={24}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section: 75% Width */}
        <div className="flex flex-col w-3/4 h-full overflow-auto">
          <div className="flex-1 m-3 p-3 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Equipment Details
            </h5>
            <div className="grid grid-cols-2 grid-rows-2 justify-start align-middle mt-3 border-b-2 pb-6">
              <div className="p-2">
                Equipment Name :{" "}
                <b> {selected !== null && lists[selected].eqp_name}</b>
              </div>

              <div className="p-2">
                Equipment ID :{" "}
                <b>{selected !== null && lists[selected].tag_id}</b>
              </div>
              <div className="p-2">
                Location :{" "}
                <b>{selected !== null && lists[selected].location}</b>
              </div>
              <div className="p-2">
                Make / Model :{" "}
                <b>
                  {selected !== null &&
                    lists[selected].make + " / " + lists[selected].model}
                </b>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <h4 className="text-xl font-bold leading-none text-gray-900 dark:text-white mt-6 mb-6">
                Pending Approval
              </h4>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Activity ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Activity Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Started By
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Start Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Activity Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Approve
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Reject
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
                        <td className="px-6 py-4">{act.id}</td>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {act.activity_name}
                        </th>
                        <td className="px-6 py-4">{act.performed_by}</td>
                        <td className="px-6 py-4">{act.start_time}</td>
                        <td className="px-6 py-4">{act.activity_status}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedActivity(activity[index]);
                              setApproveOpen(true);
                            }}
                            className="focus:outline-none w-full h-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-3 py-2  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-900"
                          >
                            Approve
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedActivity(activity[index]);
                              setRejectOpen(true);
                            }}
                            className="text-center align-middle focus:outline-none w-full h-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-3 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Approve Modal */}
      <Dialog
        open={approveOpen}
        onClose={setApproveOpen}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-40 text-center ">
            <DialogPanel
              transition
              className=" w-full relative transform overflow rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 dark:bg-zinc-900">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900 w-full dark:text-white"
                    >
                      Approving Activity for {lists[selected].eqp_name}
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
                  type="button"
                  data-autofocus
                  onClick={() => setApproveOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      {/* Reject Modal */}
      <Dialog
        open={rejectOpen}
        onClose={setRejectOpen}
        className="relative z-10"
      >
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
                      Approving Activity for {lists[selected].eqp_name}
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
                          <div className="col-span-2">
                            <label className="block mb-2 text-sm font-bold text-red-900 dark:text-white">
                              Rejection Reason
                            </label>
                            <input
                              type="text"
                              name="rejection_reason"
                              onChange={handleInputChange}
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
                  onClick={() => handleApprove("Rejected")}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Reject Activity
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setRejectOpen(false)}
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

export default ClientListComponent;
