import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UploadNotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload notes",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // Insert note record
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          file_url: publicUrl,
          file_name: file.name,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Your notes have been uploaded successfully",
      });

      navigate("/explore");
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Upload Notes
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle>Share Your Notes</CardTitle>
            <CardDescription>
              Help fellow students and earn +10 points for each valuable note
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Data Structures - Complete Notes"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your notes..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., programming, algorithms, semester-3"
                />
              </div>

              <div>
                <Label htmlFor="file">Upload File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX
                </p>
              </div>

              <Button type="submit" disabled={uploading} className="w-full" variant="hero">
                {uploading ? "Uploading..." : "Upload Notes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadNotes;
