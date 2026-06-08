import { useQuery } from "@tanstack/react-query";
import CTA from "../components/CTA";
import Feedback from "../components/Feedback";
import Features from "../components/Features";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import LearningStyle from "../components/LearningStyle";
import client from "../api/client";

function Home() {
  const { data, isPending: landingLoading } = useQuery({
    queryKey: ["public", "landing-page"],
    queryFn: async () => {
      const res = await client.get("/public/landing-page");
      return res?.data?.data || {};
    },
    retry: false,
  });
  const sections = data?.sections || [];
  const isVisible = (key) =>
    sections.length === 0 || sections.some((s) => s?.key === key && s?.isVisible !== false);

  return (
    <div className="overflow-hidden">
      {isVisible("HERO_SECTION") ? <Hero /> : null}
      <Features />
      <HowItWorks />
      <LearningStyle />
      {isVisible("TESTIMONIALS") ? (
        <Feedback featuredReviews={data?.featuredReviews ?? []} reviewsLoading={landingLoading} />
      ) : null}
      <CTA />
    </div>
  );
}

export default Home;
