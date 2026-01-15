import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Award, Users, Upload, Download, Home, Search, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DonateDialog } from "@/components/DonateDialog";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [donatePromptOpen, setDonatePromptOpen] = useState(false);

  // After login, softly prompt donation once unless dismissed or already donor
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

  const handleProtectedAction = (action: string, path: string) => {
    if (!user) {
      toast({
        title: "Sign Up Required",
        description: "Please sign up to access the notes and unlock your bright future!",
        variant: "default",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } else {
      navigate(path);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleMobileProtectedAction = (action: string, path: string) => {
    setIsMobileMenuOpen(false);
    handleProtectedAction(action, path);
  };

  const features = [
    {
      icon: BookOpen,
      title: "Share Notes",
      description: "Upload and access quality notes from fellow students across all subjects",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your academic journey with analytics and assignment tracking",
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description: "Get points for valuable contributions and unlock exclusive prizes",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Engage with peers through reviews, comments, and collaborative studying",
    },
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Share your notes seamlessly with title, description, and subject tags",
    },
    {
      icon: Download,
      title: "Quick Access",
      description: "Search, filter, and download notes instantly when you need them",
    },
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

            {/* Desktop Quick Links - Center */}
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
                onClick={() => handleProtectedAction("explore", "/explore")}
              >
                <Search className="w-4 h-4" />
                Explore
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10"
                onClick={() => handleProtectedAction("upload", "/upload")}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>

            {/* Desktop User Section - Right */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu - Smooth Animation */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-border py-4 space-y-2">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleMobileNavigation("/")}
                >
                  <Home className="w-5 h-5" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleMobileProtectedAction("explore", "/explore")}
                >
                  <Search className="w-5 h-5" />
                  Explore
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleMobileProtectedAction("upload", "/upload")}
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </Button>
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-border pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{user.user_metadata?.full_name || user.email}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleMobileNavigation("/dashboard")}
                    >
                      <Home className="w-5 h-5" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleMobileNavigation("/auth")}
                    >
                      <UserIcon className="w-5 h-5" />
                      Sign In
                    </Button>
                    <Button 
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleMobileNavigation("/auth")}
                    >
                      <UserIcon className="w-5 h-5" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Learn. Share. Grow Together.
              </h1>
              <p className="text-xl text-muted-foreground">
                Join thousands of students sharing knowledge, tracking progress, and achieving academic excellence together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <img
                src={heroImage}
                alt="Students collaborating and studying together"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete platform designed for modern students who want to learn smarter, not harder
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent-glow mb-4">
              <Award className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Get Rewarded for Helping Others</h2>
            <p className="text-xl text-muted-foreground">
              Earn +10 points for each valuable note you share. Reach 500 points to unlock exclusive prizes and rewards!
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">10+</div>
                <p className="text-muted-foreground">Points per note</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-secondary">500</div>
                <p className="text-muted-foreground">Points for rewards</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-accent">∞</div>
                <p className="text-muted-foreground">Learning opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join our community of ambitious students today and transform the way you learn
          </p>
          <Button 
            variant="accent" 
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg"
          >
            Sign Up Now - It's Free!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <DonateDialog defaultOpen={donatePromptOpen} triggerVariant="secondary" />
          </div>
          <div className="text-center">
            <p>&copy; 2025 CollegeStar. Empowering students to learn together.</p>
            <p className="mt-2">
              Developed by{' '}
              <a
                href="https://subrata-s-portfolio.vercel.app/"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subrata Bag
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
