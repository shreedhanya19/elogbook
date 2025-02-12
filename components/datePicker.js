import { useEffect, useId, useRef, useState } from "react";

import { format, isValid, parse } from "date-fns";
import { DayPicker } from "react-day-picker";

export function DatePicker({ context, onStateChange }) {
  const dialogRef = useRef(null);
  const dialogId = useId();
  const headerId = useId();

  // Hold the month in state to control the calendar when the input changes
  const [month, setMonth] = useState(new Date());

  // Hold the selected date in state
  const [selectedDate, setSelectedDate] = useState(undefined);

  // Hold the input value in state
  const [inputValue, setInputValue] = useState("");

  // Hold the dialog visibility in state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to toggle the dialog visibility
  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  // Hook to handle the body scroll behavior and focus trapping.
  useEffect(() => {
    const handleBodyScroll = (isOpen) => {
      document.body.style.overflow = isOpen ? "hidden" : "";
    };
    if (!dialogRef.current) return;
    if (isDialogOpen) {
      handleBodyScroll(true);
      dialogRef.current.showModal();
    } else {
      handleBodyScroll(false);
      dialogRef.current.close();
    }
    return () => {
      handleBodyScroll(false);
    };
  }, [isDialogOpen]);

  const handleDayPickerSelect = (date) => {
    if (!date) {
      setInputValue("");
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
      setInputValue(format(date, "dd/MM/yyyy"));
      onStateChange(format(date, "dd/MM/yyyy"));
    }
    dialogRef.current?.close();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // keep the input value in sync
    onStateChange(e.target.value);
    const parsedDate = parse(e.target.value, "dd/MM/yyyy", new Date());

    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
      setMonth(parsedDate);
    } else {
      setSelectedDate(undefined);
    }
  };

  return (
    <div>
      <input
        className="border border-gray-300 w-32 px-2 text-center py-2 rounded-lg text-sm"
        id="date-input"
        type="text"
        value={inputValue}
        placeholder={"dd/MM/yyyy"}
        onChange={handleInputChange}
        onClick={toggleDialog}
      />{" "}
      <dialog
        className="p-3 rounded-lg"
        role="dialog"
        ref={dialogRef}
        id={dialogId}
        aria-modal
        aria-labelledby={headerId}
        onClose={() => setIsDialogOpen(false)}
      >
        <span>
          {context === "start" ? "Select Start Date" : "Select End Date"}
        </span>
        <DayPicker
          className=""
          month={month}
          onMonthChange={setMonth}
          autoFocus
          mode="single"
          selected={selectedDate}
          onSelect={handleDayPickerSelect}
        />
      </dialog>
    </div>
  );
}
