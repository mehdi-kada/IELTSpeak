"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { profileValues, userProfileSchema } from "@/types/schemas";
import { educationLevels, genders, hobbyOptions } from "@/constants/constants";
import { insertProfileData } from "@/lib/actions";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ProfileForm({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const emptyProfile = searchParams.get("reason");
  const toastShown = useRef(false);

  const form = useForm<profileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "Other",
      hometown: "",
      country: "",
      education_level: "",
      occupation: "",
      favorite_subject: "",
      hobbies: [],
      travel_experience: "",
      favorite_food: "",
      life_goal: "",
    },
  });

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(`${userId}_userProfile`);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        form.reset(profileData);
      }
    } catch (error) {}
  }, [form]);

  // New useEffect for toast
  useEffect(() => {
    if (emptyProfile && !toastShown.current) {
      toast(
        "Please complete your profile to get a personalized IELTS experience."
      );
      toastShown.current = true;
    }
  }, []); // Empty dependency array to run only once on mount
  const onSubmit = async (data: profileValues) => {
    // try to get data from local storage if it exists

    setIsSubmitting(true);
    try {
      // save in local storage
      localStorage.setItem(`${userId}_userProfile`, JSON.stringify(data));
      //  Submit to API
      await insertProfileData(data, userId);
      toast("Profile updated");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-gray-400 mt-2">
          Help us personalize your IELTS practice experience
        </p>
      </div>

      <div className="bg-[#2F2F7F]/50 p-5 rounded-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600 px-4 py-3"
                      placeholder="Enter your full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      type="number"
                      placeholder="Enter your age"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-10 ">
              {/* Education Level */}
              <FormField
                control={form.control}
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600 focus:ring-2 px-4 py-3 text-white">
                          <SelectValue placeholder="Education" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a3a] border border-white/20 text-white">
                        {educationLevels.map((l, index) => (
                          <SelectItem className="hover:bg-white/10" key={index} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600 focus:ring-2 px-4 py-3 text-white">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a3a] border border-white/20 text-white">
                        {genders.map((g, index) => (
                          <SelectItem className="hover:bg-white/10" key={index} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      placeholder="Enter your country"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hometown */}
            <FormField
              control={form.control}
              name="hometown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hometown</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      placeholder="Enter your hometown"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Occupation */}
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      placeholder="e.g., Student, Software Engineer, Teacher"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Favorite Subject */}
            <FormField
              control={form.control}
              name="favorite_subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Subject</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      placeholder="e.g., Math, English, History"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hobbies */}
            <FormField
              control={form.control}
              name="hobbies"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Hobbies</FormLabel>
                    <FormDescription>
                      Select all hobbies that apply to you.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {hobbyOptions.map((hobby) => (
                      <FormField
                        key={hobby}
                        control={form.control}
                        name="hobbies"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={hobby}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  className="bg-[#1a1a3a]/60 border border-white/20 focus:bg-red-600 "
                                  checked={field.value?.includes(hobby)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, hobby])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== hobby
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="capitalize font-normal">
                                {hobby.replace("_", " ")}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Travel Experience */}
            <FormField
              control={form.control}
              name="travel_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., France, Japan, local cities"
                      className=" resize-none bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share any travel experiences or places you'd like to visit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Favorite Food */}
            <FormField
              control={form.control}
              name="favorite_food"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Food</FormLabel>
                  <FormControl>
                    <Input
                      className=" bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      placeholder="e.g., Pizza, Sushi, Pasta"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Life Goal */}
            <FormField
              control={form.control}
              name="life_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Life Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Study abroad, learn a new language"
                      className=" resize-none bg-[#1a1a3a]/60 border border-white/20 focus:border-red-600 focus:ring-red-600  px-4 py-3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What are your main aspirations and goals in life?s
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-red-600 cursor-pointer  hover:shadow-md hover:shadow-red-600 "
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving Profile..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
