import NextLink from "next/link";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";

export default function Landing() {
  return (
    <section className="flex flex-col justify-center items-center gap-4 py-8 md:py-10 min-h-screen">
      <div className="inline-block justify-center max-w-xl font-roboto text-center">
        <span className={title()}>Make industries&nbsp;</span>
        <span className={title({ color: "green", class: "font-grotesk" })}>
          safer&nbsp;
        </span>
        <br />
        <span className={title()}> without manual monitoring. </span>
        <div className={subtitle({ class: "mt-4 max-w-md mx-auto" })}>
          Real-time, AI-powered CCTV analysis for PPE compliance and accident
          prevention.
        </div>
      </div>

      <div className="flex gap-3">
        <NextLink
          className="flex justify-start items-center gap-1"
          href="/signup"
        >
          <Button color="primary" radius="md" size="lg" variant="shadow">
            Get Started
          </Button>
        </NextLink>
        <Link
          isExternal
          className={buttonStyles({
            variant: "shadow",
            radius: "md",
            size: "lg",
          })}
          href={siteConfig.links.demo}
        >
          See Demo
        </Link>
      </div>
    </section>
  );
}
