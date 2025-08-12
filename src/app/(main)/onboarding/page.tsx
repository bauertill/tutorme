"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudentContext } from "@/core/studentContext/studentContext.types";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, GRADES } from "./onboardingOptions";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const utils = api.useUtils();
  const { mutate, isPending } =
    api.studentContext.upsertStudentContext.useMutation({
      onSuccess: (newStudentContext) => {
        utils.studentContext.getStudentContext.setData(
          undefined,
          newStudentContext,
        );
        router.push("/home");
      },
    });
  const [data, setData] = useState<Partial<Omit<StudentContext, "studentId">>>({
    grade: undefined,
    country: undefined,
    textbook: undefined,
    nextTestDate: undefined,
  });
  const router = useRouter();

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (
    field: keyof StudentContext,
    value: string | Date | undefined,
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.grade !== undefined;
      case 1:
        return data.country !== undefined;
      case 2:
        return data.textbook !== undefined;
      case 3:
        return data.nextTestDate !== undefined;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    mutate(data as Omit<StudentContext, "userId">);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What grade are you in?</h3>
            <p className="text-muted-foreground">
              This helps us understand your academic level and provide
              appropriate content.
            </p>
            <Select
              value={data.grade ?? ""}
              onValueChange={(value) => updateData("grade", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Where do you go to school?
            </h3>
            <p className="text-muted-foreground">
              This helps us tailor the curriculum and standards to your
              education system.
            </p>
            <Select
              value={data.country ?? ""}
              onValueChange={(value) => updateData("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center space-x-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What textbook do you use?</h3>
            <p className="text-muted-foreground">
              This helps us align our tutoring with your specific course
              materials.
            </p>
            <Input
              value={data.textbook ?? ""}
              onChange={(e) => updateData("textbook", e.target.value)}
              placeholder="Enter your textbook name or publisher"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">When is your next test?</h3>
            <p className="text-muted-foreground">
              This helps us prioritize your study plan and focus on urgent
              topics.
            </p>
            <DatePicker
              date={data.nextTestDate}
              onDateChange={(date) => updateData("nextTestDate", date)}
              placeholder="Select your next test date"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-2xl border-0 bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to TutorMe! 🎓</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile to get started with personalized
            learning
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={nextStep} disabled={!canProceed() || isPending}>
              {currentStep === totalSteps - 1 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
