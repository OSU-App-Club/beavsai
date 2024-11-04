"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const routes = [
    { href: "/upload", label: "Upload" },
    { href: "/files", label: "Files" },
    { href: "/chat", label: "Chat" },
  ];

  const NavLinks = ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <div className={className}>
      {routes.map((route) => (
        <Link key={route.href} href={route.href} onClick={onClick}>
          <Button
            variant={isActive(route.href) ? "secondary" : "ghost"}
            className={`${isActive(route.href) ? "bg-muted" : ""}`}
          >
            {route.label}
          </Button>
        </Link>
      ))}
    </div>
  );

  const isActive = (path: string) => pathname === path;
  return (
    <header
      className={cn("sticky top-0 z-40 w-full", {
        "border-b-[1px]": isActive("/chat"),
      })}
    >
      <div className="container h-14 px-4 w-screen flex justify-between">
        {/* Logo section */}
        <div className="font-bold flex items-center ml-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="relative font-bold text-xl px-1 py-1">
              <span className="absolute inset-0 bg-orange-600 transform rotate-2 rounded-sm -z-10"></span>
              beavs.ai
            </span>
          </Link>
        </div>

        {/* Mobile section */}
        <div className="flex md:hidden gap-4 items-center">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="px-2">
              <Menu
                className="flex md:hidden h-5 w-5"
                onClick={() => setIsOpen(true)}
              >
                <span className="sr-only">Menu Icon</span>
              </Menu>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="font-bold text-xl">
                  <span className="relative font-bold text-xl px-1 py-1">
                    <span className="absolute inset-0 bg-orange-600 transform rotate-2 rounded-sm -z-10"></span>
                    beavs.ai
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                <NavLinks
                  className="flex flex-col space-y-2"
                  onClick={() => setIsOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop section */}
        <div className="hidden md:flex gap-4 justify-center items-center">
          <NavLinks className="flex items-center gap-2" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
