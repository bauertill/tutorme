import type { StudentContext } from "@/core/studentContext/studentContext.types";

export const GRADES: { value: StudentContext["grade"]; label: string }[] = [
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
  { value: "13", label: "13th Grade" },
];

export const COUNTRIES: {
  code: StudentContext["country"];
  name: string;
  flag: string;
}[] = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "other", name: "Other", flag: "🌍" },
];

export const BOOKS: {
  title: string;
  country: StudentContext["country"];
  grade: StudentContext["grade"];
}[] = [
  // UK GRADE 8
  { title: "KS3 Maths Progress Year 8 (Pearson)", country: "uk", grade: "8" },
  { title: "Collins KS3 Maths Book 2", country: "uk", grade: "8" },
  { title: "Maths Frameworking Year 8 (Oxford)", country: "uk", grade: "8" },
  { title: "White Rose Maths (KS3 Year 8)", country: "uk", grade: "8" },
  // UK GRADE 9
  { title: "KS3 Maths Progress Year 9 (Pearson)", country: "uk", grade: "9" },
  { title: "Collins KS3 Maths Book 3", country: "uk", grade: "9" },
  { title: "Maths Frameworking Year 9 (Oxford)", country: "uk", grade: "9" },
  { title: "White Rose Maths (KS3 Year 9)", country: "uk", grade: "9" },
  // UK GRADE 10
  {
    title: "Edexcel GCSE (9–1) Mathematics Foundation (Pearson)",
    country: "uk",
    grade: "10",
  },
  {
    title: "Edexcel GCSE (9–1) Mathematics Higher (Pearson)",
    country: "uk",
    grade: "10",
  },
  { title: "AQA GCSE Maths Foundation (Oxford)", country: "uk", grade: "10" },
  { title: "AQA GCSE Maths Higher (Oxford)", country: "uk", grade: "10" },
  { title: "AQA GCSE Maths (Collins)", country: "uk", grade: "10" },
  {
    title: "CGP GCSE Maths Revision Guide (Foundation)",
    country: "uk",
    grade: "10",
  },
  {
    title: "CGP GCSE Maths Revision Guide (Higher)",
    country: "uk",
    grade: "10",
  },
  { title: "OCR GCSE Maths Foundation (Hodder)", country: "uk", grade: "10" },
  { title: "OCR GCSE Maths Higher (Hodder)", country: "uk", grade: "10" },
  // UK GRADE 11
  {
    title: "Edexcel GCSE (9–1) Mathematics Foundation (Pearson)",
    country: "uk",
    grade: "11",
  },
  {
    title: "Edexcel GCSE (9–1) Mathematics Higher (Pearson)",
    country: "uk",
    grade: "11",
  },
  { title: "AQA GCSE Maths Foundation (Oxford)", country: "uk", grade: "11" },
  { title: "AQA GCSE Maths Higher (Oxford)", country: "uk", grade: "11" },
  { title: "AQA GCSE Maths (Collins)", country: "uk", grade: "11" },
  {
    title: "CGP GCSE Maths Revision Guide (Foundation)",
    country: "uk",
    grade: "11",
  },
  {
    title: "CGP GCSE Maths Revision Guide (Higher)",
    country: "uk",
    grade: "11",
  },
  { title: "OCR GCSE Maths Foundation (Hodder)", country: "uk", grade: "11" },
  { title: "OCR GCSE Maths Higher (Hodder)", country: "uk", grade: "11" },
  // UK GRADE 12
  { title: "AQA GCSE Maths Foundation (Oxford)", country: "uk", grade: "12" },
  { title: "AQA GCSE Maths Higher (Oxford)", country: "uk", grade: "12" },
  { title: "AQA GCSE Maths (Collins)", country: "uk", grade: "12" },
  {
    title: "CGP GCSE Maths Revision Guide (Foundation)",
    country: "uk",
    grade: "12",
  },
  {
    title: "CGP GCSE Maths Revision Guide (Higher)",
    country: "uk",
    grade: "12",
  },
  { title: "OCR GCSE Maths Foundation (Hodder)", country: "uk", grade: "12" },
  { title: "OCR GCSE Maths Higher (Hodder)", country: "uk", grade: "12" },
  // UK GRADE 13
  {
    title: "Edexcel A Level Mathematics Year 2 (Pearson)",
    country: "uk",
    grade: "13",
  },
  {
    title: "OCR MEI A Level Mathematics Year 2 (Oxford)",
    country: "uk",
    grade: "13",
  },
  {
    title: "AQA A Level Mathematics Year 2 (Oxford)",
    country: "uk",
    grade: "13",
  },
  {
    title: "AQA A Level Mathematics Year 2 (Hodder)",
    country: "uk",
    grade: "13",
  },
  { title: "Integral A Level Maths (MEI)", country: "uk", grade: "13" },
  {
    title: "CGP A-Level Maths Year 2 (Revision Guide)",
    country: "uk",
    grade: "13",
  },
  {
    title: "CGP A-Level Further Maths Year 2 (Revision Guide)",
    country: "uk",
    grade: "13",
  },

  // DE GRADE 8
  { title: "Lambacher Schweizer 8 (Klett)", country: "de", grade: "8" },
  { title: "Elemente der Mathematik 8 (Schroedel)", country: "de", grade: "8" },
  { title: "Mathe.Logo 8 (Cornelsen)", country: "de", grade: "8" },
  {
    title: "Fundamente der Mathematik 8 (Cornelsen)",
    country: "de",
    grade: "8",
  },
  { title: "Mathematik heute 8 (Westermann)", country: "de", grade: "8" },
  { title: "Delta Mathematik 8 (C.C. Buchner)", country: "de", grade: "8" },
  // DE GRADE 9
  { title: "Lambacher Schweizer 9 (Klett)", country: "de", grade: "9" },
  { title: "Elemente der Mathematik 9 (Schroedel)", country: "de", grade: "9" },
  { title: "Mathe.Logo 9 (Cornelsen)", country: "de", grade: "9" },
  {
    title: "Fundamente der Mathematik 9 (Cornelsen)",
    country: "de",
    grade: "9",
  },
  { title: "Mathematik heute 9 (Westermann)", country: "de", grade: "9" },
  { title: "Delta Mathematik 9 (C.C. Buchner)", country: "de", grade: "9" },
  // DE GRADE 10
  { title: "Lambacher Schweizer 10 (Klett)", country: "de", grade: "10" },
  {
    title: "Elemente der Mathematik 10 (Schroedel)",
    country: "de",
    grade: "10",
  },
  { title: "Mathe.Logo 10 (Cornelsen)", country: "de", grade: "10" },
  {
    title: "Fundamente der Mathematik 10 (Cornelsen)",
    country: "de",
    grade: "10",
  },
  { title: "Mathematik heute 10 (Westermann)", country: "de", grade: "10" },
  { title: "Delta Mathematik 10 (C.C. Buchner)", country: "de", grade: "10" },
  // DE GRADE 11
  {
    title: "Lambacher Schweizer EF (Einführungsphase) (Klett)",
    country: "de",
    grade: "11",
  },
  {
    title: "Elemente der Mathematik EF (Schroedel)",
    country: "de",
    grade: "11",
  },
  { title: "Mathe.Logo EF (Cornelsen)", country: "de", grade: "11" },
  {
    title: "Fundamente der Mathematik EF (Cornelsen)",
    country: "de",
    grade: "11",
  },
  { title: "Mathematik heute EF (Westermann)", country: "de", grade: "11" },
  { title: "Delta Mathematik EF (C.C. Buchner)", country: "de", grade: "11" },
  // DE GRADE 12
  { title: "Lambacher Schweizer Q1/Q2 (Klett)", country: "de", grade: "12" },
  {
    title: "Elemente der Mathematik Q1/Q2 (Schroedel)",
    country: "de",
    grade: "12",
  },
  {
    title: "Fundamente der Mathematik Q1/Q2 (Cornelsen)",
    country: "de",
    grade: "12",
  },
  { title: "Mathematik heute Q1/Q2 (Westermann)", country: "de", grade: "12" },
  {
    title: "Delta Mathematik Q1/Q2 (C.C. Buchner)",
    country: "de",
    grade: "12",
  },
  // DE GRADE 13
  { title: "Lambacher Schweizer Abitur (Klett)", country: "de", grade: "13" },
  {
    title: "Elemente der Mathematik Abitur (Schroedel)",
    country: "de",
    grade: "13",
  },
  {
    title: "Fundamente der Mathematik Abitur (Cornelsen)",
    country: "de",
    grade: "13",
  },
  { title: "Mathematik heute Abitur (Westermann)", country: "de", grade: "13" },
  {
    title: "Delta Mathematik Abitur (C.C. Buchner)",
    country: "de",
    grade: "13",
  },
];
