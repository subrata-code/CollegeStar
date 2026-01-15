import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, User, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  file_url: string;
  file_name: string;
  download_count: number;
  created_at: string;
  user_id: {
    _id: string;
    full_name: string;
  };
}

const NOTES_PER_PAGE = 30;

const ExploreNotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(NOTES_PER_PAGE);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data || []);
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
      const token = localStorage.getItem('token');
      // Increment download count
      const response = await fetch(`http://localhost:5000/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ download_count: note.download_count + 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update download count');
      }

      // Trigger download
      window.open(note.file_url, '_blank');

      // Update local state
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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedNotes = filteredNotes.slice(0, displayCount);
  const hasMore = displayCount < filteredNotes.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Explore Notes
            </h1>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, subject, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {displayedNotes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No notes found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedNotes.map((note, index) => (
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

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload(note)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/author/${note.user_id._id}`)}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Author
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setDisplayCount(displayCount + NOTES_PER_PAGE)}
            >
              View More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreNotes;
