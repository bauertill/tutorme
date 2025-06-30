import type { StudentGroup } from "./groups.types";

export const getStudentGroups = () => {
  return initialGroups;
};

const initialGroups: StudentGroup[] = [
  {
    id: "1",
    name: "Advanced Math",
    description: "Students excelling in mathematics",
    subject: "Mathematics",
    studentIds: ["1", "2", "3"],
    createdDate: "2025-01-15",
    color: "blue",
    grade: "10 A",
  },
  {
    id: "2",
    name: "Basic Math",
    description: "Foundation mathematics group",
    subject: "Mathematics",
    studentIds: ["4", "5", "6"],
    createdDate: "2025-02-20",
    color: "green",
    grade: "10 A",
  },
  {
    id: "3",
    name: "Geometry Focus",
    description: "Specialized geometry study group",
    subject: "Geometry",
    studentIds: ["7", "8", "9", "10"],
    createdDate: "2025-03-01",
    color: "purple",
    grade: "10 A",
  },
  {
    id: "4",
    name: "Statistics Group",
    description: "Advanced statistics and probability study group",
    subject: "Statistics",
    studentIds: ["11", "12", "13"],
    createdDate: "2025-04-10",
    color: "orange",
    grade: "10 B",
  },
  {
    id: "5",
    name: "Algebra Specialists",
    description: "Advanced algebra and algebraic reasoning group",
    subject: "Algebra",
    studentIds: ["14", "15", "16"],
    createdDate: "2025-05-15",
    color: "red",
    grade: "10 B",
  },
];
