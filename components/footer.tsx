"use client"

import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Bug, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-col items-center md:items-start gap-1">
            <h3 className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Could that be it?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
              Share your guitar riffs with the community
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("mailto:contact@couldthatbeit.com", "_blank")}
              className="flex items-center gap-1 h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Mail className="h-3 w-3" />
              Contact
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("mailto:ideas@couldthatbeit.com", "_blank")}
              className="flex items-center gap-1 h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <MessageCircle className="h-3 w-3" />
              Ideas
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("mailto:issues@couldthatbeit.com", "_blank")}
              className="flex items-center gap-1 h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Bug className="h-3 w-3" />
              Issues
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> for musicians
          </p>
        </div>
      </div>
    </footer>
  )
}
