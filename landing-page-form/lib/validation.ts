import { z } from "zod";

export const submitSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  linkedin: z
    .string()
    .min(1, "LinkedIn URL is required")
    .max(500, "LinkedIn URL too long")
    .refine(
      (val) =>
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i.test(val) ||
        /^linkedin\.com\/in\/[\w-]+\/?$/i.test(val),
      "Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)"
    ),
  email: z.string().email("Valid email is required").max(320, "Email too long"),
  phone: z.string().min(1, "Phone number is required").max(30, "Phone number too long"),
  intro: z.string().min(10, "Intro must be at least 10 characters").max(1000, "Intro too long"),
  isBuilding: z.enum(["yes", "no"] as const),
  whatBuilding: z.string().max(1000, "What you're building is too long").optional(),
});

export type SubmitInput = z.infer<typeof submitSchema>;
