"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  FileQuestion,
  GraduationCap,
  SendHorizontal,
} from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { createChat } from "../actions";

// Framer Motion Variants remain the same
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.4,
    },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.6,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
    },
  },
};

interface WelcomeMessageProps {
  session: Session | null;
}

export function WelcomeMessage({ session }: WelcomeMessageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  const handleFeatureClick = (feature: string) => {
    toast.info("Coming Soon!", {
      description: `${feature} feature will be available in a future update.`,
      duration: 3000,
      position: "top-center",
      action: {
        label: "Dismiss",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsLoading(true);
      if (!session?.user?.id) throw new Error("Unauthorized");

      const chat = await createChat(
        {
          userId: session.user.id,
          initialMessage: message,
        },
        session,
      );

      router.push(`/chat/${chat.id}?welcome=true`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to start chat", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-6xl font-bold mb-4 text-center">
          <span className="text-osu">
            Take Charge of
            <br /> Your Learning
          </span>
        </h1>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-lg text-muted-foreground mb-12 text-center max-w-2xl"
      >
        Ask me anything about your courses, assignments, or study materials
      </motion.p>

      <motion.div variants={itemVariants} className="w-full space-y-4 relative">
        <form onSubmit={handleSubmit} className="relative group">
          <Textarea
            placeholder="Ask a question about your coursework..."
            className="min-h-[100px] max-h-[400px] resize-none text-lg p-6 pr-14 rounded-2xl transition-all duration-200 
              bg-background border-input hover:border-osu/50
              focus:border-orange-500/90 focus:none
              focus:shadow-[0_0_30px_-8px_rgba(234,88,12,0.2)]"
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-3 right-3 rounded-xl hover:bg-osu transition-colors
              bg-osu/90 focus:ring-orange-600/50
              group-hover:opacity-100 disabled:opacity-50"
            disabled={isLoading}
          >
            <SendHorizontal
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </form>
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mt-16 mb-8"
      >
        Or choose from these suggested prompts
      </motion.h3>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        variants={cardContainerVariants}
      >
        <SuggestedPrompt
          icon={<Brain className="h-8 w-8 text-osu" />}
          title="Study Guide"
          description="Create a personalized study guide from your course materials"
          onClick={() => handleFeatureClick("Study Guide")}
        />
        <SuggestedPrompt
          icon={<FileQuestion className="h-8 w-8 text-osu" />}
          title="Assignment Help"
          description="Get guidance on assignments and problem-solving"
          onClick={() => handleFeatureClick("Assignment Help")}
        />
        <SuggestedPrompt
          icon={<BookOpen className="h-8 w-8 text-osu" />}
          title="Content Review"
          description="Review and understand complex course concepts"
          onClick={() => handleFeatureClick("Content Review")}
        />
        <SuggestedPrompt
          icon={<GraduationCap className="h-8 w-8 text-osu" />}
          title="Exam Prep"
          description="Practice questions and exam preparation"
          onClick={() => handleFeatureClick("Exam Prep")}
        />
      </motion.div>
    </motion.div>
  );
}

function SuggestedPrompt({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={cardVariants}
      onClick={onClick}
      className="p-6 rounded-xl border border-input bg-background/50 
        hover:bg-accent text-left transition-all duration-300 
        hover:shadow-[0_0_30px_-8px_rgba(234,88,12,0.2)] hover:border-orange-600/50
        flex flex-col items-start gap-3 group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-3 rounded-lg bg-muted group-hover:bg-orange-600/10 transition-colors duration-300">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  );
}
