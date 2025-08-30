"use client"

import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Bug, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Could that be it?
            </h3>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Share your guitar riffs with the community
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("mailto:contact@couldthatbeit.com", "_blank")}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("mailto:ideas@couldthatbeit.com", "_blank")}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Ideas
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("mailto:issues@couldthatbeit.com", "_blank")}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Issues
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500" /> for musicians
          </p>
        </div>
      </div>
    </footer>
  )
}
