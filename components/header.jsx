"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/play" },
  { name: "Free Type", href: "/play/story" },
  { name: "Gallery", href: "/play/gallery" },
  { name: "Leaderboard", href: "/play/leaderboard" },
  { name: "Credits", href: "/play/credits" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="px relative z-[1000] lg:px-6 h-14"
      style={{
        backgroundImage:
          "linear-gradient(to left bottom, #003049, #1b2338, #1d1724, #160d13, #000000);",
      }}
    >
      <nav
        aria-label="Global"
        className="flex items-center justify-between h-[inherit]"
      >
        <Link className="flex items-center justify-items-center" href="/">
          <Image
            src="/logoBlack.png"
            alt="Echoes Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="ml-2 text-2xl font-bold text-white">Echoes</span>
        </Link>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 lg:items-center">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm/6 font-semibold text-[#97c0d8] relative pb-1 transition-all ${
                  isActive
                    ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#97c0d8] after:rounded-full"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="secondary"
                className="py-2 px-12 bg-[#eef0f2] text-black"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto gradient-hero-4 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <Image
                src="/logoBlack.png"
                alt="Echoes Logo"
                width={32}
                height={32}
                className="rounded-lg h-8 w-auto"
              />
              <span className="sr-only">Echoes</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-white"
            >
              <span className="sr-only">Close menu</span>
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-50 ${
                        isActive
                          ? "border-l-4 border-[#97c0d8] bg-gray-800/50"
                          : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="py-6">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      variant="secondary"
                      className="py-2 px-12 bg-[#eef0f2] text-black"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
