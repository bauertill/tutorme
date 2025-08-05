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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface OnboardingData {
  grade: string;
  country: string;
  textbook: string;
  nextTestDate: Date | undefined;
}

const GRADES = [
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

const COUNTRIES = [
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    grade: "",
    country: "",
    textbook: "",
    nextTestDate: undefined,
  });

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.grade !== "";
      case 1:
        return data.country !== "";
      case 2:
        return data.textbook.trim() !== "";
      case 3:
        return data.nextTestDate !== undefined;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - log the gathered context
      console.log("Onboarding completed! Gathered context:", data);
      alert("Onboarding completed! Check the console for gathered context.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="grade">What grade are you currently in?</Label>
              <Select
                value={data.grade}
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">
                Which country do you go to school in?
              </Label>
              <Select
                value={data.country}
                onValueChange={(value) => updateData("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="textbook">
                Which textbook are you working from?
              </Label>
              <Input
                id="textbook"
                value={data.textbook}
                onChange={(e) => updateData("textbook", e.target.value)}
                placeholder="Enter your textbook name or publisher"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>When is your next test?</Label>
              <DatePicker
                date={data.nextTestDate}
                onDateChange={(date) => updateData("nextTestDate", date)}
                placeholder="Select your next test date"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "What grade are you in?";
      case 1:
        return "Where do you go to school?";
      case 2:
        return "What textbook do you use?";
      case 3:
        return "When is your next test?";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 0:
        return "This helps us understand your academic level and provide appropriate content.";
      case 1:
        return "This helps us tailor the curriculum and standards to your education system.";
      case 2:
        return "This helps us align our tutoring with your specific course materials.";
      case 3:
        return "This helps us prioritize your study plan and focus on urgent topics.";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderStep()}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                {currentStep === totalSteps - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
