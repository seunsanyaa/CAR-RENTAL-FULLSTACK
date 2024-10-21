'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";

interface CarDetails {
  model: string;
  make: string;
  trim: string;
  year: number;
  body_style: string;
  engine_type: string;
  engine_cc: number;
  engine_num_cyl: number;
  engine_valves_per_cyl: number;
  engine_power_ps: number;
  engine_power_rpm: number;
  engine_torque_nm: number;
  engine_torque_rpm: number;
  engine_fuel: string;
  engine_bore_mm: number;
  engine_stroke_mm: number;
  engine_compression: number;
  engine_fuel_delivery: string;
  engine_fuel_injection: string;
  engine_turbo: string;
}

const CarSearch: React.FC = () => {
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableTrims, setAvailableTrims] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedTrim, setSelectedTrim] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(0);

  const [searchResults, setSearchResults] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await axios.get(`/api/carquery?cmd=getMakes`);
        const makes: string[] = response.data.Makes
          .map((make: any) => make.make_display)
          .filter(Boolean)
          .sort();
        setAvailableMakes(makes);
      } catch (err: any) {
        console.error("Error fetching makes:", err);
        setError("Failed to fetch car makes.");
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedMake) {
        setAvailableModels([]);
        setSelectedModel("");
        setAvailableTrims([]);
        setSelectedTrim("");
        setAvailableYears([]);
        setSelectedYear(0);
        setSearchResults(null);
        return;
      }
      try {
        const response = await axios.get(
          `/api/carquery?cmd=getModels&make=${encodeURIComponent(selectedMake)}`
        );
        const models: string[] = response.data.Models
          .map((model: any) => model.model_name)
          .filter(Boolean);
        // Remove duplicates and sort
        const uniqueModels = Array.from(new Set(models)).sort();
        setAvailableModels(uniqueModels);
        setSelectedModel("");
        setAvailableTrims([]);
        setSelectedTrim("");
        setAvailableYears([]);
        setSelectedYear(0);
        setSearchResults(null);
      } catch (err: any) {
        console.error("Error fetching models:", err);
        setError("Failed to fetch car models.");
      }
    };
    fetchModels();
  }, [selectedMake]);

  // Fetch trims and years when make and model change
  useEffect(() => {
    const fetchTrimsAndYears = async () => {
      if (!selectedMake || !selectedModel) {
        setAvailableTrims([]);
        setAvailableYears([]);
        setSelectedTrim("");
        setSelectedYear(0);
        setSearchResults(null);
        return;
      }
      try {
        const response = await axios.get(
          `/api/carquery?cmd=getTrims&make=${encodeURIComponent(
            selectedMake
          )}&model=${encodeURIComponent(selectedModel)}`
        );
        const trims: string[] = response.data.Trims
          .map((trim: any) => trim.model_trim)
          .filter(Boolean);
        const uniqueTrims = Array.from(new Set(trims)).sort();

        const years: number[] = response.data.Trims
          .map((trim: any) => parseInt(trim.model_year))
          .filter(Boolean);
        const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);

        setAvailableTrims(uniqueTrims);
        setAvailableYears(uniqueYears);
        setSelectedTrim("");
        setSelectedYear(0);
        setSearchResults(null);
      } catch (err: any) {
        console.error("Error fetching trims and years:", err);
        setError("Failed to fetch trims and years.");
      }
    };
    fetchTrimsAndYears();
  }, [selectedMake, selectedModel]);

  // Handle the search action
  const handleSearch = async () => {
    if (!selectedMake || !selectedModel || !selectedTrim || !selectedYear) {
      setError("Please select Make, Model, Trim, and Year.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      // Fetch trims with specific criteria to get detailed data
      const response = await axios.get(
        `/api/carquery?cmd=getTrims&make=${encodeURIComponent(
          selectedMake
        )}&model=${encodeURIComponent(selectedModel)}&trim=${encodeURIComponent(
          selectedTrim
        )}&year=${selectedYear}`
      );

      // Assuming the API returns a list of trims, find the exact match
      const trimData = response.data.Trims.find(
        (trim: any) =>
          trim.model_trim.toLowerCase() === selectedTrim.toLowerCase() &&
          parseInt(trim.model_year) === selectedYear
      );

      if (trimData) {
        // Map the API response to CarDetails interface
        const details: CarDetails = {
          model: trimData.model_name,
          make: trimData.make_display,
          trim: trimData.model_trim,
          year: parseInt(trimData.model_year),
          body_style: trimData.body_style || "N/A",
          engine_type: trimData.engine_type || "N/A",
          engine_cc: parseInt(trimData.engine_cc) || 0,
          engine_num_cyl: parseInt(trimData.engine_num_cyl) || 0,
          engine_valves_per_cyl: parseInt(trimData.engine_valves_per_cyl) || 0,
          engine_power_ps: parseInt(trimData.engine_power_ps) || 0,
          engine_power_rpm: parseInt(trimData.engine_power_rpm) || 0,
          engine_torque_nm: parseInt(trimData.engine_torque_nm) || 0,
          engine_torque_rpm: parseInt(trimData.engine_torque_rpm) || 0,
          engine_fuel: trimData.engine_fuel || "N/A",
          engine_bore_mm: parseFloat(trimData.engine_bore_mm) || 0,
          engine_stroke_mm: parseFloat(trimData.engine_stroke_mm) || 0,
          engine_compression: parseFloat(trimData.engine_compression) || 0,
          engine_fuel_delivery: trimData.engine_fuel_delivery || "N/A",
          engine_fuel_injection: trimData.engine_fuel_injection || "N/A",
          engine_turbo: trimData.engine_turbo || "N/A",
        };
        setSearchResults(details);
      } else {
        setError("No details found for the selected trim and year.");
      }
    } catch (err: any) {
      console.error("Error fetching car details:", err);
      setError("Failed to fetch car details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Car Search</h2>
      {error && (
        <p className="text-red-500 mb-4" role="alert">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maker Selection */}
        <div>
          <label htmlFor="maker" className="block text-sm font-medium text-gray-700">
            Make
          </label>
          <select
            id="maker"
            name="maker"
            value={selectedMake}
            onChange={(e) => {
              setSelectedMake(e.target.value);
              setSelectedModel("");
              setAvailableTrims([]);
              setSelectedTrim("");
              setAvailableYears([]);
              setSelectedYear(0);
              setSearchResults(null);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Make</option>
            {availableMakes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            Model
          </label>
          <select
            id="model"
            name="model"
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setAvailableTrims([]);
              setSelectedTrim("");
              setAvailableYears([]);
              setSelectedYear(0);
              setSearchResults(null);
            }}
            disabled={!availableModels.length}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Trim Selection */}
        <div>
          <label htmlFor="trim" className="block text-sm font-medium text-gray-700">
            Trim
          </label>
          <select
            id="trim"
            name="trim"
            value={selectedTrim}
            onChange={(e) => {
              setSelectedTrim(e.target.value);
              setAvailableYears([]);
              setSelectedYear(0);
              setSearchResults(null);
            }}
            disabled={!availableTrims.length}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Trim</option>
            {availableTrims.map((trim) => (
              <option key={trim} value={trim}>
                {trim}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={selectedYear}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              setSelectedYear(isNaN(year) ? 0 : year);
              setSearchResults(null);
            }}
            disabled={!availableYears.length}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value={0}>Select Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4">
        <button
          onClick={handleSearch}
          disabled={
            !selectedMake ||
            !selectedModel ||
            !selectedTrim ||
            !selectedYear ||
            loading
          }
          className={`w-full md:w-auto px-4 py-2 rounded-md text-white ${
            !selectedMake ||
            !selectedModel ||
            !selectedTrim ||
            !selectedYear ||
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Display Results */}
      {searchResults && (
        <div className="mt-6 p-4 border border-gray-300 rounded-md">
          <h3 className="text-xl font-semibold mb-2">Car Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>
              <strong>Make:</strong> {searchResults.make}
            </p>
            <p>
              <strong>Model:</strong> {searchResults.model}
            </p>
            <p>
              <strong>Trim:</strong> {searchResults.trim}
            </p>
            <p>
              <strong>Year:</strong> {searchResults.year}
            </p>
            <p>
              <strong>Body Style:</strong> {searchResults.body_style}
            </p>
            <p>
              <strong>Engine Type:</strong> {searchResults.engine_type}
            </p>
            <p>
              <strong>Engine CC:</strong> {searchResults.engine_cc} cc
            </p>
            <p>
              <strong>Number of Cylinders:</strong> {searchResults.engine_num_cyl}
            </p>
            <p>
              <strong>Valves per Cylinder:</strong> {searchResults.engine_valves_per_cyl}
            </p>
            <p>
              <strong>Power:</strong> {searchResults.engine_power_ps} PS @ {searchResults.engine_power_rpm} RPM
            </p>
            <p>
              <strong>Torque:</strong> {searchResults.engine_torque_nm} Nm @ {searchResults.engine_torque_rpm} RPM
            </p>
            <p>
              <strong>Fuel Type:</strong> {searchResults.engine_fuel}
            </p>
            <p>
              <strong>Bore:</strong> {searchResults.engine_bore_mm} mm
            </p>
            <p>
              <strong>Stroke:</strong> {searchResults.engine_stroke_mm} mm
            </p>
            <p>
              <strong>Compression:</strong> {searchResults.engine_compression}
            </p>
            <p>
              <strong>Fuel Delivery:</strong> {searchResults.engine_fuel_delivery}
            </p>
            <p>
              <strong>Fuel Injection:</strong> {searchResults.engine_fuel_injection}
            </p>
            <p>
              <strong>Turbo:</strong> {searchResults.engine_turbo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarSearch;
