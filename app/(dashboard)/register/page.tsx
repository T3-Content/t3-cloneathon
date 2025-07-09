"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";

export function UpdateSubmission() {
  const { user } = useUser();
  const currentSubmission = useQuery(api.submission.getSubmission);
  const submit = useMutation(api.submission.updateSubmission);

  if (currentSubmission === null) {
    return <div>Sorry, submissions are now closed</div>;
  }

  const [formData, setFormData] = useState({
    projectName: "",
    members: [""],
    githubUrl: "",
    hostedSiteUrl: "",
    videoOverviewUrl: "",
    description: "",
    favoriteParts: "",
    biggestChallenges: "",
    testingInstructions: "",
    status: "in-progress" as "in-progress" | "submitted",
    shared: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Update form data when submission loads or user changes
  useEffect(() => {
    const username =
      user?.username ||
      user?.firstName ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "";

    if (currentSubmission) {
      setFormData({
        projectName: currentSubmission.projectName || "",
        members:
          currentSubmission.members.length > 0
            ? currentSubmission.members
            : [username],
        githubUrl: currentSubmission.githubUrl || "",
        hostedSiteUrl: currentSubmission.hostedSiteUrl || "",
        videoOverviewUrl: currentSubmission.videoOverviewUrl || "",
        description: currentSubmission.description || "",
        favoriteParts: currentSubmission.favoriteParts || "",
        biggestChallenges: currentSubmission.biggestChallenges || "",
        testingInstructions: currentSubmission.testingInstructions || "",
        status: currentSubmission.status || "in-progress",
        shared: currentSubmission.shared || false,
      });
    } else if (username) {
      // Set username as first team member for new submissions
      setFormData((prev) => ({
        ...prev,
        members: [username],
      }));
    }
  }, [currentSubmission, user]);

  const handleSubmit = async (
    e: React.FormEvent,
    status: "in-progress" | "submitted"
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty members
      const filteredMembers = formData.members.filter(
        (member) => member.trim() !== ""
      );

      await submit({
        submission: {
          ...formData,
          members: filteredMembers,
          status,
        },
      });

      toast.success(
        status === "submitted"
          ? "Submission submitted successfully!"
          : "Draft saved successfully!"
      );
    } catch (error) {
      toast.error("Failed to save submission. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, ""],
    }));
  };

  const removeMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const updateMember = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => (i === index ? value : member)),
    }));
  };

  if (currentSubmission === undefined) {
    return (
      <div className="flex justify-center items-center flex-grow">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            T3 Chat Cloneathon Registration
          </h1>
          <p className="text-white/70 text-lg">
            Submit your T3 Chat clone and compete for prizes
          </p>
          {currentSubmission && (
            <Badge
              variant={
                currentSubmission.status === "submitted"
                  ? "default"
                  : "secondary"
              }
              className={`mt-2 ${
                currentSubmission.status === "submitted"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }`}
            >
              {currentSubmission.status === "submitted"
                ? "✅ Submitted"
                : "📝 Draft"}
            </Badge>
          )}
        </div>

        {currentSubmission?.status === "submitted" && (
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <h3 className="text-green-400 font-bold text-lg">
                  Submission Complete!
                </h3>
                <p className="text-green-200/80">
                  Your project has been successfully submitted to the T3 Chat
                  Cloneathon. You can still update your submission for up to 24
                  hours after the deadline is hit.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card
          className={`${
            currentSubmission?.status === "submitted"
              ? "bg-white/5 border-green-500/20"
              : "bg-white/5 border-white/10"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-white">Project Submission</CardTitle>
            <CardDescription className="text-white/70">
              {currentSubmission?.status === "submitted"
                ? "Your submission is complete! You can still make updates if needed."
                : "Fill out the form below to register your project for the competition"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => handleSubmit(e, "in-progress")}
              className="space-y-6"
            >
              {/* Project Name */}
              <div>
                <Label htmlFor="projectName" className="text-white">
                  Project Name *
                </Label>
                <p className="text-sm text-white/60 mb-2">
                  Make sure your project is clearly branded as NOT T3 Chat
                  (either use a new name or call out that it is a clone)
                </p>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectName: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="My Amazing T3 Chat Clone"
                  required
                />
              </div>

              {/* Team Members */}
              <div>
                <Label className="text-white">Team Members *</Label>
                <p className="text-sm text-white/60 mb-2">
                  Add team member names or handles (max 4 people per team)
                </p>
                <div className="space-y-2">
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={member}
                        onChange={(e) => updateMember(index, e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        placeholder={
                          index === 0
                            ? "You (team lead)"
                            : `Team member ${index + 1}`
                        }
                        required={index === 0}
                        readOnly={index === 0}
                        disabled={index === 0}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMember(index)}
                          className="border-white/20 text-white hover:bg-white/5"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.members.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMember}
                      className="border-white/20 text-white hover:bg-white/5"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  )}
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <Label htmlFor="githubUrl" className="text-white">
                  GitHub Repository URL *
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      githubUrl: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://github.com/username/project"
                  required
                />
              </div>

              {/* Hosted Site URL */}
              <div>
                <Label htmlFor="hostedSiteUrl" className="text-white">
                  Hosted Site URL
                </Label>
                <p className="text-sm text-white/60 mb-2">
                  If your project is hosted somewhere we can easily use it, link
                  it here
                </p>
                <Input
                  id="hostedSiteUrl"
                  type="url"
                  value={formData.hostedSiteUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hostedSiteUrl: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://your-project.vercel.app"
                />
              </div>

              {/* Video Overview URL */}
              <div>
                <Label htmlFor="videoOverviewUrl" className="text-white">
                  Video Overview URL
                </Label>
                <p className="text-sm text-white/60 mb-2">
                  A 1-2 minute overview of what you built. Host on YouTube,
                  Dropbox or Google Drive. Doesn't have to be elaborate, just
                  show off your work a bit!
                </p>
                <Input
                  id="videoOverviewUrl"
                  type="url"
                  value={formData.videoOverviewUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoOverviewUrl: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-white">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                  placeholder="Describe your project, key features, and what makes it unique"
                />
              </div>

              {/* Favorite Parts */}
              <div>
                <Label htmlFor="favoriteParts" className="text-white">
                  What are your favorite parts of your implementation?
                </Label>
                <Textarea
                  id="favoriteParts"
                  value={formData.favoriteParts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      favoriteParts: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                  placeholder="Tell us about the features or implementation details you're most proud of!"
                />
              </div>

              {/* Biggest Challenges */}
              <div>
                <Label htmlFor="biggestChallenges" className="text-white">
                  Biggest challenges
                </Label>
                <Textarea
                  id="biggestChallenges"
                  value={formData.biggestChallenges}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      biggestChallenges: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                  placeholder="What parts were most difficult to implement? What technical challenges did you face?"
                />
              </div>

              {/* Testing Instructions */}
              <div>
                <Label htmlFor="testingInstructions" className="text-white">
                  Testing Instructions
                </Label>
                <p className="text-sm text-white/60 mb-2">
                  Give us instructions for the simplest way to try out your
                  submission
                </p>
                <Textarea
                  id="testingInstructions"
                  value={formData.testingInstructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      testingInstructions: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                  placeholder={`1. Visit the hosted URL above OR clone the repo and run 'npm install && npm run dev'
2. Set OPENROUTER_API_KEY in .env.local or in /settings/api-keys
3. Try asking the AI a question`}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(
                      checked === "indeterminate" ? false : checked
                    )
                  }
                  className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-purple-400 hover:text-purple-300 underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                  </Label>
                  <p className="text-xs text-white/60">
                    You must agree to the terms and conditions to submit your
                    entry.
                  </p>
                </div>
              </div>

              {/* Share in Gallery */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="shared"
                  checked={formData.shared}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      shared: checked === "indeterminate" ? false : checked,
                    }))
                  }
                  className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="shared"
                    className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Share my submission in the gallery
                  </Label>
                  <p className="text-xs text-white/60">
                    Allow other participants to view your project in the
                    submissions gallery.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  variant="outline"
                >
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, "submitted")}
                  disabled={
                    isSubmitting ||
                    !formData.projectName ||
                    !formData.githubUrl ||
                    !formData.videoOverviewUrl ||
                    !formData.description ||
                    !formData.favoriteParts ||
                    !formData.biggestChallenges ||
                    !formData.testingInstructions ||
                    formData.members.filter((m) => m.trim()).length === 0 ||
                    !agreedToTerms
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting
                    ? "Updating..."
                    : currentSubmission?.status === "submitted"
                      ? "Update Submission"
                      : "Submit Final Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Registration() {
  const currentSubmission = useQuery(api.submission.getSubmission);

  if (currentSubmission === null) {
    return <div>Sorry, submissions are now closed</div>;
  }

  return <UpdateSubmission />;
}
