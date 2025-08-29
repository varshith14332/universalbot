import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { GraduationCap, ArrowLeft, Star, Trophy, Target } from "lucide-react"

export default function Duolingo() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Duolingo Mode</h1>
            <p className="text-lg text-muted-foreground">
              Learn Languages with Universal Bot
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader className="py-12">
                <div className="mx-auto mb-6 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl mb-4">
                  Coming Soon: Learn Languages with Universal Bot
                </CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  We're building an interactive language learning experience that combines AI conversation, 
                  speech recognition, and gamified lessons to help you master new languages naturally.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-12">
                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="mx-auto mb-3 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Interactive Lessons</h3>
                    <p className="text-sm text-muted-foreground">
                      Gamified learning with points, streaks, and achievements
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Conversations</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice real conversations with our intelligent chatbot
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Pronunciation Training</h3>
                    <p className="text-sm text-muted-foreground">
                      Perfect your accent with speech recognition feedback
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Be the first to know when Duolingo Mode launches!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/chatbot">
                      <Button size="lg">
                        Try Chatbot Instead
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" disabled>
                      Notify Me When Ready
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
