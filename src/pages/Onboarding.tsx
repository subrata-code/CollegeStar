import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ProfileDraft = {
  institute?: string;
  course?: string;
  stream?: string;
  interests?: string[];
  lastQualification?: string;
  aim?: string;
  studyHours?: string;
  preferredContent?: string;
};

const interestOptions = ["Math", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "History"];
const contentOptions = ["Notes", "PDFs", "Video", "Quizzes"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProfileDraft>({});

  useEffect(() => {
    // If already logged out, send to auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const completionPercent = useMemo(() => {
    const fields = ["institute", "course", "stream", "interests", "lastQualification", "aim", "studyHours", "preferredContent"] as const;
    const filled = fields.filter((f) => {
      const v = (draft as any)[f];
      if (Array.isArray(v)) return v.length > 0;
      return Boolean(v && String(v).trim().length > 0);
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [draft]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await supabase.auth.updateUser({
        data: {
          profile: draft,
          profileCompletion: completionPercent,
        },
      });
      toast({ title: "Profile saved", description: "Your preferences are updated." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Save failed", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (name: string) => {
    setDraft((d) => {
      const current = new Set(d.interests || []);
      if (current.has(name)) current.delete(name); else current.add(name);
      return { ...d, interests: Array.from(current) };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Help us personalize recommendations. Completion: {completionPercent}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institute">Institute</Label>
                  <Input id="institute" placeholder="e.g., XYZ University" value={draft.institute || ""} onChange={(e) => setDraft({ ...draft, institute: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" placeholder="e.g., B.Tech CSE" value={draft.course || ""} onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream/Branch</Label>
                  <Input id="stream" placeholder="e.g., Computer Science" value={draft.stream || ""} onChange={(e) => setDraft({ ...draft, stream: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Last Qualification</Label>
                  <Input id="qualification" placeholder="e.g., 12th Science" value={draft.lastQualification || ""} onChange={(e) => setDraft({ ...draft, lastQualification: e.target.value })} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Aim / Target Field</Label>
                  <Input placeholder="e.g., GATE CSE, UPSC, Product Engineer" value={draft.aim || ""} onChange={(e) => setDraft({ ...draft, aim: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Study hours / week</Label>
                  <Input placeholder="e.g., 10" value={draft.studyHours || ""} onChange={(e) => setDraft({ ...draft, studyHours: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Content</Label>
                  <Select onValueChange={(v) => setDraft({ ...draft, preferredContent: v })} value={draft.preferredContent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interestOptions.map((name) => {
                    const active = (draft.interests || []).includes(name);
                    return (
                      <Button key={name} type="button" variant={active ? "default" : "outline"} onClick={() => toggleInterest(name)}>
                        {name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>Skip for now</Button>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)}>Next</Button>
                ) : (
                  <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Finish"}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;


