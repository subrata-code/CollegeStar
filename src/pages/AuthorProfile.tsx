import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Download, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  file_url: string;
  download_count: number;
  created_at: string;
}

const AuthorProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorData();
  }, [userId]);

  const fetchAuthorData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch author's notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('download_count', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ download_count: note.download_count + 1 })
        .eq('id', note.id);

      if (error) throw error;

      window.open(note.file_url, '_blank');

      setNotes(notes.map(n => 
        n.id === note.id ? { ...n, download_count: n.download_count + 1 } : n
      ));

      toast({
        title: "Download started",
        description: "Your download has begun",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">Profile not found</p>
            <Button variant="outline" onClick={() => navigate("/explore")} className="mt-4">
              Back to Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/explore")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Author Profile
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                <CardDescription>
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            {profile.bio && (
              <p className="text-muted-foreground mt-4">{profile.bio}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-sm text-muted-foreground">Notes Uploaded</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notes.reduce((sum, note) => sum + note.download_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Grid */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">Uploaded Notes</h2>
          <p className="text-muted-foreground">All notes shared by this author</p>
        </div>

        {notes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UserIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No notes uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => (
              <Card 
                key={note.id}
                className="animate-scale-in hover:shadow-lg transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {note.download_count} ↓
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {note.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Subject</p>
                    <Badge>{note.subject}</Badge>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleDownload(note)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
