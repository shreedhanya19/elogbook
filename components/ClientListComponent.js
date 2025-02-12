"use client";
import { useRef, useEffect, useState } from "react";

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
import next from "next";

const ClientListComponent = ({ lists, user, id }) => {
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
    localStorage.getItem("selectedEqp") != null ||
      localStorage.getItem("selectedEqp") != NaN
      ? parseInt(localStorage.getItem("selectedEqp"))
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
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const menuRef = useRef(null);
  const [freeToSelect, setFreeToSelect] = useState(false);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [activityName, setActivityName] = useState(null);
  const [otherActivityName, setOtherActivityName] = useState(null);
  const [productName, setProductName] = useState(null);
  const [batchNo, setBatchNo] = useState(null);

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

  const isBeforeExpiry = (expiryDate) => {
    const nowDate = new Date(getCurrentTime());
    const expiry = new Date(expiryDate);
    return nowDate < expiry;
  };

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
    created_by: "",
    activity_name: "",
    activity_status: "In Progress",
    start_time: "",
    product_name: "",
    batch_no: "",
    performed_by: "",
    approval_status: "Pending",
    linked_eqp: "",
    other_activity_name: "",
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
          .eq("linked_eqp", lists[selected].tag_id)
          .order("start_time", { ascending: false });
        if (error) {
          throw error;
        }
        setAllActivities(data);

        if (
          !data.some(
            (dat) =>
              dat.activity_status === "In Progress" ||
              dat.approval_status === "Pending"
          )
        )
          setActivity(undefined);
        else {
          const filtered = data.filter(
            (activity) =>
              activity.activity_status === "In Progress" ||
              activity.approval_status === "Pending"
          );
          setActivity(filtered);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        return null;
      }
    };
    fetchActivities();
  }, []);

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", lists[selected].tag_id)
          .limit(1)
          .order("start_time", { ascending: false });
        if (error) {
          throw error;
        }
        setAllActivities(data);

        if (
          !data.some(
            (dat) =>
              dat.activity_status === "In Progress" ||
              dat.approval_status === "Pending"
          )
        )
          setActivity(undefined);
        else {
          const filtered = data.filter(
            (activity) =>
              activity.activity_status === "In Progress" ||
              activity.approval_status === "Pending"
          );
          setActivity(filtered);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        return null;
      }
    };
    fetchActivities();
    setCurrentActivity(null);
    setNextAllowedActivity(null);
    setInProgress(null);
    localStorage.setItem("selectedEqp", selected);
  }, [selected]);

  useEffect(() => {
    if (allActivities) {
      const latestActivity = allActivities[0];
      if (!latestActivity) {
        setCurrentActivity(null);
        setNextAllowedActivity(lists[selected].activity_order[0]);
        return; // If no activity, default to the first
      }
      let currentIndex = lists[selected].activity_order.findIndex(
        (activityq) => activityq.name === latestActivity.activity_name
      );
      //console.log(currentIndex);

      if (currentIndex === -1) {
        console.error("Activity not found in the equipment order!");
        setCurrentActivity(null);
        setNextAllowedActivity(null);

        return;
      }
      setCurrentActivity(latestActivity);

      if (latestActivity.activity_status === "In Progress") {
        setInProgress(latestActivity.activity_name);
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex <= lists[selected].activity_order.length - 1) {
        setNextAllowedActivity(lists[selected].activity_order[nextIndex]);
        setActivityName(lists[selected].activity_order[nextIndex].name);
        setFreeToSelect(false);
      } else {
        setFreeToSelect(true);
      }

      if (latestActivity.approval_status === "Pending") {
        setIsApproved(false);
      } else {
        setIsApproved(true);
      }

      if (ifId) {
        setOpen(true);
      }
    }

    const fetchLastDayActivity = async () => {
      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("activity_name", "Bowie Dick")
          .order("id", { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        const latestRecord = data[0];

        const endTime = new Date(latestRecord.end_time); // Convert to Date object
        const now = new Date(); // Get current timestamp
        const differenceInHours = (now - endTime) / (1000 * 60 * 60); // Convert ms to hours
        const isExpired = differenceInHours >= 24; // Check if 24+ hours passed
        console.log(differenceInHours);
        if (
          isExpired &&
          currentActivity &&
          currentActivity.cycle_count <= data[0].cycle_count
        ) {
          setFreeToSelect(false);
          setCurrentActivity((prevState) => ({
            ...prevState, // Spread the previous state to retain other values
            activity_name: lists[selected].activity_order[0], // Update only the city key
          }));
          setNextAllowedActivity(lists[selected].activity_order[0]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        return null;
      }
    };
    fetchLastDayActivity();
  }, [allActivities]);

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
    if (
      nextAllowedActivity &&
      nextAllowedActivity.name === lists[selected].activity_order[0].name
    ) {
      try {
        const { data, error } = await supabase
          .from("production_activities") // Replace with your table name
          .insert({
            created_by: users.email,
            activity_name: nextAllowedActivity.name,
            activity_status: "In Progress",
            start_time: getCurrentTime(),
            product_name: productName,
            batch_no: batchNo,
            performed_by: users.email,
            approval_status: "Pending",
            linked_eqp: lists[selected].tag_id,
            // hold_expiry: getFutureTimestamp(
            //   lists[selected].activity_order[
            //     lists[selected].activity_order.findIndex(
            //       (activityq) => activityq.name === nextAllowedActivity.name
            //     )
            //   ].hold
            // ),
            hold_time: parseInt(
              lists[selected].activity_order[
                lists[selected].activity_order.findIndex(
                  (activityq) => activityq.name === nextAllowedActivity.name
                )
              ].hold
            ),
            cycle_count: parseInt(currentActivity.cycle_count) + 1,
          })
          .select();
        const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
        if (activityId) {
          // try {
          //   const { session, error2 } = await supabase
          //     .from("activity_sessions")
          //     .insert({
          //       activity_id: activityId,
          //       session_type: "Active",
          //       start_time: getCurrentTime(),
          //       performed_by: users.email,
          //     })
          //     .select();
          //   if (error2) {
          //     throw error2;
          //   }
          // } catch (err) {
          //   console.error(err.message);
          // }
          router.push(`./production/activity/${activityId}`); // Use router.push for redirection
        }

        if (error) {
          throw error;
        }
      } catch (err) {
        console.error(err.message);
      } finally {
      }
    } else if (freeToSelect) {
      try {
        const { data, error } = await supabase
          .from("production_activities") // Replace with your table name
          .insert({
            created_by: users.email,
            activity_name: activityName,
            activity_status: "In Progress",
            start_time: getCurrentTime(),
            product_name: productName,
            batch_no: batchNo,
            performed_by: users.email,
            approval_status: "Pending",
            linked_eqp: lists[selected].tag_id,
            // hold_expiry: getFutureTimestamp(
            //   lists[selected].activity_order[
            //     lists[selected].activity_order.findIndex(
            //       (activityq) => activityq.name === nextAllowedActivity.name
            //     )
            //   ].hold
            // ),
            // hold_time: parseInt(
            //   lists[selected].activity_order[
            //     lists[selected].activity_order.findIndex(
            //       (activityq) => activityq.name === nextAllowedActivity.name
            //     )
            //   ].hold
            // ),
            cycle_count: parseInt(currentActivity.cycle_count),
          })
          .select();
        const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
        if (activityId) {
          // try {
          //   const { session, error2 } = await supabase
          //     .from("activity_sessions")
          //     .insert({
          //       activity_id: activityId,
          //       session_type: "Active",
          //       start_time: getCurrentTime(),
          //       performed_by: users.email,
          //     })
          //     .select();
          //   if (error2) {
          //     throw error2;
          //   }
          // } catch (err) {
          //   console.error(err.message);
          // }
          router.push(`./production/activity/${activityId}`); // Use router.push for redirection
        }

        if (error) {
          throw error;
        }
      } catch (err) {
        console.error(err.message);
      } finally {
      }
    } else {
      try {
        const { data, error } = await supabase
          .from("production_activities") // Replace with your table name
          .insert({
            created_by: users.email,
            activity_name: nextAllowedActivity.name,
            activity_status: "In Progress",
            start_time: getCurrentTime(),
            product_name: productName,
            batch_no: batchNo,
            performed_by: users.email,
            approval_status: "Pending",
            linked_eqp: lists[selected].tag_id,
            // hold_expiry: getFutureTimestamp(
            //   lists[selected].activity_order[
            //     lists[selected].activity_order.findIndex(
            //       (activityq) => activityq.name === nextAllowedActivity.name
            //     )
            //   ].hold
            // ),
            hold_time: parseInt(
              lists[selected].activity_order[
                lists[selected].activity_order.findIndex(
                  (activityq) => activityq.name === nextAllowedActivity.name
                )
              ].hold
            ),
            cycle_count: parseInt(currentActivity.cycle_count),
          })
          .select();
        const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
        if (activityId) {
          // try {
          //   const { session, error2 } = await supabase
          //     .from("activity_sessions")
          //     .insert({
          //       activity_id: activityId,
          //       session_type: "Active",
          //       start_time: getCurrentTime(),
          //       performed_by: users.email,
          //     })
          //     .select();
          //   if (error2) {
          //     throw error2;
          //   }
          // } catch (err) {
          //   console.error(err.message);
          // }
          router.push(`./production/activity/${activityId}`); // Use router.push for redirection
        }

        if (error) {
          throw error;
        }
      } catch (err) {
        console.error(err.message);
      } finally {
      }
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .select("*")
        .eq("linked_eqp", lists[selected].tag_id)
        .order("start_time", { ascending: false });
      if (error) {
        throw error;
      }
      setAllActivities(data);

      if (
        !data.some(
          (dat) =>
            dat.activity_status === "In Progress" ||
            dat.approval_status === "Pending"
        )
      )
        setActivity(undefined);
      else {
        const filtered = data.filter(
          (activity) =>
            activity.activity_status === "In Progress" ||
            activity.approval_status === "Pending"
        );
        setActivity(filtered);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      return null;
    }
  };

  const fetchOnlyActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .select("*")
        .eq("linked_eqp", lists[selected].tag_id)
        .order("start_time", { ascending: false });
      if (error) {
        throw error;
      }
      setAllActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
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
      <h1 className=" font-bold text-amber-900 text-2xl ml-4 mb-4">
        Equipment Log Books
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
                    className="py-3 sm:py-4 cursor-pointer "
                    onClick={() => handleClick(index)}
                  >
                    <div className="flex items-center border-b-black">
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
            <div className="relative justify-end mb-4">
              <button
                id="dropdownMenuIconButton"
                data-dropdown-toggle="dropdownDots"
                className="absolute right-0 items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
                      href={`./production/equipment/${lists[selected].eqpid}`}
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
            <div className="grid grid-cols-2 grid-rows-1 mt-3  justify-center align-middle border-b-2 pb-4">
              <div className="p-2 flex justify-center align-middle ">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentActivity &&
                      currentActivity.hold_expiry &&
                      getTimeRemaining(currentActivity.hold_expiry) ===
                        "Time has already passed"
                    ) {
                      setHoldOpen(true);
                      setNextAllowedActivity(lists[selected].activity_order[0]);
                      setCurrentActivity(null);
                    } else setOpen(true);
                  }}
                  className="text-blue-900 font-semibold w-full h-full bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-600 rounded-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
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

            <div className="relative overflow-x-auto">
              <div>
                {currentActivity &&
                currentActivity.hold_expiry &&
                getTimeRemaining(currentActivity.hold_expiry) !=
                  "Time has already passed" &&
                nextAllowedActivity.name ? (
                  <div className="mt-6 mb-8">
                    <div
                      className="p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 border-2 border-yellow-100"
                      role="alert"
                    >
                      <span className="font-bold">Alert!</span> Start Next
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
                In Progress Activities
              </h4>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
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
                          {act.activity_name}
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
                          {act.start_time}
                        </td>
                        <td
                          onClick={() =>
                            router.push(`./production/activity/${act.id}`)
                          }
                          className="px-6 py-4"
                        >
                          {act.activity_status}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedActivity(activity[index]);
                              setApproveOpen(true);
                            }}
                            type="button"
                            className="focus:outline-none h-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-4 py-2  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-900"
                          >
                            Approve
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedActivity(activity[index]);
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
                        {inProgress} Activity Still In Progress
                      </DialogTitle>
                      <div className="mt-6 w-full pb-6">
                        <p>
                          Please complete the current activity before starting
                          the next activity
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
                        Activity Not Approved
                      </DialogTitle>
                      <div className="mt-6 w-full pb-6">
                        <p>
                          Please approve the current activity before starting
                          the next activity
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
                        Starting Activity for {lists[selected].eqp_name}
                      </DialogTitle>
                      <div className="mt-6 w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                          <div className="grid gap-4 mb-4 grid-cols-2 ">
                            <div className="grid gap-4 grid-cols-1">
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Product Name / Protocol Name
                                </label>
                                <input
                                  type="text"
                                  name="product_name"
                                  id="name"
                                  onChange={(e) =>
                                    setProductName(e.target.value)
                                  }
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  placeholder="Type product name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Batch No / Protocol No
                                </label>
                                <input
                                  type="text"
                                  name="batch_no"
                                  id="brand"
                                  onChange={(e) => setBatchNo(e.target.value)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  placeholder="Type batch number"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Activity Name
                                </label>
                                {freeToSelect ? (
                                  <select
                                    id="countries"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    name="activity_name"
                                    onChange={(e) =>
                                      setActivityName(e.target.value)
                                    }
                                  >
                                    <option value="Select a Value">
                                      Select a value
                                    </option>
                                    <option value="Garment Load">
                                      Garment Load
                                    </option>
                                    <option value="Disinfectant Load">
                                      Disinfectant Load
                                    </option>
                                    <option value="Others">Others</option>
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    name="activity_name"
                                    id="performedBy"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                    value={
                                      nextAllowedActivity
                                        ? nextAllowedActivity.name
                                        : ""
                                    }
                                    required=""
                                    readOnly
                                  />
                                )}
                              </div>
                              {activityName && activityName === "Others" ? (
                                <div>
                                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Other Activity Name
                                  </label>
                                  <input
                                    type="text"
                                    name="other_activity_name"
                                    id="name"
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Type other activity name"
                                    required
                                  />
                                </div>
                              ) : null}
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Performed By
                                </label>
                                <input
                                  type="text"
                                  name="performed_by"
                                  id="performedBy"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  value={users.email}
                                  required=""
                                  readOnly
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Start Date & Time
                                </label>
                                <input
                                  type="text"
                                  name="start_time"
                                  id="performedBy"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  value={getCurrentTime()}
                                  required=""
                                  readOnly
                                />
                              </div>
                            </div>
                            {lists[selected].eqp_name === "Steam Sterilizer" ? (
                              <div className="px-12">
                                <p className="pb-8 text-sm font-medium text-gray-900 dark:text-white">
                                  Below activities to be completed every 24hrs
                                  for {lists[selected].eqp_name}
                                </p>
                                <ol className="relative text-gray-500 border-s border-gray-300 dark:border-gray-700 dark:text-gray-400">
                                  {lists[selected].activity_order.map(
                                    (activity, index) => (
                                      <li key={index} className="mb-10 ms-6">
                                        {currentActivity &&
                                        index <=
                                          lists[
                                            selected
                                          ].activity_order.findIndex(
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
                                        <h3 className="text-sm font-medium leading-tight pt-1.5 pl-2">
                                          {activity.name}
                                        </h3>
                                        {currentActivity &&
                                        currentActivity.hold_expiry &&
                                        activity.name ===
                                          nextAllowedActivity.name ? (
                                          <div className="text-sm font-medium leading-tight pt-1.5 pl-2">
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
                            ) : null}
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
                    Start Activity
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
                          Approving Activity for {lists[selected].eqp_name}
                        </DialogTitle>
                        <div className="mt-6 w-full">
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
                              onChange={handleRejectInputChange}
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
