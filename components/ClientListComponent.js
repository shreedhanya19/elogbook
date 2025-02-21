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
import SteamSterilizer from "./SteamSterilizer";
import MixingVessel from "./MixingVessel";

const ClientListComponent = ({ lists, user, id }) => {
  // console.log(id);
  // // QR Code Scanner Component --------------------------------------------------------------
  // const [qrResult, setQrResult] = useState(""); // Store QR code result
  // const [isScanning, setIsScanning] = useState(false); // Scanning state
  // const videoRef = useRef(null); // Reference to the video element
  // const scannerRef = useRef(null); // Reference to the ZXing scanner

  // const startScanner = async () => {
  //   if (isScanning) return; // Prevent multiple initializations
  //   setIsScanning(true);

  //   try {
  //     const scanner = new BrowserMultiFormatReader();
  //     scannerRef.current = scanner;

  //     // Get available video devices (cameras)
  //     const videoDevices = await navigator.mediaDevices.enumerateDevices();
  //     const videoDevice = videoDevices.find(
  //       (device) => device.kind === "videoinput"
  //     );

  //     if (videoDevice) {
  //       // If a camera is found, pass the device ID to the scanner
  //       await scanner.decodeFromVideoDevice(
  //         videoDevice.deviceId, // Use the deviceId for the selected camera
  //         videoRef.current, // Attach video feed
  //         (result, error) => {
  //           if (result) {
  //             setQrResult(result.getText()); // Update QR code result
  //             onQrResult(result.getText()); // Call the parent's callback with the result
  //             stopScanner(); // Stop scanning after successful result
  //           }
  //           if (error && error.name !== "NotFoundException") {
  //             console.warn(error.message); // Log non-critical errors
  //           }
  //         }
  //       );
  //     } else {
  //       console.error("No video input devices found");
  //       stopScanner();
  //     }
  //   } catch (error) {
  //     console.error("Error initializing scanner:", error);
  //     stopScanner();
  //   }
  // };

  // const stopScanner = () => {
  //   if (scannerRef.current) {
  //     scannerRef.current.reset(); // Stop the scanner
  //     scannerRef.current = null;
  //   }

  //   if (videoRef.current && videoRef.current.srcObject) {
  //     const stream = videoRef.current.srcObject;
  //     stream.getTracks().forEach((track) => track.stop()); // Stop the video feed
  //     videoRef.current.srcObject = null;
  //   }

  //   setIsScanning(false);
  // };

  // useEffect(() => {
  //   // Clean up resources when the component unmounts
  //   return () => stopScanner();
  // }, []);

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
    // const fetchActivities = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from("production_activities")
    //       .select("*")
    //       .eq("linked_eqp", lists[selected].tag_id)
    //       .order("start_time", { ascending: false });
    //     if (error) {
    //       throw error;
    //     }
    //     setAllActivities(data);

    //     if (
    //       !data.some(
    //         (dat) =>
    //           dat.activity_status === "In Progress" ||
    //           dat.approval_status === "Pending"
    //       )
    //     )
    //       setActivity(undefined);
    //     else {
    //       const filtered = data.filter(
    //         (activity) =>
    //           activity.activity_status === "In Progress" ||
    //           activity.approval_status === "Pending"
    //       );
    //       setActivity(filtered);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching activities:", err);
    //     return null;
    //   }
    // };
    // fetchActivities();
  }, []);

  useEffect(() => {
    // const fetchActivities = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from("production_activities")
    //       .select("*")
    //       .eq("linked_eqp", lists[selected].tag_id)
    //       .limit(1)
    //       .order("start_time", { ascending: false });
    //     if (error) {
    //       throw error;
    //     }
    //     setAllActivities(data);

    //     if (
    //       !data.some(
    //         (dat) =>
    //           dat.activity_status === "In Progress" ||
    //           dat.approval_status === "Pending"
    //       )
    //     )
    //       setActivity(undefined);
    //     else {
    //       const filtered = data.filter(
    //         (activity) =>
    //           activity.activity_status === "In Progress" ||
    //           activity.approval_status === "Pending"
    //       );
    //       setActivity(filtered);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching activities:", err);
    //     return null;
    //   }
    // };
    // fetchActivities();
    // setCurrentActivity(null);
    // setNextAllowedActivity(null);
    // setInProgress(null);
    localStorage.setItem("selectedEqp", selected);
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

  //     const nextIndex = currentIndex + 1;
  //     if (nextIndex <= lists[selected].activity_order.length - 1) {
  //       setNextAllowedActivity(lists[selected].activity_order[nextIndex]);
  //       setActivityName(lists[selected].activity_order[nextIndex].name);
  //       setFreeToSelect(false);
  //     } else {
  //       setFreeToSelect(true);
  //     }

  //     if (latestActivity.approval_status === "Pending") {
  //       setIsApproved(false);
  //     } else {
  //       setIsApproved(true);
  //     }

  //     if (ifId) {
  //       setOpen(true);
  //     }
  //   }

  //   const fetchLastDayActivity = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from("production_activities")
  //         .select("*")
  //         .eq("activity_name", "Bowie Dick")
  //         .order("id", { ascending: false })
  //         .limit(1);

  //       if (error) {
  //         throw error;
  //       }

  //       const latestRecord = data[0];

  //       const endTime = new Date(latestRecord.end_time); // Convert to Date object
  //       const now = new Date(); // Get current timestamp
  //       const differenceInHours = (now - endTime) / (1000 * 60 * 60); // Convert ms to hours
  //       const isExpired = differenceInHours >= 24; // Check if 24+ hours passed
  //       console.log(differenceInHours);
  //       if (
  //         isExpired &&
  //         currentActivity &&
  //         currentActivity.cycle_count <= data[0].cycle_count
  //       ) {
  //         setFreeToSelect(false);
  //         setCurrentActivity((prevState) => ({
  //           ...prevState, // Spread the previous state to retain other values
  //           activity_name: lists[selected].activity_order[0], // Update only the city key
  //         }));
  //         setNextAllowedActivity(lists[selected].activity_order[0]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching activities:", error);
  //       return null;
  //     }
  //   };
  //   fetchLastDayActivity();
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (
  //     nextAllowedActivity &&
  //     nextAllowedActivity.name === lists[selected].activity_order[0].name
  //   ) {
  //     try {
  //       const { data, error } = await supabase
  //         .from("production_activities") // Replace with your table name
  //         .insert({
  //           created_by: users.email,
  //           activity_name: nextAllowedActivity.name,
  //           activity_status: "In Progress",
  //           start_time: getCurrentTime(),
  //           product_name: productName,
  //           batch_no: batchNo,
  //           performed_by: users.email,
  //           approval_status: "Pending",
  //           linked_eqp: lists[selected].tag_id,
  //           // hold_expiry: getFutureTimestamp(
  //           //   lists[selected].activity_order[
  //           //     lists[selected].activity_order.findIndex(
  //           //       (activityq) => activityq.name === nextAllowedActivity.name
  //           //     )
  //           //   ].hold
  //           // ),
  //           hold_time: parseInt(
  //             lists[selected].activity_order[
  //               lists[selected].activity_order.findIndex(
  //                 (activityq) => activityq.name === nextAllowedActivity.name
  //               )
  //             ].hold
  //           ),
  //           cycle_count: parseInt(currentActivity.cycle_count) + 1,
  //         })
  //         .select();
  //       const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
  //       if (activityId) {
  //         // try {
  //         //   const { session, error2 } = await supabase
  //         //     .from("activity_sessions")
  //         //     .insert({
  //         //       activity_id: activityId,
  //         //       session_type: "Active",
  //         //       start_time: getCurrentTime(),
  //         //       performed_by: users.email,
  //         //     })
  //         //     .select();
  //         //   if (error2) {
  //         //     throw error2;
  //         //   }
  //         // } catch (err) {
  //         //   console.error(err.message);
  //         // }
  //         router.push(`./production/activity/${activityId}`); // Use router.push for redirection
  //       }

  //       if (error) {
  //         throw error;
  //       }
  //     } catch (err) {
  //       console.error(err.message);
  //     } finally {
  //     }
  //   } else if (freeToSelect) {
  //     try {
  //       const { data, error } = await supabase
  //         .from("production_activities") // Replace with your table name
  //         .insert({
  //           created_by: users.email,
  //           activity_name: activityName,
  //           activity_status: "In Progress",
  //           start_time: getCurrentTime(),
  //           product_name: productName,
  //           batch_no: batchNo,
  //           performed_by: users.email,
  //           approval_status: "Pending",
  //           linked_eqp: lists[selected].tag_id,
  //           // hold_expiry: getFutureTimestamp(
  //           //   lists[selected].activity_order[
  //           //     lists[selected].activity_order.findIndex(
  //           //       (activityq) => activityq.name === nextAllowedActivity.name
  //           //     )
  //           //   ].hold
  //           // ),
  //           // hold_time: parseInt(
  //           //   lists[selected].activity_order[
  //           //     lists[selected].activity_order.findIndex(
  //           //       (activityq) => activityq.name === nextAllowedActivity.name
  //           //     )
  //           //   ].hold
  //           // ),
  //           cycle_count: parseInt(currentActivity.cycle_count),
  //         })
  //         .select();
  //       const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
  //       if (activityId) {
  //         // try {
  //         //   const { session, error2 } = await supabase
  //         //     .from("activity_sessions")
  //         //     .insert({
  //         //       activity_id: activityId,
  //         //       session_type: "Active",
  //         //       start_time: getCurrentTime(),
  //         //       performed_by: users.email,
  //         //     })
  //         //     .select();
  //         //   if (error2) {
  //         //     throw error2;
  //         //   }
  //         // } catch (err) {
  //         //   console.error(err.message);
  //         // }
  //         router.push(`./production/activity/${activityId}`); // Use router.push for redirection
  //       }

  //       if (error) {
  //         throw error;
  //       }
  //     } catch (err) {
  //       console.error(err.message);
  //     } finally {
  //     }
  //   } else {
  //     try {
  //       const { data, error } = await supabase
  //         .from("production_activities") // Replace with your table name
  //         .insert({
  //           created_by: users.email,
  //           activity_name: nextAllowedActivity.name,
  //           activity_status: "In Progress",
  //           start_time: getCurrentTime(),
  //           product_name: productName,
  //           batch_no: batchNo,
  //           performed_by: users.email,
  //           approval_status: "Pending",
  //           linked_eqp: lists[selected].tag_id,
  //           // hold_expiry: getFutureTimestamp(
  //           //   lists[selected].activity_order[
  //           //     lists[selected].activity_order.findIndex(
  //           //       (activityq) => activityq.name === nextAllowedActivity.name
  //           //     )
  //           //   ].hold
  //           // ),
  //           hold_time: parseInt(
  //             lists[selected].activity_order[
  //               lists[selected].activity_order.findIndex(
  //                 (activityq) => activityq.name === nextAllowedActivity.name
  //               )
  //             ].hold
  //           ),
  //           cycle_count: parseInt(currentActivity.cycle_count),
  //         })
  //         .select();
  //       const activityId = data[0]?.id; // Assuming Supabase returns the id in the inserted record
  //       if (activityId) {
  //         // try {
  //         //   const { session, error2 } = await supabase
  //         //     .from("activity_sessions")
  //         //     .insert({
  //         //       activity_id: activityId,
  //         //       session_type: "Active",
  //         //       start_time: getCurrentTime(),
  //         //       performed_by: users.email,
  //         //     })
  //         //     .select();
  //         //   if (error2) {
  //         //     throw error2;
  //         //   }
  //         // } catch (err) {
  //         //   console.error(err.message);
  //         // }
  //         router.push(`./production/activity/${activityId}`); // Use router.push for redirection
  //       }

  //       if (error) {
  //         throw error;
  //       }
  //     } catch (err) {
  //       console.error(err.message);
  //     } finally {
  //     }
  //   }
  // };

  // const fetchActivities = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("production_activities")
  //       .select("*")
  //       .eq("linked_eqp", lists[selected].tag_id)
  //       .order("start_time", { ascending: false });
  //     if (error) {
  //       throw error;
  //     }
  //     setAllActivities(data);

  //     if (
  //       !data.some(
  //         (dat) =>
  //           dat.activity_status === "In Progress" ||
  //           dat.approval_status === "Pending"
  //       )
  //     )
  //       setActivity(undefined);
  //     else {
  //       const filtered = data.filter(
  //         (activity) =>
  //           activity.activity_status === "In Progress" ||
  //           activity.approval_status === "Pending"
  //       );
  //       setActivity(filtered);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching activities:", err);
  //     return null;
  //   }
  // };

  // const fetchOnlyActivities = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("production_activities")
  //       .select("*")
  //       .eq("linked_eqp", lists[selected].tag_id)
  //       .order("start_time", { ascending: false });
  //     if (error) {
  //       throw error;
  //     }
  //     setAllActivities(data);
  //   } catch (err) {
  //     console.error("Error fetching activities:", err);
  //   }
  // };

  // const handleApprove = async (value) => {
  //   console.log("Function received:", value);
  //   try {
  //     const myId = await selectedActivity;
  //     if (value === "Approved") {
  //       const { data, error } = await supabase
  //         .from("production_activities") // Replace with your table name
  //         .update({
  //           approved_by: users.email,
  //           approved_at: getCurrentTime(),
  //           approval_status: value,
  //           updated_at: getCurrentTime(),
  //           updated_by: users.email,
  //         })
  //         .eq("id", selectedActivity.id);

  //       if (error) {
  //         throw error;
  //       }
  //       setApproveOpen(false);
  //     } else {
  //       const { data, error } = await supabase
  //         .from("production_activities") // Replace with your table name
  //         .update({
  //           rejected_by: users.email,
  //           rejected_at: getCurrentTime(),
  //           rejected_reason: formData.rejection_reason,
  //           approval_status: value,
  //           updated_at: getCurrentTime(),
  //           updated_by: users.email,
  //         })
  //         .eq("id", selectedActivity.id);

  //       if (error) {
  //         throw error;
  //       }
  //       setRejectOpen(false);
  //     }
  //     fetchActivities();
  //   } catch (err) {
  //     console.error(err.message);
  //   } finally {
  //   }
  // };

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
                    className={`p-3 sm:py-4 cursor-pointer ${selected === index ? " bg-yellow-50 rounded-lg" : ""}`}
                    onClick={() => handleClick(index)}
                  >
                    <div className="flex items-center border-b-black">
                      <div className={`flex-shrink-0 `}>
                        <Shapes
                          color={selected === index ? "#713f12" : "#A9A9A9"}
                          size={28}
                        />
                      </div>
                      <div className="flex-1 min-w-0 ms-4">
                        <p
                          className={`text-md ${selected === index ? "font-bold text-yellow-900" : "font-medium"}  truncate dark:text-white`}
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
        <div className="relative w-full">
          {/* Right Section: 75% Width */}
          {lists[selected] &&
          lists[selected].eqp_name === "Steam Sterilizer" ? (
            <SteamSterilizer eqp={lists[selected]} user={user} />
          ) : null}
          {lists[selected] &&
          lists[selected].eqp_name.includes("Mixing Vessel") ? (
            <MixingVessel eqp={lists[selected]} user={user} />
          ) : null}
        </div>
      </div>
      {/* Modal */}

      {/* Hold Time Expired Modal */}
    </div>
  );
};

export default ClientListComponent;
