import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";
import {
  CheckCircle,
  Trophy,
  Users,
  Calendar,
  Code,
  MessageSquare,
  ImageIcon,
  Search,
  GitBranch,
  Share,
  Zap,
  Sparkles,
  CloudUploadIcon,
  GlobeIcon,
  KeyIcon,
  SmartphoneIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 text-white/70 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Open Source Competition
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            T3 Chat
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
              Cloneathon
            </span>
          </h1>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            It's like a hackathon, but everyone's building a T3 Chat clone.
          </p>

          {/* Subtle Countdown Timer */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* Register Button */}
          <div className="mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Update Your Submission
              </Button>
            </Link>
          </div>
        </div>

        {/* Competition Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-12 h-12 text-white opacity-70 mb-4" />
            <h3 className="text-white text-2xl font-medium mb-2">1 Week</h3>
            <p className="text-white/50">
              Complete your clone within the competition timeframe
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Trophy className="w-12 h-12 text-white opacity-70 mb-4" />
            <h3 className="text-white text-2xl font-medium mb-2">$10,000+</h3>
            <p className="text-white/50">
              Total prize pool for winners and participants
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Code className="w-12 h-12 text-white opacity-70 mb-4" />
            <h3 className="text-white text-2xl font-medium mb-2">
              Open Source
            </h3>
            <p className="text-white/50">
              All submissions must be open source and publicly available
            </p>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Prizes & Rewards
          </h2>

          <div className="max-w-5xl mx-auto">
            {/* Main Prize Pool */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Cash Prizes
                </h3>
                <p className="text-white/70">
                  Awarded to the top 3 submissions
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                      🥇 WINNER
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3 mt-2" />
                  <h4 className="text-white font-bold mb-2">1st Place</h4>
                  <div className="text-4xl font-bold text-white mb-1">
                    $5,000
                  </div>
                  <p className="text-white/60 text-sm">Grand Prize Winner</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-300 text-black px-3 py-1 rounded-full text-xs font-bold">
                      🥈 RUNNER-UP
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3 mt-2" />
                  <h4 className="text-white font-bold mb-2">2nd Place</h4>
                  <div className="text-3xl font-bold text-white mb-1">
                    $2,000
                  </div>
                  <p className="text-white/60 text-sm">Second Place Prize</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      🥉 THIRD
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-amber-600 mx-auto mb-3 mt-2" />
                  <h4 className="text-white font-bold mb-2">3rd Place</h4>
                  <div className="text-3xl font-bold text-white mb-1">
                    $1,000
                  </div>
                  <p className="text-white/60 text-sm">Third Place Prize</p>
                </div>
              </div>
            </div>

            {/* Community Prize */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Top 8 Finalists
              </h3>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                1 Year Free T3 Chat
              </div>
              <p className="text-white/60">
                All finalists in the top 8 receive complimentary access to T3
                Chat
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Requirements
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-white/70 text-lg mb-8 text-center">
              Build a cool AI chat app. Have fun with it. Make it look and feel
              however you like.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Core Requirements
                </h3>
                <span className="text-white/60 text-sm">
                  The minimum to qualify for a prize
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <MessageSquare className="w-6 h-6 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white text-lg font-medium">
                        Chat with Various LLMs
                      </h4>
                      <p className="text-white/50">
                        Implement support for multiple language models and
                        providers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 ml-9">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Required</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <Users className="w-6 h-6 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white text-lg font-medium">
                        Authentication & Sync
                      </h4>
                      <p className="text-white/50">
                        User authentication with chat history synchronization
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 ml-9">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Required</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <GlobeIcon className="w-6 h-6 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white text-lg font-medium">
                        Browser Friendly
                      </h4>
                      <p className="text-white/50">
                        {
                          "As much as we'd like to, we can't realistically get everyone's native apps set up"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 ml-9">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Required</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <Zap className="w-6 h-6 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white text-lg font-medium">
                        Easy to Try
                      </h4>
                      <p className="text-white/50">
                        We need an easy way to try out what you've built!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 ml-9">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Required</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Bonus Features
                </h3>
                <span className="text-white/60 text-sm">
                  Ideas to go above and beyond
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                {[
                  {
                    icon: CloudUploadIcon,
                    title: "Attachment Support",
                    desc: "Allow users to upload files (images and pdfs)",
                  },
                  {
                    icon: ImageIcon,
                    title: "Image Generation Support",
                    desc: "AI-powered image generation capabilities",
                  },
                  {
                    icon: Code,
                    title: "Syntax Highlighting",
                    desc: "Beautiful code formatting and highlighting",
                  },
                  {
                    icon: Zap,
                    title: "Resumable Streams",
                    desc: "Continue generation after page refresh",
                  },
                  {
                    icon: GitBranch,
                    title: "Chat Branching",
                    desc: "Create alternative conversation paths",
                  },
                  {
                    icon: Share,
                    title: "Chat Sharing",
                    desc: "Share conversations with others",
                  },
                  {
                    icon: Search,
                    title: "Web Search",
                    desc: "Integrate real-time web search",
                  },
                  {
                    icon: KeyIcon,
                    title: "Bring Your Own Key",
                    desc: "Use your own API keys",
                  },
                  {
                    icon: SmartphoneIcon,
                    title: "Mobile App",
                    desc: "Why not ship mobile and web?",
                  },
                  {
                    icon: Sparkles,
                    title: "Anything Else",
                    desc: "Get creative - we love unique ideas :)",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-medium">
                        {feature.title}
                      </h4>
                      <p className="text-white/50 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Judges Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Meet the Judges
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-white/70 text-lg mb-8 text-center">
              These nerds will decide the winners. They have no formal criteria,
              just vibes.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Theo",
                  role: "Personality Hire",
                  twitterHandle: "theo",
                  avatar: "/avatars/theo-pic.jpg",
                },
                {
                  name: "Mark",
                  role: "Writes Theo's Code",
                  twitterHandle: "r_marked",
                  avatar: "/avatars/mark-pic.jpg",
                },
                {
                  name: "Julius",
                  role: "Actual Developer",
                  twitterHandle: "jullerino",
                  avatar: "/avatars/julius-pic.jpg",
                },
              ].map((judge, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Image
                      src={judge.avatar}
                      width={80}
                      height={80}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-white font-medium">{judge.name}</h3>
                  <p className="text-white/50 text-sm mb-1">{judge.role}</p>
                  <Link
                    href={`https://x.com/${judge.twitterHandle}`}
                    className="text-white/70 hover:text-white text-sm"
                    target="_blank"
                  >
                    @{judge.twitterHandle.toLowerCase()}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Competition Rules
          </h2>

          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <p className="text-white/90">
                  <strong>Open Source Requirement:</strong> Submissions must be
                  open source with a permissive license (MIT, Apache, BSD etc.)
                  and hosted on GitHub
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <p className="text-white/90">
                  <strong>Age Requirement:</strong> Must be 18+ to be eligible
                  for prizes
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <p className="text-white/90">
                  <strong>Team Size:</strong> No more than 4 people per team
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <p className="text-white/90">
                  <strong>Code of Conduct:</strong> Don't harass anyone please
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <p className="text-white/90">
                  <strong>Content Usage:</strong> Theo might use your submission
                  for content btw
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions (FAQ)
          </h2>

          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Can I submit work that I started before the competition
                  started?
                </h3>
                <p className="text-white/70">
                  Yes, absolutely. As long as it is fully open source, you can
                  use whatever you've built in the past (we will judge it harder
                  though)
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Inference is expensive, can I require bringing your own key?
                </h3>
                <p className="text-white/70">
                  Absolutely fine - just make sure that OpenRouter is one of the
                  BYOK options (makes testing much easier for us)
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Does it have to be a 1 to 1 T3 Chat clone?
                </h3>
                <p className="text-white/70">
                  No! The more creative the better, but feel free to clone as
                  well. Just, uh, make sure it's clear that it's not the ACTUAL
                  T3 Chat
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Do I have to build a web app?
                </h3>
                <p className="text-white/70">
                  Web apps make things significantly easier for our judges to
                  check out. If you ALSO build a mobile app and have an easy way
                  for us to test it via TestFlight, we might check it out
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Do all team members have to be 18+?
                </h3>
                <p className="text-white/70">
                  {
                    "As long as the submitter is 18+ and can file the required paperwork upon winning, all is good :)"
                  }
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Can I vibe code my submission?
                </h3>
                <p className="text-white/70">
                  Sure, but, uh...good luck with that.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Update Your Submission
              </Button>
            </Link>
            <Link
              href="https://github.com/t3dotgg/t3-cloneathon"
              target="_blank"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/5"
              >
                View GitHub
              </Button>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              By participating, you agree to our{" "}
              <Link
                href="/terms-and-conditions"
                className="text-white/60 hover:text-white/80 underline underline-offset-2"
              >
                Terms and Conditions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
