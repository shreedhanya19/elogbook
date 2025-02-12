"use client";

import { redirect } from "next/dist/server/api-utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook

export default function CustomLayout({
  leftContent,
  topRightContent,
  bottomRightContent,
  user,
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [eqpDropdown, setEqpDropdown] = useState(false);
  const [areaDropdown, setAreaDropdown] = useState(false);
  const [calDropdown, setCalDropdown] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true after component mounts
  }, []);

  if (!isClient) {
    return null; // This ensures that the component doesn't render on the server
  }

  const handleButtonClick = (event, route) => {
    event.preventDefault(); // Prevent any default action that might be triggering the routing automatically
    router.push(route); // Redirect to the provided route
  };

  return (
    <div className="flex w-full h-screen gap-6">
      {/* Left Section: 25% Width */}
      <div className="w-1/4 h-full shadow-md p-6 border border-gray-200 rounded-lg">
        {leftContent}
      </div>

      {/* Right Section: 75% Width */}
      <div className="flex flex-col w-3/4 h-full gap-6">
        {/* Top Right Section: 25% Height */}
        <div className="h-40 flex flex-col  shadow-md p-6 border border-gray-200 rounded-lg">
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-teal-900">
            Log Books
          </h5>
          {/* Buttons */}
          <div className="flex space-x-4 mt-4 z-50">
            {/* <button
              onClick={(e) => handleButtonClick(e, "/protected/production")}
              className="w-1/4 h-32 bg-teal-300 text-lg text-teal-900 font-semibold px-4 py-2 rounded hover:bg-teal-400 hover:font-bold"
            >
              Equipment LogBook
            </button> */}
            <div>
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdownEqp"
                className="text-amber-900 font-semibold h-16 bg-amber-200 hover:bg-amber-300 focus:ring-4 focus:outline-none focus:ring-amber-300 rounded-lg  px-12 py-2.5 text-center inline-flex items-center dark:bg-amber-600 dark:hover:bg-amber-200 dark:focus:ring-amber-800"
                type="button"
                onClick={(e) =>
                  !eqpDropdown ? setEqpDropdown(true) : setEqpDropdown(false)
                }
              >
                Equipment LogBook
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                id="dropdownEqp"
                className={`z-10 ${!eqpDropdown ? "hidden" : ""} bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 `}
              >
                <ul
                  className="py-2 text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="/protected/production"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Production
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Quality Assurance
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Research & Development
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Microbiology
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdownArea"
                className="text-green-900 h-16 font-semibold bg-green-200 hover:bg-green-300 focus:ring-4 focus:outline-none focus:ring-green-300  rounded-lg  px-12 py-2.5 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-200 dark:focus:ring-green-800"
                type="button"
                onClick={(e) =>
                  !areaDropdown ? setAreaDropdown(true) : setAreaDropdown(false)
                }
              >
                Area Cleaning LogBook
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                id="dropdownArea"
                className={`z-10 ${!areaDropdown ? "hidden" : ""} bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
              >
                <ul
                  className="py-2 text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="/protected/area/production"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Production
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Quality Assurance
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Research & Development
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Microbiology
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdownCal"
                className="text-purple-900 h-16 font-semibold bg-purple-200 hover:bg-purple-300 focus:ring-4 focus:outline-none focus:ring-purple-300  rounded-lg  px-12 py-2.5 text-center inline-flex items-center dark:bg-purple-600 dark:hover:bg-purple-200 dark:focus:ring-purple-800"
                type="button"
                onClick={(e) =>
                  !calDropdown ? setCalDropdown(true) : setCalDropdown(false)
                }
              >
                Calibration LogBook
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                id="dropdownCal"
                className={`z-10 ${!calDropdown ? "hidden" : ""} bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
              >
                <ul
                  className="py-2 text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="/protected/calibration/production"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Production
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Quality Assurance
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Research & Development
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-teal-900"
                    >
                      Microbiology
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right Section: Remaining Height */}
        <div className="flex-1 shadow-md p-6 border border-gray-200 rounded-lg">
          {bottomRightContent}
        </div>
      </div>
    </div>
  );
}
