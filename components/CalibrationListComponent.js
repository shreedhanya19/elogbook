"use client";
import { useRef, useEffect, useState } from "react";

import { ChevronRight, ChevronLeft, Shapes } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import next from "next";
import { parse } from "path";
import { get } from "http";

const CalibrationListComponent = ({ lists, user, id }) => {
  console.log(id);
  // QR Code Scanner Component --------------------------------------------------------------
  const [qrResult, setQrResult] = useState(""); // Store QR code result
  const [isScanning, setIsScanning] = useState(false); // Scanning state
  const videoRef = useRef(null); // Reference to the video element
  const scannerRef = useRef(null); // Reference to the ZXing scanner

  const startScanner = async () => {
    if (isScanning) return; // Prevent multiple initializations
    setIsScanning(true);

    try {
      const scanner = new BrowserMultiFormatReader();
      scannerRef.current = scanner;

      // Get available video devices (cameras)
      const videoDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = videoDevices.find(
        (device) => device.kind === "videoinput"
      );

      if (videoDevice) {
        // If a camera is found, pass the device ID to the scanner
        await scanner.decodeFromVideoDevice(
          videoDevice.deviceId, // Use the deviceId for the selected camera
          videoRef.current, // Attach video feed
          (result, error) => {
            if (result) {
              setQrResult(result.getText()); // Update QR code result
              onQrResult(result.getText()); // Call the parent's callback with the result
              stopScanner(); // Stop scanning after successful result
            }
            if (error && error.name !== "NotFoundException") {
              console.warn(error.message); // Log non-critical errors
            }
          }
        );
      } else {
        console.error("No video input devices found");
        stopScanner();
      }
    } catch (error) {
      console.error("Error initializing scanner:", error);
      stopScanner();
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.reset(); // Stop the scanner
      scannerRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop()); // Stop the video feed
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  useEffect(() => {
    // Clean up resources when the component unmounts
    return () => stopScanner();
  }, []);

  // QR Code Scanner Component --------------------------------------------------------------
  // QR Code Scanner Component --------------------------------------------------------------
  // QR Code Scanner Component --------------------------------------------------------------
  // QR Code Scanner Component --------------------------------------------------------------

  const [listsx, setLists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedCalibrationEqp")
      ? parseInt(localStorage.getItem("selectedCalibrationEqp"))
      : id
        ? parseInt(id)
        : 0
  );
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const [activity, setActivity] = useState();
  const [allActivities, setAllActivities] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [nextAllowedActivity, setNextAllowedActivity] = useState(null);
  const [isApproved, setIsApproved] = useState(null);
  const [inProgress, setInProgress] = useState(null);
  const [ifId, setIfId] = useState(!id ? null : parseInt(id));
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [holdExpiry, setHoldExpiry] = useState(null);
  const [cycle, setCycle] = useState(true);
  const [holdOpen, setHoldOpen] = useState(false);
  const [expiry, setExpiry] = useState(true);
  const [spiritLevel, setSpiritLevel] = useState("Yes");
  const [passFail, setPassFail] = useState(null);
  const [limits, setLimits] = useState(null);

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

  const [rejectFormData, setRejectFormData] = useState({
    rejection_reason: "",
  });

  const getTimeRemaining = (timestamp) => {
    const now = new Date();
    const targetDate = new Date(timestamp);
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) {
      return "Time has already passed";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} hours, ${minutes} minutes`;
  };

  const [formData, setFormData] = useState({
    lower_weight: "",
    middle_weight: "",
    upper_weight: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRejectInputChange = (e) => {
    const { name, value } = e.target;
    setRejectFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Callback function to handle the QR result
  const handleQrResult = (result) => {
    setQrResult(result); // Update the parent's state with the scanned result
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("calibration_weighing_balance")
          .select("*")
          .eq("eqp_id", lists[selected].tag_id)
          .limit(1)
          .order("calibration_date", { ascending: false });
        if (error) {
          throw error;
        }
        setAllActivities(data);

        if (!data.some((dat) => dat.calibration_status === "Pending Approval"))
          setActivity(undefined);
        else {
          const filtered = data.filter(
            (activity) => activity.calibration_status === "Pending Approval"
          );
          setActivity(filtered);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        return null;
      }
    };
    fetchActivities();
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
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("calibration_weighing_balance")
        .select("*")
        .eq("eqp_id", lists[selected].tag_id)
        .limit(1)
        .order("calibration_date", { ascending: false });
      if (error) {
        throw error;
      }
      setAllActivities(data);

      if (!data.some((dat) => dat.calibration_status === "Pending Approval"))
        setActivity(undefined);
      else {
        const filtered = data.filter(
          (activity) => activity.calibration_status === "Pending Approval"
        );
        setActivity(filtered);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      return null;
    }
  };

  useEffect(() => {
    localStorage.setItem("selectedCalibrationEqp", selected);
    fetchActivities();
  }, [selected]);

  // useEffect(() => {
  //   if (allActivities) {
  //     const latestActivity = allActivities[0];
  //     if (!latestActivity) {
  //       setCurrentActivity(null);
  //       setNextAllowedActivity(lists[selected].activity_order[0]);
  //       return; // If no activity, default to the first
  //     }
  //     let currentIndex = lists[selected].activity_order.findIndex(
  //       (activityq) => activityq.name === latestActivity.activity_name
  //     );
  //     //console.log(currentIndex);

  //     if (currentIndex === -1) {
  //       console.error("Activity not found in the equipment order!");
  //       setCurrentActivity(null);
  //       setNextAllowedActivity(null);

  //       return;
  //     }
  //     setCurrentActivity(latestActivity);

  //     if (latestActivity.activity_status === "In Progress") {
  //       setInProgress(latestActivity.activity_name);
  //     }

  //     const nextIndex =
  //       (currentIndex + 1) % lists[selected].activity_order.length;
  //     setNextAllowedActivity(lists[selected].activity_order[nextIndex]);

  //     if (latestActivity.approval_status === "Pending") {
  //       setIsApproved(false);
  //     } else {
  //       setIsApproved(true);
  //     }

  //     if (ifId) {
  //       setOpen(true);
  //     }
  //   }
  // }, [allActivities]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const handleClick = (index) => {
    setSelected(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let pf = "";
    if (
      limits &&
      spiritLevel === "Yes" &&
      parseFloat(formData.lower_weight) >= parseFloat(limits.lower_low) &&
      parseFloat(formData.lower_weight) <= limits.lower_high &&
      parseFloat(formData.middle_weight) >= parseFloat(limits.middle_low) &&
      parseFloat(formData.middle_weight) <= parseFloat(limits.middle_high) &&
      parseFloat(formData.upper_weight) >= parseFloat(limits.upper_low) &&
      parseFloat(formData.upper_weight) <= parseFloat(limits.upper_high)
    ) {
      setPassFail("Pass");
      pf = "Pass";
    } else {
      setPassFail("Fail");
      pf = "Fail";
    }
    try {
      const { error } = await supabase
        .from("calibration_weighing_balance") // Replace with your table name
        .insert({
          eqp_id: lists[selected].tag_id,
          calibration_date: getCurrentTime(),
          spirit_centered: spiritLevel,
          lower_weight: formData.lower_weight,
          middle_weight: formData.middle_weight,
          upper_weight: formData.upper_weight,
          result: pf,
          next_due: getFutureTimestamp(168),
          performed_by: users.email,
          calibration_status: "Pending Approval",
        });
      if (error) {
        throw error;
      }
      setOpen(false);
      fetchActivities();
    } catch (err) {
      console.error("Error inserting data:", err);
    }
  };

  const handleApprove = async (value) => {
    console.log("Function received:", value);
    try {
      const myId = await selectedActivity;
      if (value === "Approved") {
        const { data, error } = await supabase
          .from("calibration_weighing_balance") // Replace with your table name
          .update({
            approved_by: users.email,
            approved_at: getCurrentTime(),
            approval_status: value,
            calibration_status: "Calibrated",
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
          .from("calibration_weighing_balance") // Replace with your table name
          .update({
            rejected_by: users.email,
            rejected_at: getCurrentTime(),
            approval_status: value,
            calibration_status: "Re-Calibration Required",
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
      <h1 className=" font-bold text-purple-900 text-2xl ml-4 mb-4">
        Calibration Log Books
      </h1>
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
                    className={`py-3 sm:py-4 ${!list.has_calibration ? "hidden" : null} cursor-pointer mt-3`}
                    onClick={() => handleClick(index)}
                  >
                    <div className={`flex items-center  border-b-black`}>
                      <div className="flex-shrink-0">
                        <Shapes
                          color={selected === index ? "black" : "#A9A9A9"}
                          size={28}
                        />
                      </div>
                      <div className="flex-1 min-w-0 ms-4">
                        <p
                          className={`text-md ${selected === index ? "font-bold" : "font-medium"} text-gray-900 truncate dark:text-white`}
                        >
                          {list.eqp_name}
                        </p>
                        <p
                          className={`text-sm ${selected === index ? "font-bold" : "font-medium"} text-gray-500 truncate dark:text-gray-400 pt-1`}
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
              <div className="p-2">
                Last Calibration Date :{" "}
                <b>
                  {selected !== null && !lists[selected].calibration_status
                    ? "Not yet Calibrated"
                    : lists[selected].calibration_status.last_calibration_date}
                </b>
              </div>
              <div className="p-2">
                Next Calibration Due Date :{" "}
                <b>
                  {selected !== null && !lists[selected].calibration_status
                    ? "Not yet Calibrated"
                    : lists[selected].calibration_status.next_due}
                </b>
              </div>
            </div>
            {lists[selected].linked_eqp != null ? (
              <div className="grid grid-cols-2 grid-rows-2 justify-start align-middle mt-5 border-b-2 pb-6">
                <div className="flex">
                  <h5 className="text-lg font-semibold leading-none text-gray-900 dark:text-white mt-1">
                    Linked Equipment Details
                  </h5>
                  <button
                    onClick={() => setSelected(lists[selected].linked_eqp - 1)}
                    className="text-sm text-gray-800 bg-slate-200 rounded-full pr-2 pl-4 py-1 flex mb-4 ml-4"
                  >
                    Go to Equipment
                    <ChevronRight className="h-5" />
                  </button>
                </div>
                <div></div>
                <div className="p-2">
                  Equipment Name :{" "}
                  <b>
                    {" "}
                    {selected !== null &&
                      lists[lists[selected].linked_eqp - 1].eqp_name}
                  </b>
                </div>

                <div className="p-2">
                  Equipment ID :{" "}
                  <b>
                    {selected !== null &&
                      lists[lists[selected].linked_eqp - 1].tag_id}
                  </b>
                </div>
                <div className="p-2">
                  Location :{" "}
                  <b>
                    {selected !== null &&
                      lists[lists[selected].linked_eqp - 1].location}
                  </b>
                </div>
                <div className="p-2">
                  Make / Model :{" "}
                  <b>
                    {selected !== null &&
                      lists[lists[selected].linked_eqp - 1].make +
                        " / " +
                        lists[lists[selected].linked_eqp - 1].model}
                  </b>
                </div>
                <div className="p-2">
                  Last Calibration Date :{" "}
                  <b>
                    {selected !== null &&
                    !lists[lists[selected].linked_eqp - 1].calibration_status
                      ? "Not yet Calibrated"
                      : lists[lists[selected].linked_eqp - 1].calibration_status
                          .last_calibration_date}
                  </b>
                </div>
                <div className="p-2">
                  Next Calibration Due Date :{" "}
                  <b>
                    {selected !== null &&
                    !lists[lists[selected].linked_eqp - 1].calibration_status
                      ? "Not yet Calibrated"
                      : lists[lists[selected].linked_eqp - 1].calibration_status
                          .next_due}
                  </b>
                </div>
              </div>
            ) : null}
            <div className="grid grid-cols-2 grid-rows-1 mt-3  justify-center align-middle border-b-2 pb-4">
              <div className="p-2 flex justify-center align-middle ">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true);
                    if (lists[selected].calibration_limits) {
                      let limitx = {
                        lower_low:
                          lists[selected].calibration_limits.lower.split(
                            "-"
                          )[0],
                        lower_high:
                          lists[selected].calibration_limits.lower.split(
                            "-"
                          )[1],
                        middle_low:
                          lists[selected].calibration_limits.middle.split(
                            "-"
                          )[0],
                        middle_high:
                          lists[selected].calibration_limits.middle.split(
                            "-"
                          )[1],
                        upper_low:
                          lists[selected].calibration_limits.upper.split(
                            "-"
                          )[0],
                        upper_high:
                          lists[selected].calibration_limits.upper.split(
                            "-"
                          )[1],
                      };
                      setLimits(limitx);
                    }
                  }}
                  className="text-blue-900 font-semibold w-full h-full bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-600 rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Start Calibration
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

              {/* <div className="p-2 flex justify-center align-middle ">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `./production/equipment/${lists[selected].eqpid}`
                    )
                  }
                  className="text-white w-full h-full bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  View Audit Trail
                </button>
              </div> */}
            </div>

            <div className="relative overflow-x-auto">
              <div>
                {currentActivity &&
                currentActivity.hold_expiry &&
                getTimeRemaining(currentActivity.hold_expiry) !=
                  "Time has already passed" &&
                nextAllowedActivity.name ? (
                  <div className="mt-6 mb-8">
                    <div
                      className="p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
                      role="alert"
                    >
                      <span className="font-bold">Alert!</span> Complete Next
                      Activity - <strong>{nextAllowedActivity.name}</strong> in
                      :{" "}
                      <span className="font-bold text-red-800">
                        {getTimeRemaining(currentActivity.hold_expiry)}
                      </span>
                    </div>
                  </div>
                ) : currentActivity &&
                  currentActivity.hold_expiry &&
                  getTimeRemaining(currentActivity.hold_expiry) ===
                    "Time has already passed" &&
                  nextAllowedActivity.name ? (
                  <div className="mt-6 mb-8">
                    <div
                      className="p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-300"
                      role="alert"
                    >
                      <span className="font-bold">
                        Alert!
                        <br />
                      </span>{" "}
                      Hold time of previous activity has expired. Please restart
                      activities from the beginning
                    </div>
                  </div>
                ) : null}
              </div>
              <h4 className="text-xl font-bold leading-none text-gray-900 dark:text-white mt-6 mb-6">
                Pending Approval
              </h4>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Performed By
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Lower Weight
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Middle Weight
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Upper Weight
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Result
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
                      <td colSpan="6" className="py-6 px-4 text-center">
                        No In Progress Activities
                      </td>
                    </tr>
                  ) : (
                    activity.map((act, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {getDateFromTimestamp(act.calibration_date)}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.performed_by}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.lower_weight}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.middle_weight}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.upper_weight}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.result}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedActivity(activity[0]);
                              setApproveOpen(true);
                            }}
                            type="button"
                            className="focus:outline-none h-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-4 py-2  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-900"
                          >
                            Approve
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedActivity(activity[0]);
                              setRejectOpen(true);
                            }}
                            type="button"
                            className="focus:outline-none h-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-4 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
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
      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-48 x-sm:px-96 text-center ">
            {inProgress ? (
              <DialogPanel
                transition
                className="w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="bg-white px-4 pt-5 dark:bg-zinc-900">
                  <div className="">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900 w-full dark:text-white"
                      >
                        {inProgress} Calibration Still In Progress
                      </DialogTitle>
                      <div className="mt-6 w-full pb-6">
                        <p>
                          Please complete the current calibration before
                          starting the next calibration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            ) : isApproved === false ? (
              <DialogPanel
                transition
                className="w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="bg-white px-4 pt-5 dark:bg-zinc-900">
                  <div className="">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900 w-full dark:text-white"
                      >
                        {currentActivity
                          ? currentActivity.activity_name
                          : "..."}{" "}
                        Calibration Not Approved
                      </DialogTitle>
                      <div className="mt-6 w-full pb-6">
                        <p>
                          Please approve the current calibration before starting
                          the next calibration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            ) : (
              <DialogPanel
                transition
                className="w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="bg-white px-4 pt-5 dark:bg-zinc-900">
                  <div className="">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900 w-full dark:text-white"
                      >
                        Starting Calibration for {lists[selected].eqp_name}
                      </DialogTitle>
                      <div className="mt-6 w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                          <div className="grid gap-4 mb-4 grid-cols-2 ">
                            <div className="grid gap-4 grid-cols-1">
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Date
                                </label>
                                <input
                                  type="text"
                                  name="product_name"
                                  id="name"
                                  value={getCurrentTime()}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  required
                                  readOnly
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Spirit Level Centre (Yes/No)
                                </label>
                                <select
                                  id="countries"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  onChange={(e) =>
                                    setSpiritLevel(e.target.value)
                                  }
                                >
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Lower Weight (Kg/g)
                                </label>
                                <input
                                  type="text"
                                  name="lower_weight"
                                  id="lowerWeight"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  onChange={handleInputChange}
                                  required=""
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Middle Weight (Kg/g)
                                </label>
                                <input
                                  type="text"
                                  name="middle_weight"
                                  id="middleWeight"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  onChange={handleInputChange}
                                  required=""
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Upper Weight (Kg/g)
                                </label>
                                <input
                                  type="text"
                                  name="upper_weight"
                                  id="upperWeight"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  onChange={handleInputChange}
                                  required=""
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 grid-cols-1 grid-rows-5 pl-8">
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Result (Pass/Fail)
                                </label>
                                <input
                                  readOnly
                                  type="text"
                                  name="upper_weight"
                                  id="upperWeight"
                                  className={`bg-gray-50 border ${
                                    limits &&
                                    spiritLevel === "Yes" &&
                                    parseFloat(formData.lower_weight) >=
                                      parseFloat(limits.lower_low) &&
                                    parseFloat(formData.lower_weight) <=
                                      limits.lower_high &&
                                    parseFloat(formData.middle_weight) >=
                                      parseFloat(limits.middle_low) &&
                                    parseFloat(formData.middle_weight) <=
                                      parseFloat(limits.middle_high) &&
                                    parseFloat(formData.upper_weight) >=
                                      parseFloat(limits.upper_low) &&
                                    parseFloat(formData.upper_weight) <=
                                      parseFloat(limits.upper_high)
                                      ? "text-green-700 border-2 border-green-700"
                                      : "text-red-700 border-2 border-red-700"
                                  } border-gray-300 font-bold text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
                                  value={
                                    limits &&
                                    spiritLevel === "Yes" &&
                                    parseFloat(formData.lower_weight) >=
                                      parseFloat(limits.lower_low) &&
                                    parseFloat(formData.lower_weight) <=
                                      limits.lower_high &&
                                    parseFloat(formData.middle_weight) >=
                                      parseFloat(limits.middle_low) &&
                                    parseFloat(formData.middle_weight) <=
                                      parseFloat(limits.middle_high) &&
                                    parseFloat(formData.upper_weight) >=
                                      parseFloat(limits.upper_low) &&
                                    parseFloat(formData.upper_weight) <=
                                      parseFloat(limits.upper_high)
                                      ? "Pass"
                                      : "Fail"
                                  }
                                />
                              </div>

                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Next Due Date
                                </label>
                                <input
                                  type="text"
                                  name="product_name"
                                  id="name"
                                  value={getFutureTimestamp(168)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  required
                                  readOnly
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Performed By
                                </label>
                                <input
                                  type="text"
                                  name="result"
                                  id="result"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  value={users.email}
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
                <div className="bg-gray-50 py-6 flex flex-row px-3 dark:bg-zinc-900 -mt-6">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                  >
                    Calibrate
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="mt-3 ml-4 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            )}
          </div>
        </div>
      </Dialog>
      {/* Hold Time Expired Modal */}
      <Dialog open={holdOpen} onClose={setHoldOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-48 x-sm:px-96 text-center ">
            <DialogPanel
              transition
              className="w-full relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 dark:bg-zinc-900">
                <div className="">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left p-3">
                    <DialogTitle
                      as="h3"
                      className="text-xl text-red-700 font-semibold  w-full dark:text-white"
                    >
                      Hold Time Expired
                    </DialogTitle>
                    <div className="text-md mt-6 w-full pb-6">
                      <p>
                        Resetting all progress, please close this popup and
                        click on Start Activity button to restart the activities
                        from the beginning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
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
                    {selectedActivity &&
                    selectedActivity.activity_status === "In Progress" ? (
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold text-gray-900 w-full dark:text-white"
                        >
                          Activity {lists[selected].eqp_name} Still In Progress.
                          Please Complete it before Approving
                        </DialogTitle>
                        <div className="mt-6 w-full">
                          <p>
                            Please complete the current activity before
                            approving
                          </p>
                        </div>
                        <div className=" px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-zinc-900">
                          <button
                            type="button"
                            data-autofocus
                            onClick={() => setApproveOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <DialogTitle
                          as="h3"
                          className="text-base font-semibold text-gray-900 w-full dark:text-white"
                        >
                          Approving Calibration for {lists[selected].eqp_name}
                        </DialogTitle>
                        <div className="mt-6 w-full">
                          <form className="w-full" onSubmit={handleSubmit}>
                            <div className="grid gap-4 mb-4 grid-cols-2 ">
                              <div className="grid gap-4 grid-cols-1">
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Date
                                  </label>
                                  <input
                                    type="text"
                                    name="calibration_date"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.calibration_date
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Spirit Level Centre (Yes/No)
                                  </label>
                                  <input
                                    type="text"
                                    name="spirit_centered"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.spirit_centered
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Lower Weight (Kg/g)
                                  </label>
                                  <input
                                    type="text"
                                    name="lower_weight"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.lower_weight
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Middle Weight (Kg/g)
                                  </label>
                                  <input
                                    type="text"
                                    name="middle_weight"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.middle_weight
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Upper Weight (Kg/g)
                                  </label>
                                  <input
                                    type="text"
                                    name="upper_weight"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.upper_weight
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                              </div>
                              <div className="grid gap-4 grid-cols-1 grid-rows-5 pl-8">
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Result (Pass/Fail)
                                  </label>
                                  <input
                                    type="text"
                                    name="result"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.result
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>

                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Next Due Date
                                  </label>
                                  <input
                                    type="text"
                                    name="next_due"
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.next_due
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
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
                                    id="name"
                                    value={
                                      selectedActivity &&
                                      selectedActivity.performed_by
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                          </form>
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
                      </div>
                    )}
                  </div>
                </div>
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
                      Rejecting Activity for {lists[selected].eqp_name}
                    </DialogTitle>
                    <div className="mt-6 w-full  ">
                      <form className="w-full" onSubmit={handleSubmit}>
                        <div className="grid gap-4 mb-4 grid-cols-2 ">
                          <div className="grid gap-4 grid-cols-1">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Date
                              </label>
                              <input
                                type="text"
                                name="calibration_date"
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.calibration_date
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Spirit Level Centre (Yes/No)
                              </label>
                              <input
                                type="text"
                                name="spirit_centered"
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.spirit_centered
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Lower Weight (Kg/g)
                              </label>
                              <input
                                type="text"
                                name="lower_weight"
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.lower_weight
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Middle Weight (Kg/g)
                              </label>
                              <input
                                type="text"
                                name="middle_weight"
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.middle_weight
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Upper Weight (Kg/g)
                              </label>
                              <input
                                type="text"
                                name="upper_weight"
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.upper_weight
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                          </div>
                          <div className="grid gap-4 grid-cols-1 grid-rows-5 pl-8">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Result (Pass/Fail)
                              </label>
                              <input
                                type="text"
                                name="result"
                                id="name"
                                value={
                                  selectedActivity && selectedActivity.result
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Next Due Date
                              </label>
                              <input
                                type="text"
                                name="next_due"
                                id="name"
                                value={
                                  selectedActivity && selectedActivity.next_due
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
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
                                id="name"
                                value={
                                  selectedActivity &&
                                  selectedActivity.performed_by
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Rejection Reason
                              </label>
                              <input
                                type="text"
                                name="rejection_reason"
                                id="name"
                                onChange={handleRejectInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                required
                              />
                            </div>
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

export default CalibrationListComponent;
