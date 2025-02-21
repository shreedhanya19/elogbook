"use client";
import { useRef, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import { useRouter } from "next/navigation";

const MixingVessel = ({ eqp, user }) => {
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

  const router = useRouter();
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const menuRef = useRef(null);
  const [mandatoryTasks, setMandatoryTasks] = useState({
    cleaning: false,
    vlt: false,
    bowieDick: false,
  });

  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [activityName, setActivityName] = useState("");
  const [nextSuggestedActivity, setNextSuggestedActivity] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [otherActivityName, setOtherActivityName] = useState("");
  const [missmatchOpen, setMismatchOpen] = useState(false);
  const [latestActivity, setLatestActivity] = useState(null);
  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveConfirmation, setApproveConfirmation] = useState({
    booleanProp: false,
    status: "",
  });
  const [errorStarting, setErrorStarting] = useState({
    booleanProp: false,
    status: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectSubmitted, setRejectSubmitted] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAuditTrailOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNextActivity = (status) => {
    const order = ["cleaning", "vlt", "bowieDick"];

    for (const activity of order) {
      if (!status[activity]) {
        if (activity === "cleaning") {
          return "Cleaning";
        } else if (activity === "vlt") {
          return "VLT";
        } else if (activity === "bowieDick") {
          return "Bowie Dick";
        }
      }
    }

    return null;
  };

  useEffect(() => {
    setSubmitted(false);
    setRejectSubmitted(false);
    // const fetchMandatoryTasks = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from("production_activities")
    //       .select("*")
    //       .eq("linked_eqp", eqp.tag_id)
    //       .or(
    //         "activity_name.eq.Cleaning,activity_name.eq.VLT,activity_name.eq.Bowie Dick"
    //       )
    //       .gte(
    //         "end_time",
    //         new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    //       )
    //       .order("start_time", { ascending: false })
    //       .limit(3);
    //     if (error) {
    //       throw error;
    //     }
    //     console.log(data);
    //     setMandatoryTasks({
    //       cleaning: data.some(
    //         (activity) =>
    //           activity.activity_name === "Cleaning" &&
    //           activity.activity_status === "Completed"
    //       ),
    //       vlt: data.some(
    //         (activity) =>
    //           activity.activity_name === "VLT" &&
    //           activity.activity_status === "Completed"
    //       ),
    //       bowieDick: data.some(
    //         (activity) =>
    //           activity.activity_name === "Bowie Dick" &&
    //           activity.activity_status === "Completed"
    //       ),
    //     });
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // };
    // fetchMandatoryTasks();
    const fetchLatestActivity = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", eqp.tag_id)
          .eq("approval_status", "Pending")
          .order("start_time", { ascending: false })
          .limit(1);
        if (error) {
          throw error;
        }
        setLatestActivity(data[0]);
        if (error) throw error;
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchLatestActivity();
  }, []);

  const fetchLatestActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .select("*")
        .eq("linked_eqp", eqp.tag_id)
        .eq("approval_status", "Pending")
        .order("start_time", { ascending: false })
        .limit(1);
      if (error) {
        throw error;
      }
      setLatestActivity(data[0]);
      if (error) throw error;
    } catch (error) {
      console.log("error", error);
    }
  };

  //   useEffect(() => {
  //     setNextSuggestedActivity(getNextActivity(mandatoryTasks));
  //   }, [mandatoryTasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (
      productName.length === 0 ||
      batchNo.length === 0 ||
      (activityName === "Others" && otherActivityName.length === 0)
    ) {
      console.log("error submitting");
    } else {
      //   if (
      //     nextSuggestedActivity != null &&
      //     nextSuggestedActivity != activityName
      //   ) {
      //     setMismatchOpen(true);
      if (activityName != "Others") {
        try {
          const { data, error } = await supabase
            .from("production_activities") // Replace with your table name
            .insert({
              created_by: user.email,
              activity_name: activityName,
              activity_status: "In Progress",
              start_time: getCurrentTime(),
              product_name: productName,
              batch_no: batchNo,
              performed_by: user.email,
              approval_status: "Pending",
              linked_eqp: eqp.tag_id,
            })
            .select();
          const activityId = data[0]?.id;
          router.push(`./production/activity/${activityId}`);
          if (error) {
            throw error;
          }
        } catch (error) {
          console.log("error", error);
        }
        // Use router.push for redirection
      } else {
        try {
          const { data, error } = await supabase
            .from("production_activities") // Replace with your table name
            .insert({
              created_by: user.email,
              activity_name: otherActivityName,
              activity_status: "In Progress",
              start_time: getCurrentTime(),
              product_name: productName,
              batch_no: batchNo,
              performed_by: user.email,
              approval_status: "Pending",
              linked_eqp: eqp.tag_id,
            })
            .select();
          const activityId = data[0]?.id;
          router.push(`./production/activity/${activityId}`);
          if (error) {
            throw error;
          }
        } catch (error) {
          console.log("error", error);
        }
      }
    }
  };

  const handleApprove = async (e, status) => {
    if (status === "approve") {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .update({
            approval_status: "Approved",
            approved_by: user.email,
            approved_at: getCurrentTime(),
            updated_at: getCurrentTime(),
            updated_by: user.email,
          })
          .eq("id", latestActivity.id);
        if (error) {
          throw error;
        }
        setApproveOpen(false);
        setApproveConfirmation({ booleanProp: true, status: "approved" });
        fetchLatestActivity();
      } catch (error) {
        console.log("error", error);
      }
    } else {
      setApproveOpen(false);
      setRejectedOpen(true);
    }
  };

  const handleReject = async (e) => {
    setRejectSubmitted(true);
    if (rejectionReason.length != 0) {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .update({
            approval_status: "Rejected",
            rejected_by: user.email,
            rejected_at: getCurrentTime(),
            updated_at: getCurrentTime(),
            updated_by: user.email,
            rejected_reason: rejectionReason,
          })
          .eq("id", latestActivity.id);
        if (error) {
          throw error;
        }
        fetchLatestActivity();
        setRejectedOpen(false);
        setApproveConfirmation({ booleanProp: true, status: "rejected" });
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-1 m-3 p-3 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-zinc-900 dark:border-zinc-700">
        <div className="relative justify-end mb-4">
          <button
            id="dropdownMenuIconButton"
            data-dropdown-toggle="dropdownDots"
            className="absolute right-0 items-center p-2  font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            type="button"
            onClick={() => setAuditTrailOpen(true)}
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 4 15"
            >
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>

          <div
            ref={menuRef}
            id="dropdownDots"
            className={`border ${auditTrailOpen ? "" : "hidden"} border-gray-200 shadow-md z-10 absolute right-0 top-10 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 dark:divide-gray-600`}
          >
            <ul
              className="py-2 text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownMenuIconButton"
            >
              <li>
                <a
                  href={`./production/equipment/${eqp.eqpid}`}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  View Audit Trail
                </a>
              </li>
            </ul>
          </div>
        </div>
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          Equipment Details
        </h5>
        <div className="grid grid-cols-2 grid-rows-2 justify-start align-middle mt-3 border-b-2 pb-6">
          <div className="p-2">
            Equipment Name : <b> {eqp.eqp_name}</b>
          </div>

          <div className="p-2">
            Equipment ID : <b>{eqp.tag_id}</b>
          </div>
          <div className="p-2">
            Location : <b>{eqp.location}</b>
          </div>
          <div className="p-2">
            Make / Model : <b>{eqp.make + " / " + eqp.model}</b>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-1 mt-3  justify-center align-middle border-b-2 pb-4">
          <div className="p-2 flex justify-center align-middle ">
            <button
              type="button"
              className="text-blue-900 font-semibold w-full h-full bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-600 rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={() => {
                if (
                  latestActivity &&
                  latestActivity.activity_status === "In Progress"
                ) {
                  setErrorStarting({
                    booleanProp: true,
                    status: "in_progress",
                  });
                } else if (
                  latestActivity &&
                  latestActivity.approval_status === "Pending"
                ) {
                  setErrorStarting({
                    booleanProp: true,
                    status: "pending_approval",
                  });
                } else {
                  setOpen(true);
                }
              }}
            >
              Start Activity
            </button>
          </div>
          <div className="p-2 flex justify-center align-middle">
            <button
              type="button"
              className="focus:outline-none font-semibold w-full h-full text-red-900 bg-red-200 hover:bg-red-300 focus:ring-4 focus:ring-red-600 rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Report Issue
            </button>
          </div>
        </div>
        <div
          className={`relative z-10 ${open ? "" : "hidden"}`}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-500/75 transition-opacity"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          ></div>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-base font-semibold text-gray-900"
                        id="modal-title"
                      >
                        Starting Activity for {eqp.eqp_name}
                      </h3>
                      <div className="mt-2">
                        <div className="mt-6 w-full">
                          <form onSubmit={handleSubmit} className="w-full">
                            <div className="grid gap-4 mb-4 grid-cols-2 ">
                              <div className="grid gap-4 grid-cols-1">
                                <div>
                                  <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                    Product Name / Protocol Name
                                  </label>
                                  <input
                                    type="text"
                                    name="product_name"
                                    id="name"
                                    onChange={(e) =>
                                      setProductName(e.target.value)
                                    }
                                    className={`border border-gray-300 ${submitted && productName.length === 0 ? "border-red-500 border-2" : ""} bg-gray-50  text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                    placeholder="Type product name"
                                    required
                                  />
                                  {submitted && productName.length === 0 ? (
                                    <span className="text-sm text-red-800 pl-2">
                                      Please enter valid product name
                                    </span>
                                  ) : null}
                                </div>
                                <div>
                                  <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                    Batch No / Protocol No
                                  </label>
                                  <input
                                    type="text"
                                    name="batch_no"
                                    id="brand"
                                    onChange={(e) => setBatchNo(e.target.value)}
                                    className={`${submitted && batchNo.length === 0 ? "border-red-500 border-2" : ""} bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                    placeholder="Type batch number"
                                    required
                                  />
                                  {submitted && batchNo.length === 0 ? (
                                    <span className="text-sm text-red-800 pl-2">
                                      Please enter valid batch number
                                    </span>
                                  ) : null}
                                </div>
                                <div>
                                  <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                    Activity Name
                                  </label>

                                  <select
                                    id="countries"
                                    className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    name="activity_name"
                                    onChange={(e) =>
                                      setActivityName(e.target.value)
                                    }
                                    // defaultValue={
                                    //   nextSuggestedActivity != null
                                    //     ? nextSuggestedActivity
                                    //     : "Select a Value"
                                    // }
                                  >
                                    <option value="Select a Value">
                                      Select a value
                                    </option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="CIP">CIP</option>
                                    <option value="PHT">PHT</option>
                                    <option value="SIP">SIP</option>
                                    <option value="Load Cell Calibration">
                                      Load Cell Calibration
                                    </option>
                                    <option value="Others">Others</option>
                                  </select>
                                </div>
                                {/* {nextSuggestedActivity != null &&
                                activityName != nextSuggestedActivity ? (
                                  <span className="text-red-900 font-semibold">
                                    Next Recommended Activity :{" "}
                                    {nextSuggestedActivity}
                                  </span>
                                ) : null} */}
                                {activityName && activityName === "Others" ? (
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Other Activity Name
                                    </label>
                                    <input
                                      type="text"
                                      name="other_activity_name"
                                      id="name"
                                      onChange={(e) =>
                                        setOtherActivityName(e.target.value)
                                      }
                                      className={`${submitted && otherActivityName.length === 0 ? "border-red-500 border-2" : ""} bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      placeholder="Type other activity name"
                                      required
                                    />
                                    {submitted &&
                                    otherActivityName.length === 0 ? (
                                      <span className="text-sm text-red-800 pl-2">
                                        Please enter valid activity name
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                                <div>
                                  <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                    Performed By
                                  </label>
                                  <input
                                    type="text"
                                    name="performed_by"
                                    id="performedBy"
                                    className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                    value={user.email}
                                    required=""
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                    Start Date & Time
                                  </label>
                                  <input
                                    type="text"
                                    name="start_time"
                                    id="performedBy"
                                    className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                    value={getCurrentTime()}
                                    required=""
                                    readOnly
                                  />
                                </div>
                              </div>
                              {/* Right side timeline
                              <div className="px-12">
                                <p className="pb-8  font-medium text-gray-900 dark:text-white">
                                  Below activities to be completed every 24hrs
                                  for {eqp.eqp_name}
                                </p>
                                <ol className="relative text-gray-500 border-s border-gray-300 dark:border-gray-700 dark:text-gray-400">
                                  <li className="mb-10 ms-6">
                                    {mandatoryTasks.cleaning ? (
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
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
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
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
                                    <h3 className=" font-medium leading-tight pt-1.5 pl-2">
                                      Cleaning
                                    </h3>
                                  </li>
                                  <li className="mb-10 ms-6">
                                    {mandatoryTasks.vlt ? (
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
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
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
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
                                    <h3 className=" font-medium leading-tight pt-1.5 pl-2">
                                      VLT
                                    </h3>
                                  </li>
                                  <li className="mb-10 ms-6">
                                    {mandatoryTasks.bowieDick ? (
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
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
                                      <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
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
                                    <h3 className=" font-medium leading-tight pt-1.5 pl-2">
                                      Bowie Dick
                                    </h3>
                                  </li>
                                </ol>
                              </div> */}
                              {/* {lists[selected].eqp_name === "Steam Sterilizer" ? (
                        <div className="px-12">
                          <p className="pb-8  font-medium text-gray-900 dark:text-white">
                            Below activities to be completed every 24hrs for{" "}
                            {lists[selected].eqp_name}
                          </p>
                          <ol className="relative text-gray-500 border-s border-gray-300 dark:border-gray-700 dark:text-gray-400">
                            {lists[selected].activity_order.map(
                              (activity, index) => (
                                <li key={index} className="mb-10 ms-6">
                                  {currentActivity &&
                                  index <=
                                    lists[selected].activity_order.findIndex(
                                      (activityq) =>
                                        activityq.name ===
                                        currentActivity.activity_name
                                    ) &&
                                  !dayCompleted ? (
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
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
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
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
                                  <h3 className=" font-medium leading-tight pt-1.5 pl-2">
                                    {activity.name}
                                  </h3>
                                  {currentActivity &&
                                  currentActivity.hold_expiry &&
                                  activity.name === nextAllowedActivity.name ? (
                                    <div className=" font-medium leading-tight pt-1.5 pl-2">
                                      Start in :{" "}
                                      {getTimeRemaining(
                                        currentActivity.hold_expiry
                                      )}
                                    </div>
                                  ) : null}
                                </li>
                              )
                            )}
                          </ol>
                        </div>
                      ) : null} */}
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    onClick={(e) => handleSubmit(e)}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2  font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                  >
                    Start Activity
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/*Mismatch modal*/}
          {/* {missmatchOpen && (
            <div
              className={`relative z-20 `}
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                          <svg
                            className="size-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                            data-slot="icon"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                          </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3
                            className=" font-semibold text-gray-900"
                            id="modal-title"
                          >
                            Different Activity Name
                          </h3>
                          <div className="mt-2">
                            <p className=" text-gray-800">
                              Next Suggested Activity is{" "}
                              <strong>{nextSuggestedActivity}</strong>, but you
                              selected <strong>{activityName}</strong>
                              <br />
                              Are you sure you want to continue?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={(e) => {
                          handleSubmitWithoutError(e);
                        }}
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => {
                          setMismatchOpen(false);
                        }}
                      >
                        Change Selection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        <div className="relative overflow-x-auto">
          <div className="mt-6">
            <h3 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              In Progress Activity
            </h3>
            <div className="mt-6">
              {latestActivity ? (
                <div className="grid mb-8 border-2 border-gray-200 rounded-lg shadow-smq dark:border-gray-700 grid-cols-2 bg-white dark:bg-gray-800">
                  <a
                    href={
                      latestActivity &&
                      `./production/activity/${latestActivity.id}`
                    }
                  >
                    <figure className="flex mt-2 flex-col justify-center bg-white rounded-t-lg px-6 py-4 ">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {latestActivity && latestActivity.activity_name}
                      </h3>
                    </figure>
                  </a>
                  <figure className="flex flex-col justify-center bg-white rounded-t-lg ">
                    {latestActivity &&
                    latestActivity.activity_status === "In Progress" ? (
                      <div className="text-sm font-semibold dark:text-white rounded-full bg-yellow-200 text-yellow-900 w-fit px-4 py-1 ">
                        {latestActivity && latestActivity.activity_status}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="text-sm font-semibold dark:text-white rounded-full bg-green-200 text-green-900 w-fit px-4 py-1 h-fit">
                          {latestActivity && latestActivity.activity_status}
                        </div>
                        <div className="text-sm font-semibold dark:text-white rounded-full bg-orange-200 text-orange-900 w-fit px-4 py-1 ml-5 h-fit">
                          Approval Pending
                        </div>
                        <button
                          onClick={() => setApproveOpen(true)}
                          className="ml-auto mr-5 mt-3 bg-blue-200 text-blue-900 px-4 py-3 font-semibold rounded-lg z-99"
                        >
                          Approve Activity
                        </button>
                      </div>
                    )}
                  </figure>
                  <a
                    href={
                      latestActivity &&
                      `./production/activity/${latestActivity.id}`
                    }
                  >
                    <figure className="flex flex-col justify-left bg-white rounded-t-lg px-6 ">
                      <p className="my-auto mt-2">
                        Started By :{" "}
                        <span className=" font-semibold text-gray-900 dark:text-white">
                          {latestActivity && latestActivity.performed_by}
                        </span>
                      </p>
                    </figure>
                  </a>
                  <a
                    href={
                      latestActivity &&
                      `./production/activity/${latestActivity.id}`
                    }
                  >
                    <figure className="flex flex-row justify-left bg-white rounded-t-lg px-2 mb-4 items-center">
                      <p>
                        Start Time :{" "}
                        <span className=" font-semibold text-gray-900 dark:text-white">
                          {latestActivity && latestActivity.start_time}
                        </span>
                      </p>
                      <p className="mt-3 text-sm mb-5 text-gray-500 ml-auto mr-5">
                        ID : {latestActivity && latestActivity.id}
                      </p>
                    </figure>
                  </a>
                </div>
              ) : (
                <div className="grid mb-8 border-2 border-gray-200 rounded-lg shadow-smq dark:border-gray-700 grid-cols-2 bg-white dark:bg-gray-800">
                  <p className="p-6 text-gray-500 italic text-sm">
                    No In Progress Activity
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/*Approval Modal*/}
        {approveOpen && (
          <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              aria-hidden="true"
            ></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-base font-semibold text-gray-900"
                          id="modal-title"
                        >
                          Approving Activity{" - "}
                          <strong>
                            {latestActivity && latestActivity.activity_name}
                          </strong>{" "}
                          for
                          {" - "}
                          <strong>{eqp.eqp_name}</strong>
                        </h3>
                        <div className="mt-2">
                          <div className="mt-6 w-full">
                            <form className="w-full">
                              <div className="grid gap-4 mb-4 grid-cols-2 ">
                                <div className="grid gap-4 grid-cols-1">
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Product Name / Protocol Name
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.product_name
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Batch No / Protocol No
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.batch_no
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Activity Name
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.activity_name
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Activity Status
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.activity_status
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Performed By
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.performed_by
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <div className="px-12 grid grid-rows-5 gap-5">
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Start Time
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.start_time
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      End Time
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.end_time
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Remarks
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity && latestActivity.remarks
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      onClick={(e) => handleApprove(e, "approve")}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2  font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      Approve Activity
                    </button>
                    <button
                      onClick={(e) => handleApprove(e, "reject")}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2  font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                    >
                      Reject Activity
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setApproveOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/*Rejected Modal*/}
        {rejectedOpen && (
          <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              aria-hidden="true"
            ></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-base font-semibold text-gray-900"
                          id="modal-title"
                        >
                          Rejecting Activity{" - "}
                          <strong>
                            {latestActivity && latestActivity.activity_name}
                          </strong>{" "}
                          for
                          {" - "}
                          <strong>{eqp.eqp_name}</strong>
                        </h3>
                        <div className="mt-2">
                          <div className="mt-6 w-full">
                            <form className="w-full">
                              <div className="grid gap-4 mb-4 grid-cols-2 ">
                                <div className="grid gap-4 grid-cols-1">
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Product Name / Protocol Name
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.product_name
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Batch No / Protocol No
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.batch_no
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Activity Name
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.activity_name
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Activity Status
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.activity_status
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Performed By
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.performed_by
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <div className="px-12 grid grid-rows-5 gap-5">
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Start Time
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.start_time
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      End Time
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity &&
                                        latestActivity.end_time
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Remarks
                                    </label>
                                    <input
                                      type="text"
                                      name="product_name"
                                      id="name"
                                      value={
                                        latestActivity && latestActivity.remarks
                                      }
                                      className={`bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2  font-medium text-gray-900 dark:text-white">
                                      Rejection Reason
                                    </label>
                                    <input
                                      type="text"
                                      name="rejection_reason"
                                      id="name"
                                      onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                      }
                                      className={`${rejectSubmitted && rejectionReason.length === 0 ? "border-red-500 border-2" : ""} bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                                    />
                                    {rejectSubmitted &&
                                    rejectionReason.length === 0 ? (
                                      <span className="text-sm text-red-800 pl-2 absolute">
                                        Please enter valid rejection reason
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      onClick={(e) => handleReject(e)}
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2  font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                    >
                      Reject Activity
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setRejectSubmitted(false);
                        setRejectionReason("");
                        setRejectedOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/*Approve/Reject Confirmation Modal*/}
        {approveConfirmation.booleanProp === true &&
        approveConfirmation.status === "approved" ? (
          <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              aria-hidden="true"
            ></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-base font-semibold text-gray-900"
                          id="modal-title"
                        >
                          Successfully Approved
                        </h3>
                        <div className="mt-2"></div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => {
                            setApproveConfirmation({
                              booleanProp: false,
                              status: "",
                            });
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : approveConfirmation.booleanProp === true &&
          approveConfirmation.status === "rejected" ? (
          <div>
            <div
              className="relative z-10"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
              ></div>
              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3
                            className="text-base font-semibold text-gray-900"
                            id="modal-title"
                          >
                            <strong>
                              {latestActivity && latestActivity.activity_name}
                            </strong>{" "}
                            for
                            {" - "}
                            <strong>{eqp.eqp_name}</strong> Successfully
                            Rejected
                          </h3>
                          <div className="mt-2"></div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => {
                              setApproveConfirmation({
                                booleanProp: false,
                                status: "",
                              });
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {/*In Progress or Not Approved Modal*/}
        {errorStarting.booleanProp === true &&
        errorStarting.status === "in_progress" ? (
          <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              aria-hidden="true"
            ></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-base font-semibold text-gray-900"
                          id="modal-title"
                        >
                          <strong>
                            {latestActivity && latestActivity.activity_name}
                          </strong>{" "}
                          for
                          {" - "}
                          <strong>{eqp.eqp_name}</strong> Still In Progress
                        </h3>
                        <div className="mt-2">
                          Please complete the activity before starting a new one
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => {
                            setErrorStarting({
                              booleanProp: false,
                              status: "",
                            });
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : errorStarting.booleanProp === true &&
          errorStarting.status === "pending_approval" ? (
          <div>
            <div
              className="relative z-10"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
              ></div>
              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3
                            className="text-base font-semibold text-gray-900"
                            id="modal-title"
                          >
                            <strong>
                              {latestActivity && latestActivity.activity_name}
                            </strong>{" "}
                            for
                            {" - "}
                            <strong>{eqp.eqp_name}</strong> Not Approved
                          </h3>
                          <div className="mt-2">
                            Please get the activity entry approved by your
                            manager before starting a new one
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2  font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => {
                              setErrorStarting({
                                booleanProp: false,
                                status: "",
                              });
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MixingVessel;
