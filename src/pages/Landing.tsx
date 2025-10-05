import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Award, Users, Upload, Download } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  const navigate = useNavigate();

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
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 StudyHub. Empowering students to learn together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
