import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ErrorDiv, YearPicker } from "../components";
import CTAButton from "../components/CTAButton";
import { SyncLoader } from "react-spinners";
import { FaCaretDown } from "react-icons/fa6";
dayjs.extend(utc);

// To show flags for the drivers
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "flag-icons/css/flag-icons.min.css";

// Register the locale for the countries constructor
countries.registerLocale(enLocale);

// Get URL Params
import { useParams } from "react-router-dom";

// Navigate Programatically
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const navigate = useNavigate();
  const { year: urlYear } = useParams();
  const [year, setYear] = useState();
  const [userSelectedYear, setUserSelectedYear] = useState();
  const [displayYear, setDisplayYear] = useState();
  const [schedule, setSchedule] = useState([]);
  const [invalidYear, setInvalidYear] = useState(false);
  const [invalidURL, setInvalidURL] = useState(false);

  // Query function to fetch drivers for each year
  const {
    data,
    refetch: fetchSchedule,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schedule", year],
    queryFn: () => {
      return axiosInstance.post("/getSchedule", {
        year: year,
      });
    },
    enabled: false,
    staleTime: Infinity,
  });

  // Scroll to top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Set Schedule for the current year into the state
  useEffect(() => {
    if (data?.data?.schedule) {
      setSchedule(data?.data?.schedule?.schedule?.raceschedule);
      setDisplayYear(data?.data?.schedule?.year);
    }
  }, [data?.data]);

  // If year is present
  useEffect(() => {
    if (urlYear) {
      // Valid Year in URL param
      if (
        urlYear &&
        !Number.isNaN(urlYear) &&
        parseInt(urlYear) >= 1950 &&
        parseInt(urlYear) <= 2024
      ) {
        setYear(parseInt(urlYear));
        setInvalidURL(false);
      } else {
        console.log("Invalid year specified");
        setInvalidURL(true);
      }
    } else {
      setYear(2024);
    }
  }, [urlYear]);

  // Fetch data for initial load
  useEffect(() => {
    if (year) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSchedule, year]);

  return (
    <main className="bg-greyBG flex justify-center py-10 rounded-lg">
      <section className="w-full max-w-[96%] rounded px-2 py-5 shadow bg-white">
        {/* Input section */}
        <header className="flex flex-wrap items-center gap-x-5 gap-y-5 p-5 pb-10">
          <div className="flex flex-wrap w-full md:w-fit items-center gap-x-2 md:gap-x-5 gap-y-5">
            <span className="w-full md:w-fit text-lg italic">
              Select Year :
            </span>
            <YearPicker
              className="w-full md:w-fit"
              setInvalidYear={setInvalidYear}
              setYear={setUserSelectedYear}
            />
          </div>

          <CTAButton
            className="w-full md:w-fit py-2 px-6 border-2 rounded"
            disabled={isLoading || invalidYear || !userSelectedYear}
            onClick={() => {
              navigate(`/schedule/${userSelectedYear}`);
            }}
            text="Fetch"
          ></CTAButton>

          {isLoading && (
            <div className="w-full md:w-fit flex justify-center">
              <SyncLoader />
            </div>
          )}
        </header>

        {/* Invalid year error  */}
        <div
          className={`text-red-600 font-medium px-5 overflow-hidden  ${
            invalidYear ? "h-14" : "h-0"
          } transition-all`}
        >
          Year must be between 1950 & 2024
        </div>

        <h1 className="text-4xl py-5 border-t-4 border-r-4 border-black rounded-xl font-semibold px-2">
          F1 Schedule {displayYear}
        </h1>

        {/* Data unavailable */}
        {error && error?.response?.status == 404 && (
          <div className="py-20 flex justify-center items-center">
            <ErrorDiv text="Schedule data for the requested year is not available." />
          </div>
        )}

        {/* Server error */}
        {error && error?.response?.status != 404 && (
          <div className="py-20 flex justify-center items-center">
            <ErrorDiv />
          </div>
        )}

        {/* Invalid param in URL */}
        {!year && invalidURL && (
          <div className="py-20 flex justify-center items-center">
            <ErrorDiv text="Invalid Year specified in URL." />
          </div>
        )}

        {/* Timeline */}
        {!error && schedule.length > 0 && (
          <>
            <div className="flex flex-col px-5 gap-y-5 py-10 overflow-x-auto">
              {schedule?.map((race, i) => {
                const countryCode = countries.getAlpha2Code(
                  race?.circuit?.location?.country,
                  "en"
                );

                let dateTime;
                if (race?.time) {
                  dateTime = dayjs(`${race.date}T${race.time}`);
                } else {
                  dateTime = dayjs(`${race.date}`);
                }

                console.log(race?.date);
                console.log(race?.time);

                return (
                  <div key={race?.date} className="flex gap-x-5">
                    <div className="flex flex-col items-center">
                      <div className="p-4 border-cta rounded-full border-4" />
                      {i + 1 != schedule.length && (
                        <>
                          <div className="h-full w-[1px] border-2 border-cta" />
                          <FaCaretDown className="h-10" />
                        </>
                      )}
                    </div>
                    <div className="flex-1 md:flex-none">
                      <p className="font-medium text-2xl">{race?.raceName}</p>
                      <div className="mt-2 flex flex-col gap-y-4">
                        <p className="text-lg">Round : {race?.round}</p>
                        <p>
                          {" "}
                          Location : {race?.circuit?.location?.locality},{" "}
                          {race?.circuit?.location?.country}
                          <span
                            className={`mx-2 fi fi-${countryCode?.toLowerCase()}`}
                          ></span>
                        </p>
                        {race?.date && (
                          <p>Date: {dateTime.format("DD MMMM YYYY")}</p>
                        )}

                        {race?.time && (
                          <p>Time: {dateTime.format("HH:mm:ss")}</p>
                        )}

                        {new Date() > new Date(dateTime) && (
                          <>
                            <div className="flex flex-wrap gap-x-2 gap-y-4">
                              <CTAButton
                                onClick={() => {
                                  navigate(
                                    `/qualifying-result/${displayYear}/${race?.round}`
                                  );
                                }}
                                text="
                              Qualifying"
                              ></CTAButton>
                              <CTAButton
                                onClick={() => {
                                  navigate(
                                    `/race-result/${displayYear}/${race?.round}`
                                  );
                                }}
                                text="
                              Race"
                              ></CTAButton>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Loading placeholder */}
        {!invalidURL &&
          !error &&
          schedule.length == 0 &&
          Array(10)
            .fill(null)
            ?.map((_, i) => {
              return (
                <div key={i} className="flex gap-x-5 mt-3">
                  <div className="flex flex-col  items-center">
                    <div className="p-4 border-cta rounded-full border-4" />
                    {i + 1 != schedule.length && (
                      <>
                        <div className="h-full w-[1px] border-2 border-cta" />
                        <FaCaretDown className="h-10" />
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="w-40 h-8 bg-gray-300 animate-pulse rounded font-medium text-2xl"></div>
                    <div className="mt-2 flex flex-col gap-y-2">
                      <div className="w-40 h-5 bg-gray-300 animate-pulse rounded"></div>
                      <div className="flex gap-x-3">
                        <div className="w-40 h-5 bg-gray-300 animate-pulse rounded" />
                        <div className="w-10 h-5 bg-gray-300 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="w-40 h-5 bg-gray-300 animate-pulse rounded" />
                    <div className="w-40 h-5 bg-gray-300 animate-pulse rounded" />
                  </div>
                </div>
              );
            })}
      </section>
    </main>
  );
};

export default Schedule;
