import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee-01-utils/marquee";

const reviews = [
  {
    name: "Ken Masters",
    username: "@kmasters",
    body: "“Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”",
    profile: "https://cdn.21st.dev/assets/mirror/b5/b539abc60701ab9cbcd73f9241d13a14a09582a4fd06c65784cb5567d77a2e0e.webp",
  },
  {
    name: "Kira Athrun",
    username: "@kathrun",
    body: "“What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”",
    profile: "https://cdn.21st.dev/assets/mirror/2b/2bc5f22fa3400c61a2161d14e3dce5a0804badebfc1b3d9cbe844feaa3b72180.webp",
  },
  {
    name: "Lirael Nassun",
    username: "@lnassun",
    body: "“This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”",
    profile: "https://cdn.21st.dev/assets/mirror/e1/e1e172821860559f890ef5ef7c14cc66a6c1ec001f3bbeb6dddd349c0081dd6b.webp",
  },
  {
    name: "Jessica",
    username: "@jessica",
    body: "Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.",
    profile: "https://cdn.21st.dev/assets/mirror/61/61fda783ca2662349458bad61a434038016f05d6a14bd7c5a314f48c8ee8be03.webp",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "“We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”",
    profile: "https://cdn.21st.dev/assets/mirror/c5/c5ee2e124ea7334450d30a46607f793534f567e97d4b708cda110a06aeed4953.webp",
  },
  {
    name: "Kira Athrun",
    username: "@kathrun",
    body: "“What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”",
    profile: "https://cdn.21st.dev/assets/mirror/2b/2bc5f22fa3400c61a2161d14e3dce5a0804badebfc1b3d9cbe844feaa3b72180.webp",
  },
  {
    name: "Ken Masters",
    username: "@kmasters",
    body: "“Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”",
    profile: "https://cdn.21st.dev/assets/mirror/b5/b539abc60701ab9cbcd73f9241d13a14a09582a4fd06c65784cb5567d77a2e0e.webp",
  },
];

const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

const ReviewCard = ({
  profile,
  name,
  username,
  body,
}: {
  profile: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <Card className="relative h-full w-64 cursor-pointer overflow-hidden border-border bg-card shadow-none p-4 hover:border-white/20 transition-colors">
      <CardContent className="p-0 flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full object-cover"
            width="32"
            height="32"
            alt={name}
            src={profile}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className="text-xs font-medium text-muted-foreground truncate">
              {username}
            </p>
          </div>
        </div>
        <p className="text-sm line-clamp-2 text-foreground leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
};

export function TestimonialMarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review, idx) => (
          <ReviewCard key={`row1-${idx}-${review.username}`} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review, idx) => (
          <ReviewCard key={`row2-${idx}-${review.username}`} {...review} />
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
  );
}

export default TestimonialMarqueeDemo;
export { TestimonialMarqueeDemo as TestimonialMarquee };
