"use client";

import { useEffect, useState } from "react";
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
  const [activityStatus, setActivityStatus] = useState(
    activity.activity_status
  );
  const [formData, setFormData] = useState({
    remarks: "",
  });
  const [hasSubTasks, setHasSubTasks] = useState(false);
  const [subTasks, setSubTasks] = useState([]);
  const [insertedSubTask, setInsertedSubTask] = useState();
  const [currentSubTask, setCurrentSubTask] = useState();

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

  useEffect(() => {
    async function fetchSubTasks() {
      const { data, error } = await supabase
        .from("sub_steps")
        .select("*")
        .eq("parent_activity", activity.activity_name);

      if (error) {
        console.error("Error fetching sub tasks:", error);
      } else {
        if (data.length === 0) {
          setHasSubTasks(false);
          return;
        }
        console.log(data[0].child_activities);
        setHasSubTasks(true);
        setSubTasks(data[0].child_activities);
      }
    }
    fetchSubTasks();
    async function fetchSubTaskInProcess() {
      const { data, error } = await supabase
        .from("production_activities")
        .select(`subtask_inprocess,sub_steps_tracker(*)`)
        .eq("id", activity.id);
      if (error) {
        console.error("Error fetching sub task in process:", error);
      } else {
        setCurrentSubTask(data[0].sub_steps_tracker);
      }
    }
    fetchSubTaskInProcess();
  }, []);

  async function fetchSubTaskInProcess() {
    const { data, error } = await supabase
      .from("production_activities")
      .select(`subtask_inprocess,sub_steps_tracker(*)`)
      .eq("id", activity.id);
    if (error) {
      console.error("Error fetching sub task in process:", error);
    } else {
      setCurrentSubTask(data[0].sub_steps_tracker);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    async function fetchEquipmentName() {
      const { data, error } = await supabase
        .from("EqpMaster")
        .select("eqp_name,tag_id")
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

  const handleSubStart = async (step, index) => {
    try {
      const { data, error } = await supabase
        .from("sub_steps_tracker")
        .insert({
          start_time: getCurrentTime(),
          parent_activity: activity.activity_name,
          child_activity: step,
          linked_eqp: activity.linked_eqp,
          index_of_sub_step: index,
        })
        .select();
      setInsertedSubTask(data);
      const { error2 } = await supabase
        .from("production_activities")
        .update({
          subtask_inprocess: data[0].id,
        })
        .eq("id", activity.id);
      if (error) {
        throw error;
      }
      if (error2) {
        throw error2;
      }
      if (index < subTasks.length) setCurrentSubTask(data[0]);
      else setCurrentSubTask(null);
      console.log(insertedSubTask);
    } catch {
      if (error) {
        console.error("Error starting sub task:", error);
      }
      if (error2) {
        console.error("Error updating sub task:", error2);
      }
    }
  };

  const handleSubStop = async (step, index) => {
    try {
      const { error } = await supabase
        .from("sub_steps_tracker")
        .update({
          end_time: getCurrentTime(),
        })
        .eq("id", currentSubTask.id);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error stopping sub task:", error);
    }
    if (index + 1 < subTasks.length)
      handleSubStart(subTasks[index + 1].step, index + 1);
    else {
      setCurrentSubTask({ index_of_sub_step: index + 1 });
      setOpen(true);
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
                {activityStatus === "In Progress"
                  ? timeElapsed
                  : activity.time_elapsed}
              </div>
              {activityStatus === "In Progress" ? (
                <div className="flex flex-col gap-2 mt-5">
                  <button
                    onClick={() => setOpen(true)}
                    className="text-white w-full h-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Complete Activity
                  </button>
                  <button
                    onClick={() => setOpenPauseModal(true)}
                    className="focus:outline-none w-full h-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
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
          {hasSubTasks ? (
            <div className=" items-start">
              <div className="px-12">
                <p className="pb-8 font-medium text-gray-900 dark:text-white">
                  Activity Order for {equipmentName.eqp_name}
                </p>
                <ol className=" relative text-gray-800 border-s-2 border-gray-300 dark:border-gray-700 dark:text-gray-400">
                  {subTasks.map((task, index) => (
                    <li key={index} className="mb-10 ms-6">
                      {currentSubTask != null &&
                      index <= currentSubTask.index_of_sub_step ? (
                        <span className="absolute flex items-center justify-center w-10 h-10 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                          <svg
                            className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 12"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M1 5.917 5.724 10.5 15 1.5"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="absolute flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                          <svg
                            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 18 20"
                          >
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                          </svg>
                        </span>
                      )}

                      <div className="ml-4">
                        <h3 className=" font-medium leading-tight pt-1.5 pl-2">
                          {task.step}
                        </h3>

                        <p className="text-sm font-normal leading-tight pt-1.5 pl-2">
                          {task.description}
                        </p>
                        <button
                          disabled={
                            (currentSubTask != null &&
                              index > currentSubTask.index_of_sub_step) ||
                            currentSubTask == null
                              ? false
                              : true
                          }
                          onClick={() => handleSubStart(task.step, index)}
                          className={`py-2 px-4  text-sm font-semibold text-gray-900 rounded-full mt-3 ${(currentSubTask != null && index > currentSubTask.index_of_sub_step) || currentSubTask == null ? "bg-green-300" : " cursor-not-allowed bg-gray-300 "}`}
                        >
                          Start
                        </button>
                        <button
                          disabled={
                            (currentSubTask != null &&
                              index >= currentSubTask.index_of_sub_step) ||
                            currentSubTask == null
                              ? false
                              : true
                          }
                          onClick={() => handleSubStop(task.step, index)}
                          className={`py-2 ml-4 px-4  text-sm font-semibold text-gray-900 rounded-full mt-3 ${(currentSubTask != null && index >= currentSubTask.index_of_sub_step) || currentSubTask == null ? (currentSubTask != null && currentSubTask.index_of_sub_step === subTasks.length - 1 && currentSubTask.end_time != null ? "cursor-not-allowed bg-gray-300" : "bg-red-300") : " cursor-not-allowed bg-gray-300 "}`}
                        >
                          Stop
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                      for{" "}
                      {equipmentName.eqp_name
                        ? equipmentName.eqp_name + " / " + equipmentName.tag_id
                        : "Loading..."}
                    </p>
                    <div className="mt-6 w-full">
                      <form className="w-full">
                        <div className="grid gap-4 mb-4">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              End Date & Time
                            </label>
                            <input
                              type="text"
                              name="product_name"
                              id="name"
                              value={getCurrentTime()}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type product name"
                              required
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Time Elapsed
                            </label>
                            <input
                              type="text"
                              name="batch_no"
                              id="brand"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type batch number"
                              required
                              value={timeElapsed}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Performed By
                            </label>
                            <input
                              type="text"
                              name="performed_by"
                              id="performedBy"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                              required=""
                              value={activity.performed_by}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Remarks
                            </label>
                            <input
                              type="text"
                              name="remarks"
                              onChange={handleInputChange}
                              id="remarks"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
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
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >
                  Complete Activity
                </button>
                <button
                  onClick={() => setOpen(false)}
                  data-autofocus
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                      for{" "}
                      {equipmentName.eqp_name
                        ? equipmentName.eqp_name + " / " + equipmentName.tag_id
                        : "Loading..."}
                    </p>
                    <div className="mt-6 w-full">
                      <form className="w-full">
                        <div className="grid gap-4 mb-4">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Pause Date & Time
                            </label>
                            <input
                              type="text"
                              name="product_name"
                              id="name"
                              value={getCurrentTime()}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type product name"
                              required
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Time Elapsed
                            </label>
                            <input
                              type="text"
                              name="batch_no"
                              id="brand"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Type batch number"
                              required
                              value={timeElapsed}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Paused By
                            </label>
                            <input
                              type="text"
                              name="performed_by"
                              id="performedBy"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
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
                  className="inline-flex w-full justify-center rounded-md text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium  text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 sm:ml-3 sm:w-auto"
                >
                  Pause Activity
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpenPauseModal(false)}
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
}
