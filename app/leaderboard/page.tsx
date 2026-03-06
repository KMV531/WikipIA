"use client";

import BoardTable from "@/components/board-table";
import Particles from "@/components/Particles";
import { Button } from "@/components/ui/button";
import { useStore } from "@/Context/useStore";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaderBoard() {
  const { resetGame } = useStore();
  const router = useRouter();

  function handleGoHome() {
    resetGame();
    router.push("/");
  }

  return (
    <main className="relative min-h-svh w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={[
            "#88E7FA ",
            "#ac63ff ",
            "#637cff ",
            "#3B82F6 ",
            "#EC4899 ",
          ]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={300}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className="relative z-10 p-6 backdrop-blur-2xl rounded-lg">
        <BoardTable />
        <div className="">
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="cursor-pointer h-14 px-8 bg-blue-600 hover:bg-blue-500 text-lg font-bold rounded-xl flex items-center gap-2"
          >
            <Home className="w-5 h-5" /> Retour a l&apos;accueil
          </Button>
        </div>
      </div>
    </main>
  );
}
