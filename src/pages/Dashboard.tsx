import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Upload, Award, FileText, LogOut, Home, Search, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DonateDialog } from "@/components/DonateDialog";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [donatePromptOpen, setDonatePromptOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const dismissed = localStorage.getItem("donatePromptDismissed") === "true";
      const donor = (user?.user_metadata as Record<string, unknown>)?.donorVerified || localStorage.getItem("donorVerified") === "true";
      if (!dismissed && !donor) {
        setTimeout(() => setDonatePromptOpen(true), 1200);
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    logout();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Notes Uploaded", value: "0", icon: Upload, color: "from-primary to-secondary" },
    { label: "Notes Downloaded", value: "0", icon: BookOpen, color: "from-secondary to-primary" },
    { label: "Total Points", value: "0", icon: Award, color: "from-accent to-accent-glow" },
    { label: "Assignments", value: "0", icon: FileText, color: "from-primary to-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section - Left */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CollegeStar
              </h1>
            </div>

            {/* Quick Links - Center */}
            <div className="hidden md:flex items-center gap-1">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10"
                onClick={() => navigate("/explore")}
              >
                <Search className="w-4 h-4" />
                Explore
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10"
                onClick={() => navigate("/upload")}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>

            {/* User Section - Right */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                    onClick={() => navigate("/profile")}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate("/auth")}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Quick Links */}
          <div className="md:hidden border-t border-border py-3">
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/explore")}
              >
                <Search className="w-4 h-4" />
                Explore
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/upload")}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "Student"}!
          </h2>
          <p className="text-muted-foreground">Here's an overview of your academic journey</p>
        </div>

        {/* Profile Completion Banner */}
        {user && (!(user?.user_metadata as Record<string, unknown>)?.profileCompletion || ((user?.user_metadata as Record<string, unknown>)?.profileCompletion as number) < 100) && (
          <Card className="mb-8 border-dashed">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Complete your profile</CardTitle>
                <CardDescription>
                  {Math.max(((user?.user_metadata as Record<string, unknown>)?.profileCompletion as number) || 0, 0)}% complete — finish your profile to unlock tailored recommendations
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/onboarding")}>Continue Profile</Button>
            </CardHeader>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="animate-scale-in hover:shadow-lg transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-slide-up hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Upload Notes</CardTitle>
              <CardDescription>
                Share your notes with fellow students and earn points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={() => navigate("/upload")}>
                Upload New Note
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-slide-up hover:shadow-xl transition-all" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Browse Notes</CardTitle>
              <CardDescription>
                Discover and download notes from your peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/explore")}>
                Explore Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="mt-8">
          <Card className="animate-fade-in bg-gradient-to-br from-accent/10 to-background border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>Reward Progress</CardTitle>
                  <CardDescription>0 / 500 points to unlock your first reward</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-accent-glow transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Upload valuable notes to earn points. +10 points for each approved note!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Donate */}
        <div className="mt-12 border-t border-border pt-8 flex items-center justify-center">
          <DonateDialog defaultOpen={donatePromptOpen} triggerVariant="secondary" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
