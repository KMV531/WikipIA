"use client";

import { ThemeForm } from "@/components/theme-form";
import Particles from "@/components/Particles";

export default function ThemePage() {
  return (
    <main className="relative min-h-svh w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#000000"]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm p-6 backdrop-blur-2xl bg-card rounded-lg">
        <ThemeForm />
      </div>
    </main>
  );
}
