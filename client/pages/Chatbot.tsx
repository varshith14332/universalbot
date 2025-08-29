import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Link } from "react-router-dom"
import { useState } from "react"
import { 
  Send, 
  Mic, 
  Volume2, 
  Languages, 
  HandIcon, 
  Menu, 
  Home, 
  GraduationCap, 
  Settings 
} from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Universal Bot. I can help you with text-to-speech, speech-to-text, translation, and more. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! This is a demo response. In a real implementation, I would process your request and provide helpful assistance.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const SidebarContent = () => (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Navigation</h3>
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/duolingo">
            <Button variant="ghost" className="w-full justify-start">
              <GraduationCap className="mr-2 h-4 w-4" />
              Duolingo Mode
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r bg-muted/10">
          <SidebarContent />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden p-4 border-b">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Feature Buttons */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Mic className="mr-2 h-4 w-4" />
                Speech-to-Text
              </Button>
              <Button variant="outline" size="sm">
                <Volume2 className="mr-2 h-4 w-4" />
                Text-to-Speech
              </Button>
              <Button variant="outline" size="sm">
                <Languages className="mr-2 h-4 w-4" />
                Translate
              </Button>
              <Button variant="outline" size="sm" disabled>
                <HandIcon className="mr-2 h-4 w-4" />
                Sign Language (Future)
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] ${message.isUser ? 'bg-primary text-primary-foreground' : ''}`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
