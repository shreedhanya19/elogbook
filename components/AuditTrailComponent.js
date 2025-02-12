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
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import AuditTrailPDF from "./pdfRenderer"; // Your PDF component
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { DatePicker } from "./datePicker";

const AuditTrailComponent = ({ equipment, user }) => {
  const [equipments, setEquipments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const [activity, setActivity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();
  const [startDateSelected, setStartDateSelected] = useState();
  const [endDateSelected, setEndDateSelected] = useState();
  const [filter, setFilter] = useState(false);
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const menuRef = useRef(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);

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

  function convertDateFormat(dateStr) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }

  const handleStartDatePicker = (newDate) => {
    setStartDateSelected(newDate);
  };

  const handleEndDatePicker = (newDate) => {
    setEndDateSelected(newDate);
  };

  const handleFilter = async () => {
    if (filter) {
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
      setFilter(false);
    } else {
      const startDate = startDateSelected;
      const endDate = endDateSelected;
      console.log(
        "start_time",
        `[${convertDateFormat(startDate)} 00:00,${convertDateFormat(endDate)} 00:00)`
      );

      try {
        const { data, error } = await supabase
          .from("production_activities")
          .select("*")
          .eq("linked_eqp", equipment[0].tag_id)
          .gte("start_time", `${convertDateFormat(startDate)}`)
          .lte("start_time", `${convertDateFormat(endDate)}`)
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
      setFilter(true);
    }
  };

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

  const sortActivityArray = (selectedValue) => {
    console.log("Selected Value:", selectedValue);
    let sortedArray = [...activity];
    if (selectedValue === "start_time") {
      sortedArray = sortedArray.sort((a, b) => {
        return new Date(b.start_time) - new Date(a.start_time);
      });
    } else if (selectedValue === "end_time") {
      sortedArray = sortedArray.sort((a, b) => {
        return new Date(b.end_time) - new Date(a.end_time);
      });
    } else if (selectedValue === "activity_name") {
      sortedArray = sortedArray.sort((a, b) => {
        return b.activity_name.localeCompare(a.activity_name);
      });
    } else if (selectedValue === "activity_status") {
      sortedArray = sortedArray.sort((a, b) => {
        return b.activity_status.localeCompare(a.activity_status);
      });
    } else if (selectedValue === "started_by") {
      sortedArray = sortedArray.sort((a, b) => {
        return b.performed_by.localeCompare(a.performed_by);
      });
    }
    console.log("Sorted Array:", sortedArray);
    setActivity(sortedArray);
  };

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

  const toggleMenu = (rowId) => {
    setOpenMenuRow(openMenuRow === rowId ? null : rowId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuRow(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [editFormData, setEditFormData] = useState({
    product_name: "",
    batch_no: "",
    activity_name: "",
    performed_by: "",
    start_time: "",
    end_time: "",
    remarks: "",
    edit_reason: "",
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //write a function to compute the differences between the original and edited data
  const edited_data = (original, edited) => {
    const diff = Object.keys(original).reduce((diff, key) => {
      if (original[key] === edited[key]) return diff;
      return {
        ...diff,
        [key]: edited[key],
      };
    }, {});
    return diff;
  };

  const handleEdit = async () => {
    try {
      const { data, error } = await supabase
        .from("production_activities")
        .update({
          product_name: editFormData.product_name,
          batch_no: editFormData.batch_no,
          performed_by: editFormData.performed_by,
          start_time: editFormData.start_time,
          end_time: editFormData.end_time,
          remarks: editFormData.remarks,
          updated_at: getCurrentTime(),
          updated_by: user.email,
          edit_metadata: {
            edited_data: edited_data(originalFormData, editFormData),
            edited_by: user.email,
            reason: editFormData.edit_reason,
            edited_at: getCurrentTime(),
          },
          edited: true,
        })
        .eq("id", activity[editRow].id);

      if (error) {
        throw error;
      }
      setEditModalOpen(false);
      fetchActivities();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="overflow-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-700 bg-slate-100 rounded-full pr-4 pl-2 py-1 flex mb-4"
      >
        <ChevronLeft className="h-5" />
        Back to Equipment Logs
      </button>
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

            <div className="relative overflow-x-auto z-10">
              <div className="flex items-center justify-start">
                <h4 className="text-xl font-bold leading-none text-gray-900 dark:text-white mt-6 mb-6 mr-10">
                  Audit Trail
                </h4>
                <div className="flex items-center justify-end">
                  <p className="text-sm">Sort By</p>
                  <form className="pl-4 max-w-sm mx-auto">
                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={(e) => sortActivityArray(e.target.value)}
                    >
                      <option value="start_time">Start Time</option>
                      <option value="end_time">End Time</option>
                      <option value="activity_name">Activity Name</option>
                      <option value="activity_status">Activity Status</option>
                      <option value="started_by">Started By</option>
                    </select>
                  </form>
                  <p className="mx-10 text-sm">or</p>
                  <p className="mr-5 text-sm">Filter by Date Range</p>
                  <DatePicker
                    context="start"
                    onStateChange={handleStartDatePicker}
                  />
                  <span className="px-3">to</span>
                  <DatePicker
                    context="end"
                    onStateChange={handleEndDatePicker}
                  />
                </div>
                <button
                  type="button"
                  className="ml-4 text-white bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={() => handleFilter()}
                >
                  {!filter ? (
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  ) : (
                    "Clear Filter"
                  )}
                </button>
                <div className="justify-end">
                  {activity && activity.length > 0 && !filter ? (
                    <PDFDownloadLink
                      document={
                        <AuditTrailPDF
                          data={activity}
                          linkedEqp={equipment[0].eqp_name}
                        />
                      }
                      fileName="audit-trail.pdf"
                      className="bg-red-500 p-2  rounded-lg text-white text-sm font-bold ml-12 "
                    >
                      {({ loading }) =>
                        loading ? "Loading document..." : "Download PDF"
                      }
                    </PDFDownloadLink>
                  ) : null}
                </div>
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
                    <th scope="col" className="px-2 py-3">
                      Options
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
                        <td className=" relative py-3 min-w-[140px]">
                          {act.edited ? (
                            <div className="absolute text-xl z-99 text-red-700 font-bold">
                              <span>*</span>
                            </div>
                          ) : null}
                          <span className="pl-4">
                            {getDateFromTimestamp(act.start_time)}
                          </span>
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
                        <td className="px-2 py-3 max-w-[150px]">
                          {act.remarks}
                        </td>
                        <td className="flex px-2 justify-end align-middle items-center mt-2 relative">
                          <button
                            id="dropdownMenuIconButton"
                            data-dropdown-toggle="dropdownDots"
                            className="items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            type="button"
                            onClick={() => {
                              toggleMenu(index);
                              setEditRow(index);
                              setEditFormData({ ...act });
                              setOriginalFormData({ ...act });
                            }}
                          >
                            <svg
                              className="w-3 h-4"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 4 15"
                            >
                              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                            </svg>
                          </button>
                          {openMenuRow === index && (
                            <div
                              ref={menuRef}
                              id="dropdownDots"
                              className={`absolute right-0 border border-gray-200 shadow-md z-10 top-5 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 dark:divide-gray-600`}
                            >
                              <ul
                                className="py-2 text-gray-700 dark:text-gray-200"
                                aria-labelledby="dropdownMenuIconButton"
                              >
                                <li>
                                  <a
                                    onClick={() => setEditModalOpen(true)}
                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    Edit Record
                                  </a>
                                </li>
                              </ul>
                            </div>
                          )}
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
      {/* Edit Record Modal */}
      <Dialog
        open={editModalOpen}
        onClose={setEditModalOpen}
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
                      Editing Record
                    </DialogTitle>
                    <div
                      className="bg-orange-100 border-l-4 text-sm border-orange-500 text-orange-700 p-3 mt-4"
                      role="alert"
                    >
                      <p className="font-bold">Be Warned</p>
                      <p>
                        Editing logs will mark this record as modified and the
                        same will be reflected in the audit trail
                      </p>
                    </div>
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
                              id="product_name"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].product_name
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Batch No / Protocol No
                            </label>
                            <input
                              type="text"
                              name="batch_no"
                              id="batch_no"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].batch_no
                              }
                              onChange={handleEditChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Activity Name
                            </label>
                            <input
                              type="text"
                              name="activity_name"
                              id="activity_name"
                              value={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].activity_name
                              }
                              readOnly
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Performed By
                            </label>
                            <input
                              type="text"
                              name="performed_by"
                              id="performed_by"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].performed_by
                              }
                              onChange={handleEditChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Start Date & Time
                            </label>
                            <input
                              type="text"
                              name="start_time"
                              id="start_time"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].start_time
                              }
                              onChange={handleEditChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              End Date & Time
                            </label>
                            <input
                              type="text"
                              name="end_time"
                              id="end_time"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].end_time
                              }
                              onChange={handleEditChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Remarks
                            </label>
                            <input
                              type="text"
                              name="remarks"
                              id="remarks"
                              defaultValue={
                                !activity
                                  ? "..."
                                  : !editRow
                                    ? "..."
                                    : activity[editRow].remarks
                              }
                              onChange={handleEditChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block mb-2 text-sm font-bold text-red-900 dark:text-white">
                              Edit Reason
                            </label>
                            <input
                              type="text"
                              name="edit_reason"
                              onChange={handleEditChange}
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
                  onClick={() => handleEdit()}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Edit Record
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setEditModalOpen(false)}
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
