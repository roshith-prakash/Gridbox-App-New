import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PropTypes from "prop-types";

// To get country from nationality
import { nationalityMap } from "../data/nationalityToCountry";

// To show flags for the standings
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import "flag-icons/css/flag-icons.min.css";

// Register the locale for the countries constructor
countries.registerLocale(enLocale);

// To be displayed on Mobile screens
const DriverPositionCard = ({ item }) => {
  const driverCountry = nationalityMap[item?.driver?.nationality];
  const driverCountryCode = countries.getAlpha2Code(driverCountry, "en");

  const constructorCountry = nationalityMap[item?.constructor?.nationality];
  const constructorCountryCode = countries.getAlpha2Code(
    constructorCountry,
    "en"
  );

  return (
    <div className="flex flex-col divide-y-2 divide-gray-100 border-2 w-full max-w-[95%] rounded-lg shadow-lg">
      <p className="text-lg px-5 font-medium py-3 flex gap-x-3 bg-gray-100">
        {item?.position}.{" "}
        <span>
          {item?.driver?.givenName} {item?.driver?.familyName}
        </span>
        <span
          className={`mx-2 fi fi-${driverCountryCode?.toLowerCase()}`}
        ></span>
      </p>
      <div className="flex justify-between px-5 py-3 font-medium">
        <p>
          Status : <span>{item?.status}</span>
        </p>
        <p>
          Points : <span>{item?.points}</span>
        </p>
      </div>
      <p className="px-5 py-3">
        Constructor : {item?.constructor?.name}{" "}
        <span
          className={`mx-2 fi fi-${constructorCountryCode?.toLowerCase()}`}
        ></span>
      </p>
      <p
        className={`px-5 py-3 ${
          item?.fastestLap?.rank == 1 && "bg-purple-200"
        }`}
      >
        Fastest Lap : {item?.fastestLap?.time?.time}
      </p>

      <p className="px-5 py-3">
        Time : {item?.time?.time ? item?.time?.time : "---"}
      </p>
    </div>
  );
};

DriverPositionCard.propTypes = {
  item: PropTypes.shape({
    driver: PropTypes.object,
    constructor: PropTypes.object,
    fastestLap: PropTypes.object,
    time: PropTypes.object,
    status: PropTypes.string,
    position: PropTypes.number,
    points: PropTypes.number,
    wins: PropTypes.number,
  }).isRequired,
};

const RaceResult = () => {
  const [year, setYear] = useState(2024);
  const [round, setRound] = useState(2);
  const [displayYear, setDisplayYear] = useState(2024);
  const [displayRound, setDisplayRound] = useState(2);
  const [standings, setStandings] = useState([]);

  // Query function to fetch standings for each year
  const {
    data,
    refetch: fetchRaceResult,
    isLoading,
  } = useQuery({
    queryKey: ["raceResult", year, round],
    queryFn: () => {
      return axiosInstance.post("/getRaceResult", {
        year: year,
        round: round,
      });
    },
    enabled: false,
    staleTime: Infinity,
  });

  // Set standings for the current year into the state
  useEffect(() => {
    if (data?.data?.result) {
      setStandings(data?.data?.result?.result?.result);
      setDisplayYear(data?.data?.result?.year);
      setDisplayRound(data?.data?.result?.round);
    } else {
      console.log("No data received");
    }
  }, [data?.data]);

  useEffect(() => {
    fetchRaceResult();
  }, [fetchRaceResult]);

  console.log(data?.data);
  console.log(standings);

  return (
    <>
      <div className="flex flex-wrap gap-x-5 gap-y-5 p-5">
        <input
          type="number"
          value={year}
          disabled={isLoading}
          onChange={(e) => setYear(e.target.value)}
          className="border-2 rounded"
        ></input>
        <input
          type="number"
          value={round}
          disabled={isLoading}
          onChange={(e) => setRound(e.target.value)}
          className="border-2 rounded"
        ></input>
        <button disabled={isLoading} onClick={fetchRaceResult}>
          Fetch
        </button>
      </div>

      {isLoading && <p>Fetching standings...</p>}
      {/* Show driver name and country when driver data is present */}
      {standings.length > 0 && (
        <>
          <p className="text-2xl font-semibold px-2">
            Race result for the {displayRound} round of the {displayYear} season
            :
          </p>
          <div className="hidden md:flex justify-center py-10 overflow-x-auto">
            <table className="rounded-lg w-full lg:max-w-[95%] overflow-hidden bg-white shadow-lg">
              <TableHeader>
                <TableRow className="text-left bg-gray-100">
                  <TableHead className="py-6">Position</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Constructor</TableHead>
                  <TableHead>Grid</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Fastest Lap</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings?.map((item, i) => {
                  const driverCountry =
                    nationalityMap[item?.driver?.nationality];
                  const driverCountryCode = countries.getAlpha2Code(
                    driverCountry,
                    "en"
                  );

                  const constructorCountry =
                    nationalityMap[item?.constructor?.nationality];
                  const constructorCountryCode = countries.getAlpha2Code(
                    constructorCountry,
                    "en"
                  );

                  return (
                    <TableRow
                      className={`text-left border-b-2 border-gray-100 ${
                        item?.fastestLap?.rank == 1 && "bg-purple-300"
                      }`}
                      key={item.position}
                    >
                      <TableCell className="font-medium py-3 px-3 md:w-[5em] text-center">
                        {i + 1}.
                      </TableCell>
                      <TableCell className="px-2 w-fit">
                        <span
                          className={`mx-2 fi fi-${driverCountryCode?.toLowerCase()}`}
                        ></span>
                        {item?.driver?.givenName} {item?.driver?.familyName} (
                        {item?.number})
                      </TableCell>

                      <TableCell className="px-2">
                        <span
                          className={`mx-2 fi fi-${constructorCountryCode?.toLowerCase()}`}
                        ></span>
                        {item?.constructor?.name}
                      </TableCell>
                      <TableCell className="gap-x-2 px-2 text-nowrap">
                        {item?.grid}
                      </TableCell>
                      <TableCell className="gap-x-2 px-2 text-nowrap">
                        {item?.points}
                      </TableCell>
                      <TableCell className="px-2 text-nowrap">
                        {item?.status}
                      </TableCell>
                      <TableCell className="px-2 text-nowrap text-center">
                        {item?.fastestLap?.time?.time}
                      </TableCell>
                      <TableCell className="px-2 text-nowrap text-center">
                        {item?.time?.time ? item?.time?.time : "---"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </table>
          </div>
          <div className="md:hidden flex flex-col items-center gap-y-5 py-10">
            {standings?.map((item) => {
              return <DriverPositionCard item={item} key={item.driverId} />;
            })}
          </div>
        </>
      )}
    </>
  );
};

export default RaceResult;
