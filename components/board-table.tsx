"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Board } from "@/lib/dataTypes";
import { useStore } from "@/Context/useStore";

const BoardTable = () => {
  const { name } = useStore();
  const [data, setData] = useState<{ top10: Board[]; userStats: any } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(
          `/api/leaderboard?name=${encodeURIComponent(name)}`,
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [name]);

  if (loading)
    return <p className="text-white text-center">Decryptage des archives...</p>;

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-5xl">
      {data?.userStats && (
        <div className="w-full mb-10 p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-md">
          <h3 className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-4">
            Votre Rapport de Terrain
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Rang Global</p>
              <p className="text-2xl font-black text-white">
                #{data.userStats.rank}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Succès</p>
              <p className="text-2xl font-black text-green-500">
                {data.userStats.correctAnswers || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Échecs</p>
              <p className="text-2xl font-black text-red-500">
                {data.userStats.wrongAnswers || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Score Total</p>
              <p className="text-2xl font-black text-blue-400">
                {data.userStats.score} pts
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-black text-white italic uppercase tracking-tighter">
        Top 10 : Élite de l'Agence
      </h2>

      <Table className="border border-white/5 bg-black/20 rounded-xl">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-16">Rang</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Thème</TableHead>
            <TableHead className="text-center text-green-500">✔</TableHead>
            <TableHead className="text-center text-red-500">✘</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.top10.map((player, index) => (
            <TableRow
              key={player._id}
              className={`border-white/5 ${player.name === name ? "bg-blue-500/20" : ""}`}
            >
              <TableCell className="font-bold text-blue-400">
                #{index + 1}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-white font-bold">{player.name}</span>
                  <span className="text-[9px] text-gray-500 uppercase">
                    {player.label || "Recrue"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-gray-300 text-xs">
                {player.theme}
              </TableCell>
              <TableCell className="text-center font-mono text-green-500">
                {player.correctAnswers || 0}
              </TableCell>
              <TableCell className="text-center font-mono text-red-500">
                {player.wrongAnswers || 0}
              </TableCell>
              <TableCell className="text-right font-black text-white">
                {player.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BoardTable;
