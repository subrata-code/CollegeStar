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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [draft, setDraft] = useState<ProfileDraft>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        setEmail(user.email || "");
        setFullName((user as any)?.user_metadata?.full_name || "");
        const profile = (user as any)?.user_metadata?.profile as ProfileDraft | undefined;
        if (profile) setDraft(profile);
      } finally {
        setLoading(false);
      }
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

  const toggleInterest = (name: string) => {
    setDraft((d) => {
      const current = new Set(d.interests || []);
      if (current.has(name)) current.delete(name); else current.add(name);
      return { ...d, interests: Array.from(current) };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          profile: draft,
          profileCompletion: completionPercent,
        },
      });
      toast({ title: "Profile updated", description: "Your information has been saved." });
    } catch (error: any) {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and edit your details. Completion: {completionPercent}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Institute</Label>
                <Input value={draft.institute || ""} onChange={(e) => setDraft({ ...draft, institute: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={draft.course || ""} onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stream/Branch</Label>
                <Input value={draft.stream || ""} onChange={(e) => setDraft({ ...draft, stream: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Qualification</Label>
                <Input value={draft.lastQualification || ""} onChange={(e) => setDraft({ ...draft, lastQualification: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Aim / Target Field</Label>
                <Input value={draft.aim || ""} onChange={(e) => setDraft({ ...draft, aim: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Study hours / week</Label>
                <Input value={draft.studyHours || ""} onChange={(e) => setDraft({ ...draft, studyHours: e.target.value })} />
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

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
