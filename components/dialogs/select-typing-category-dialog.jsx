import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, Trophy, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ComboSelector from "../selector";
import useGameSettingsStore from "@/store/useGameSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const wordsTimes = [
  { id: "easy", name: "Easy", time: "45 seconds" },
  { id: "medium", name: "Medium", time: "30 seconds" },
  { id: "hard", name: "Hard", time: "15 seconds" },
];

const paragraphsTimes = [
  { id: "easy", name: "Easy", time: "60 seconds" },
  { id: "medium", name: "Medium", time: "30 seconds" },
  { id: "hard", name: "Hard", time: "15 seconds" },
];

const SelectTypingCategoryDialog = ({
  isOpen,
  onConfirm,
  isLoading,
  changeColor,
}) => {
  const {
    difficulty,
    setDifficulty,
    time,
    setTime,
    challangeType,
    setChallangeType,
  } = useGameSettingsStore();

  const canSave = challangeType && time;

  const handleTabChange = (tab) => {
    setChallangeType(tab);
  };

  const handleTimeChange = (timeId) => {
    const selectedTime =
      challangeType === "words"
        ? wordsTimes.find((t) => t.id === timeId)
        : paragraphsTimes.find((t) => t.id === timeId);
    setTime(selectedTime.time.split(" ")[0]); // Set only the numeric part of the time
    if (selectedTime) {
      if (selectedTime.time.split(" ")[0] === "15") {
        setDifficulty("hard");
      } else if (selectedTime.time.split(" ")[0] === "30") {
        setDifficulty("medium");
      } else {
        setDifficulty("easy");
      }
    }
  };

  const handleConfirm = () => {
    onConfirm({ challangeType, time });
    changeColor();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[40rem] gradient-hero-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader className="relative">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute -top-1 -right-1">
                <Trophy className="h-6 w-6 text-red-500 animate-pulse" />
              </div>
              <Keyboard className="h-16 w-16 text-black" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black">
              Choose Your Challenge
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue={challangeType}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
          </TabsList>
          <TabsContent value="words">
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-medium leading-none mt-8">
                Select Time
              </h3>
              <RadioGroup
                className="flex gap-4"
                value={difficulty}
                onValueChange={handleTimeChange}
              >
                {wordsTimes.map((timeOption) => (
                  <div key={timeOption.id} className="flex-1">
                    <RadioGroupItem
                      value={timeOption.id}
                      id={`words-${timeOption.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`words-${timeOption.id}`}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-3 cursor-pointer transition-all duration-200",
                        "border-2 border-transparent",
                        "hover:scale-105 hover:shadow-md",
                        difficulty === timeOption.id
                          ? "bg-black text-white ring-2 ring-black ring-offset-2 shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {timeOption.name} - {timeOption.time}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="paragraphs">
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-medium leading-none mt-8">
                Select Time
              </h3>
              <RadioGroup
                className="flex gap-4"
                value={difficulty}
                onValueChange={handleTimeChange}
              >
                {paragraphsTimes.map((timeOption) => (
                  <div key={timeOption.id} className="flex-1">
                    <RadioGroupItem
                      value={timeOption.id}
                      id={`paras-${timeOption.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`paras-${timeOption.id}`}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-3 cursor-pointer transition-all duration-200",
                        "border-2 border-transparent",
                        "hover:scale-105 hover:shadow-md",
                        difficulty === timeOption.id
                          ? "bg-black text-white ring-2 ring-black ring-offset-2 shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {timeOption.name} - {timeOption.time}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between gap-4">
          <Button
            onClick={handleConfirm}
            className={cn(
              "flex-1 rounded-xl transition-all duration-200",
              canSave && !isLoading
                ? "gradient-hero-4 text-black hover:scale-105 hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            disabled={!canSave || isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Loading...</span>
              </>
            ) : (
              <>
                Save Preferences
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectTypingCategoryDialog;
