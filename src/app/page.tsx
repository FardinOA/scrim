import { CurtainCall } from "@/components/curtain-call";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Notices } from "@/components/notices";
import { Pricing } from "@/components/pricing";
import { Questions } from "@/components/questions";
import { Rig } from "@/components/rig";
import { Show } from "@/components/show";

/*
  The silk drape opens the page and closes it. Between them: the console
  raised and taken apart, the rest of the cues, the developers' numbers, the
  notices, the box office and the questions behind flags.
*/
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Show />
        <Features />
        <Rig />
        <Notices />
        <Pricing />
        <Questions />
        <CurtainCall />
      </main>
      <Footer />
    </>
  );
}
