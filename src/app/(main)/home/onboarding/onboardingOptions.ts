import { StudentContext } from "@/core/studentContext/studentContext.types";

export const GRADES: { value: StudentContext["grade"]; label: string }[] = [
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

export const COUNTRIES: { value: StudentContext["country"]; label: string }[] =
  [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "es", label: "Spain" },
    { value: "nl", label: "Netherlands" },
    { value: "other", label: "Other" },
  ];
