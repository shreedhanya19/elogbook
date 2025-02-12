import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import CustomLayout from "../../components/customLayout";
import QRScanner from "../../components/QRScanner";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <CustomLayout
      user={user}
      leftContent={
        <div>
          <QRScanner />
        </div>
      }
      topRightContent={<div></div>}
      bottomRightContent={
        <div>
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            Notifications & Reminders
          </h5>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div
              id="alert-additional-content-4"
              className="p-4 text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="shrink-0 w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <h3 className="text-lg font-medium">Calibration Due!</h3>
              </div>

              <p className="mt-2">
                Equipment Name : <strong>Sterile Mixer 1</strong>
              </p>
              <p>
                Equipment ID : <strong>PR-SM-001</strong>
              </p>
              <p>
                Calibration Due Date : <strong>01-02-2025</strong>
              </p>
              <div className="flex">
                <button
                  type="button"
                  className="text-white mt-4 bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg  px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-yellow-300 dark:text-gray-800 dark:hover:bg-yellow-400 dark:focus:ring-yellow-800"
                >
                  <svg
                    className="me-2 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 14"
                  >
                    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  Go to task
                </button>
                <button
                  type="button"
                  className="text-yellow-800 mt-4 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg  px-3 py-1.5 text-center dark:hover:bg-yellow-300 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-gray-800 dark:focus:ring-yellow-800"
                  data-dismiss-target="#alert-additional-content-4"
                  aria-label="Close"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div
              id="alert-additional-content-4"
              className="p-4 text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="shrink-0 w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <h3 className="text-lg font-medium">Calibration Due!</h3>
              </div>

              <p className="mt-2">
                Equipment Name : <strong>Weighing Balance 7</strong>
              </p>
              <p>
                Equipment ID : <strong>PR-WB-007</strong>
              </p>
              <p>
                Calibration Due Date : <strong>02-02-2025</strong>
              </p>
              <div className="flex">
                <button
                  type="button"
                  className="text-white mt-4 bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg  px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-yellow-300 dark:text-gray-800 dark:hover:bg-yellow-400 dark:focus:ring-yellow-800"
                >
                  <svg
                    className="me-2 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 14"
                  >
                    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  Go to task
                </button>
                <button
                  type="button"
                  className="text-yellow-800 mt-4 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg  px-3 py-1.5 text-center dark:hover:bg-yellow-300 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-gray-800 dark:focus:ring-yellow-800"
                  data-dismiss-target="#alert-additional-content-4"
                  aria-label="Close"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div
              id="alert-additional-content-4"
              className="p-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-800"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="shrink-0 w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <h3 className="text-lg font-medium">Calibration Overdue!</h3>
              </div>

              <p className="mt-2">
                Equipment Name : <strong>Autoclave 3</strong>
              </p>
              <p>
                Equipment ID : <strong>PR-ACL-003</strong>
              </p>
              <p>
                Calibration Due Date : <strong>26-01-2025</strong>
              </p>
              <div className="flex">
                <button
                  type="button"
                  className="text-white mt-4 bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg  px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-yellow-300 dark:text-gray-800 dark:hover:bg-yellow-400 dark:focus:ring-yellow-800"
                >
                  <svg
                    className="me-2 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 14"
                  >
                    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                  Go to task
                </button>
                <button
                  type="button"
                  className="text-red-800 mt-4 bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg  px-3 py-1.5 text-center dark:hover:bg-red-300 dark:border-red-300 dark:text-red-300 dark:hover:text-gray-800 dark:focus:ring-red-800"
                  data-dismiss-target="#alert-additional-content-4"
                  aria-label="Close"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
