"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

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
import { fetchUserProfileData, insertProfileData } from "@/lib/actions";
import { useUserProfile } from "@/hooks/sessions/useProfileData";
import { routeModule } from "next/dist/build/templates/pages";
import { useRouter } from "next/navigation";

export function ProfileForm({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const emptyProfile = searchParams.get("reason");
  const toastShown = useRef(false);

  const router = useRouter();
  const { profileData, error } = useUserProfile(userId);

  const form = useForm<profileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "",
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

  // Load profile data from local storage or database
  useEffect(() => {
    if (!userId || !profileData) return;

    const loadProfileData = async () => {
      try {
        // Define default values to merge with loaded data
        const defaultValues = {
          name: "",
          age: 0,
          gender: "",
          hometown: "",
          country: "",
          education_level: "",
          occupation: "",
          favorite_subject: "",
          hobbies: [],
          travel_experience: "",
          favorite_food: "",
          life_goal: "",
        };

        // Merge with defaults to ensure all fields have values
        const mergedData = {
          ...defaultValues,
          ...(profileData ?? {}),
          hobbies:
            profileData && Array.isArray(profileData.hobbies)
              ? profileData.hobbies
              : [],
        };

        // Use setTimeout to ensure the form is properly initialized before resetting
        setTimeout(() => {
          form.reset(mergedData);
        }, 0);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Failed to load profile data. Please try again.");
      }
    };

    loadProfileData();
  }, [userId, form, profileData]);

  // Show toast notification only once for empty profile
  useEffect(() => {
    if (emptyProfile && !toastShown.current) {
      toast.info(
        "Please complete your profile to get a personalized IELTS experience."
      );
      toastShown.current = true;
    }
  }, [emptyProfile]);

  // Handle form submission
  const onSubmit = async (data: profileValues) => {
    setIsSubmitting(true);
    console.log(" the data to use for update is : ", data);
    try {
      localStorage.setItem(`${userId}_userProfile`, JSON.stringify(data));
      await insertProfileData(data, userId);
      toast.success("Profile updated successfully");
      if (emptyProfile) {
        router.push("/levels");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update profile. Please try again.");
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

      <div className="bg-[#374151] p-5 rounded-lg">
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="Enter your full name"
                      aria-label="Full Name"
                      {...field}
                      value={field.value || ""}
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      type="number"
                      placeholder="Enter your age"
                      aria-label="Age"
                      {...field}
                      value={
                        field.value === 0 ||
                        field.value === null ||
                        field.value === undefined
                          ? ""
                          : field.value
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-10">
              {/* Education Level */}
              <FormField
                control={form.control}
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] focus:ring-2 px-2 sm:px-5 py-3 text-white">
                          <SelectValue placeholder="Education" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1F2937] border border-white/20 text-white ">
                        {educationLevels.map((l, index) => (
                          <SelectItem
                            className="hover:bg-[#E91E63]/20"
                            key={index}
                            value={l}
                          >
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] focus:ring-2 px-2 sm:px-5 py-3 text-white">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1F2937] border border-white/20 text-white">
                        {genders.map((g, index) => (
                          <SelectItem
                            className="hover:bg-[#E91E63]/20"
                            key={index}
                            value={g}
                          >
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="Enter your country"
                      aria-label="Country"
                      {...field}
                      value={field.value || ""}
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="Enter your hometown"
                      aria-label="Hometown"
                      {...field}
                      value={field.value || ""}
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="e.g., Student, Software Engineer, Teacher"
                      aria-label="Occupation"
                      {...field}
                      value={field.value || ""}
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="e.g., Math, English, History"
                      aria-label="Favorite Subject"
                      {...field}
                      value={field.value || ""}
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
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Hobbies</FormLabel>
                    <FormDescription>
                      Select all hobbies that apply to you.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {hobbyOptions.map((hobby) => (
                      <FormItem
                        key={hobby}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            className="bg-[#1F2937] border border-white/20 focus:bg-[#E91E63] focus:ring-2 focus:ring-[#E91E63]"
                            checked={
                              Array.isArray(field.value) &&
                              field.value.includes(hobby)
                            }
                            onCheckedChange={(checked) => {
                              const currentHobbies = Array.isArray(field.value)
                                ? field.value
                                : [];
                              return checked
                                ? field.onChange([...currentHobbies, hobby])
                                : field.onChange(
                                    currentHobbies.filter(
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
                      className="resize-none bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      aria-label="Travel Experience"
                      {...field}
                      value={field.value || ""}
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
                      className="bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      placeholder="e.g., Pizza, Sushi, Pasta"
                      aria-label="Favorite Food"
                      {...field}
                      value={field.value || ""}
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
                      className="resize-none bg-[#1F2937] border border-white/20 focus:border-[#E91E63] focus:ring-[#E91E63] px-4 py-3"
                      aria-label="Life Goal"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    What are your main aspirations and goals in life?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#E91E63] cursor-pointer hover:shadow-md hover:shadow-[#E91E63]/30 hover:-translate-y-px transition-all duration-200"
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
