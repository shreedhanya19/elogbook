"use client";

import { act, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRouter } from "next/navigation";

export function ActivityDetails({ activity, users }) {
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
  const [open, setOpen] = useState(false);
  const [openPauseModal, setOpenPauseModal] = useState(false);
  const [activityStatus, setActivityStatus] = useState(activity);
  const [formData, setFormData] = useState({
    remarks: "",
  });
  const [stHold, setStHold] = useState({ start: null, end: null });

  const getFutureTimestamp = (hours) => {
    // Get future timestamp in hours
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, "0");
    const day = String(future.getDate()).padStart(2, "0");
    const hoursx = String(future.getHours()).padStart(2, "0");
    const minutes = String(future.getMinutes()).padStart(2, "0");
    const seconds = String(future.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hoursx}:${minutes}:${seconds}`;
  };

  function calculateTimeElapsed(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = now - start;

    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m `;
  }

  const [timeElapsed, setTimeElapsed] = useState(
    calculateTimeElapsed(activity.start_time)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    setStHold({
      start: activity.sterilization_hold_start,
      end: activity.sterilization_hold_end,
    });
  }, []);

  useEffect(() => {
    async function fetchEquipmentName() {
      const { data, error } = await supabase
        .from("EqpMaster")
        .select("*")
        .eq("tag_id", activity.linked_eqp)
        .single();

      if (error) {
        console.error("Error fetching equipment name:", error);
      } else {
        setEquipmentName(data);
      }
    }

    fetchEquipmentName();
  }, [activity.tag_id]);

  const [equipmentName, setEquipmentName] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(calculateTimeElapsed(activity.start_time));
    }, 1000);

    return () => clearInterval(interval);
  }, [activity.start_time]);

  const handleComplete = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("production_activities")
        .update({
          activity_status: "Completed",
          end_time: getCurrentTime(),
          completed_by: users.email,
          updated_at: getCurrentTime(),
          updated_by: users.email,
          remarks: formData.remarks,
          // hold_expiry: getFutureTimestamp(
          //   equipmentName.activity_order[
          //     equipmentName.activity_order.findIndex(
          //       (activityq) => activityq.name === activityStatus.activity_name
          //     )
          //   ].hold
          // ),
          time_elapsed: calculateTimeElapsed(activity.start_time),
        })
        .eq("id", activity.id);
      console.log(data);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error completing activity:", error);
    }
    router.push("/protected/production");
  };

  const handleStHoldStart = async () => {
    setStHold((prev) => ({ ...prev, start: getCurrentTime() }));
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .update({
          sterilization_hold_start: getCurrentTime(),
          updated_at: getCurrentTime(),
          updated_by: users.email,
        })
        .eq("id", activity.id);
      console.log(data);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error starting hold:", error);
    }
  };

  const handleStHoldStop = async () => {
    setStHold((prev) => ({ ...prev, end: getCurrentTime() }));
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .update({
          sterilization_hold_end: getCurrentTime(),
          updated_at: getCurrentTime(),
          updated_by: users.email,
        })
        .eq("id", activity.id);
      console.log(data);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error starting hold:", error);
    }
  };

  return (
    <div>
      <div className="flex w-full h-full gap-4">
        <div className="h-screen lg:w-1/4 px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
          <div>
            <h3 className="text-base/7 font-semibold text-gray-900">
              Time Elapsed
            </h3>
            <div>
              <div className="text-xl text-gray-700 font-semibold pt-3">
                {activityStatus.activity_status === "In Progress"
                  ? timeElapsed
                  : activity.time_elapsed}
              </div>
              {activityStatus.activity_status === "In Progress" ? (
                <div className="flex flex-col gap-2 mt-5">
                  <button
                    onClick={() => {
                      if (
                        activity.linked_eqp === "PR-SS-001" &&
                        (stHold.start === null || stHold.end === null)
                      ) {
                        window.alert(
                          "Please Complete the Sterilization Hold before completing the activity"
                        );
                      } else setOpen(true);
                    }}
                    className="text-white w-full h-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Complete Activity
                  </button>
                  <button
                    onClick={() => setOpenPauseModal(true)}
                    className="focus:outline-none w-full h-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg  px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                  >
                    Pause Activity
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex w-4/4 h-screen overflow-auto lg:w-3/4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
          <div className=" w-1/2 flex-col items-start">
            <div className=" items-start">
              <h3 className=" font-semibold text-gray-900">Activity Details</h3>
            </div>
            <div className="mt-6 border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium text-gray-900">Activity Name</dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {activity.activity_name}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 font-semibold">
                  <dt className=" font-medium text-gray-900">
                    Activity Status
                  </dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0">
                    <span
                      className={
                        activity.activity_status === "In Progress"
                          ? "text-orange-600"
                          : activity.activity_status === "Paused"
                            ? "text-red-600"
                            : activity.activity_status === "Completed"
                              ? "text-green-600"
                              : "text-gray-700"
                      }
                    >
                      {activity.activity_status}
                    </span>
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium text-gray-900">
                    Linked Equipment
                  </dt>
                  <dd className="mt-1 text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {equipmentName.eqp_name
                      ? equipmentName.eqp_name + " / " + equipmentName.tag_id
                      : "Loading..."}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="font-medium text-gray-900">
                    Start Date & Time
                  </dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {activity.start_time}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium text-gray-900">Performed By</dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {activity.performed_by}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium text-gray-900">
                    Product / Protocol Name
                  </dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {activity.product_name}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium text-gray-900">
                    Batch / Protocol Number
                  </dt>
                  <dd className="mt-1  text-gray-700 sm:col-span-2 sm:mt-0 font-semibold">
                    {activity.batch_no}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {/*Sterilization Hold*/}
          {activity.linked_eqp === "PR-SS-001" ? (
            <div className="w-1/2 flex-col items-start">
              <h3 className="text-md font-semibold">Sterilization Hold</h3>
              <div className="mt-3">
                <button
                  onClick={() => handleStHoldStart()}
                  className={`${stHold.start != null ? "bg-gray-300 text-gray-900 " : "bg-green-200 text-green-900"} bg-gray-300 px-6 py-3  font-semibold rounded-full`}
                  disabled={stHold.start != null}
                >
                  Start
                </button>
                <button
                  onClick={() => handleStHoldStop()}
                  className={`${stHold.end != null ? "bg-gray-300 text-gray-900 " : "bg-orange-200 text-orange-900"} bg-gray-300 px-6 py-3 ml-6 font-semibold rounded-full`}
                  disabled={stHold.end != null}
                >
                  Stop
                </button>
              </div>

              <div className="mt-4">
                {stHold.start != null && (
                  <p className="text-green-800 font-semibold">
                    Sterilization Hold Start Time : {stHold.start}
                  </p>
                )}
                {stHold.end != null && (
                  <div>
                    <p className="text-orange-800 font-semibold mt-2">
                      Sterilization Hold End Time : {stHold.end}
                    </p>
                    {/* <p className="text-gray-800 font-semibold mt-2">
                    Time Elapsed :{" "}
                    {calculateTimeElapsed(stHold.start, stHold.end)}
                  </p> */}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Modal for Complete Activity */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center ">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 dark:bg-zinc-900">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900 w-full dark:text-white"
                    >
                      Complete Activity {activity.activity_name}
                    </DialogTitle>
                    <p className=" text-gray-500 dark:text-gray-400 pt-1">
                      for{" "}
                      {equipmentName.eqp_name
                        ? equipmentName.eqp_name + " / " + equipmentName.tag_id
                        : "Loading..."}
                    </p>
                    <div className="mt-6 w-full">
                      <form className="w-full">
                        <div className="grid gap-4 mb-4">
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              End Date & Time
                            </label>
                            <input
                              type="text"
                              name="product_name"
                              id="name"
                              value={getCurrentTime()}
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type product name"
                              required
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Time Elapsed
                            </label>
                            <input
                              type="text"
                              name="batch_no"
                              id="brand"
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type batch number"
                              required
                              value={timeElapsed}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Performed By
                            </label>
                            <input
                              type="text"
                              name="performed_by"
                              id="performedBy"
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                              required=""
                              value={activity.performed_by}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Remarks
                            </label>
                            <input
                              type="text"
                              name="remarks"
                              onChange={handleInputChange}
                              id="remarks"
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
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
                  onClick={handleComplete}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2  font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >
                  Complete Activity
                </button>
                <button
                  onClick={() => setOpen(false)}
                  data-autofocus
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      {/* Modal for Pause Activity */}
      <Dialog
        open={openPauseModal}
        onClose={setOpenPauseModal}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center ">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 dark:bg-zinc-900">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900 w-full dark:text-white"
                    >
                      Pause Activity - {activity.activity_name}
                    </DialogTitle>
                    <p className=" text-gray-500 dark:text-gray-400 pt-1">
                      for{" "}
                      {equipmentName.eqp_name
                        ? equipmentName.eqp_name + " / " + equipmentName.tag_id
                        : "Loading..."}
                    </p>
                    <div className="mt-6 w-full">
                      <form className="w-full">
                        <div className="grid gap-4 mb-4">
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Pause Date & Time
                            </label>
                            <input
                              type="text"
                              name="product_name"
                              id="name"
                              value={getCurrentTime()}
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type product name"
                              required
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Time Elapsed
                            </label>
                            <input
                              type="text"
                              name="batch_no"
                              id="brand"
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type batch number"
                              required
                              value={timeElapsed}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                              Paused By
                            </label>
                            <input
                              type="text"
                              name="performed_by"
                              id="performedBy"
                              className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                              required=""
                              value={users.email}
                              readOnly
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
                  className="inline-flex w-full justify-center rounded-md text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium   px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 sm:ml-3 sm:w-auto"
                >
                  Pause Activity
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpenPauseModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
}
