import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { MessageSquare, Volume2, Languages, HandIcon } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Universal Bot
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Breaking Barriers in Communication
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience seamless communication across all languages with our
            advanced AI-powered chatbot. From text to speech, speech to text,
            and real-time translation - Universal Bot connects the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chatbot">
              <Button size="lg" className="px-8 py-3 text-lg">
                Try Chatbot
              </Button>
            </Link>
            <Link to="/duolingo">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Duolingo Mode
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-3 text-lg"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the cutting-edge capabilities that make Universal Bot
              your perfect communication companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Text to Speech */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Text ↔ Speech</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Convert text to natural-sounding speech and speech back to
                  text with high accuracy
                </CardDescription>
              </CardContent>
            </Card>

            {/* Speech to Text */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Speech ↔ Text</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced speech recognition that understands context and
                  converts spoken words to precise text
                </CardDescription>
              </CardContent>
            </Card>

            {/* Translation */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Translation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Powered by Google Translate API for instant, accurate
                  translation across 100+ languages
                </CardDescription>
              </CardContent>
            </Card>

            {/* Sign Language Recognition */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <HandIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sign Language</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Revolutionary sign language recognition technology (coming
                  soon) for inclusive communication
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Break Communication Barriers?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of users who trust Universal Bot for their
            communication needs. Start your journey towards seamless global
            communication today.
          </p>
          <Link to="/chatbot">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
