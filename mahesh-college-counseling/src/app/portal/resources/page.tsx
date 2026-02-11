"use client";

import Link from "next/link";
import { Header } from "@/components/Header";

export default function PortalResourcesPage() {
  const resources = [
    {
      title: "Common App Essay Guide",
      description: "Structure and prompts for the main essay.",
    },
    {
      title: "Supplemental Essay Tips",
      description: "School-specific supplement strategies.",
    },
    {
      title: "Extracurricular Strategy",
      description: "Building a compelling activities list.",
    },
    {
      title: "College List Template",
      description: "Reach, target, safety framework.",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link href="/portal" className="text-sm text-neutral-600 hover:text-black mb-6 inline-block">
            ← Portal
          </Link>
          <h1 className="text-2xl font-semibold mb-2">Resources</h1>
          <p className="text-neutral-600 mb-12">
            Guides and templates for your college application.
          </p>

          <div className="space-y-4">
            {resources.map((r, i) => (
              <div
                key={i}
                className="border border-neutral-200 p-6 hover:border-black transition-colors"
              >
                <h3 className="font-medium mb-1">{r.title}</h3>
                <p className="text-sm text-neutral-600">{r.description}</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Ask Mahesh in your next call for access.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
