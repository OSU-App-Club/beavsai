import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div>
      <div className="flex items-center justify-center min-h-[93vh] bg-background bg-fixed bg-cover bg-bottom error-bg">
        <div className="row">
          <div className="text-center -translate-y-1/2">
            <div className="relative">
              <h1 className="relative text-9xl tracking-tighter-less text-shadow font-sans font-bold text-osu">
                <span>4</span>
                <span>0</span>
                <span>4</span>
              </h1>
            </div>
            <h5 className="dark:text-white font-semibold mt-3">
              Page not found
            </h5>
            <p className="dark:text-white mt-2 mb-6">
              Sorry, but the page you are looking for doesn&apos;t exist.
            </p>
            <Link
              className={cn(
                "text-white",
                `${buttonVariants({ variant: "link" })}`,
              )}
              href="/"
            >
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
