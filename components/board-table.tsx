"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Board } from "@/lib/dataTypes";

const BoardTable = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        setScores(data);
      } catch (error) {
        console.error("Erreur lors du chargement des scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <p className="text-white text-center">
        Accès aux archives confidentielles...
      </p>
    );
  }

  if (scores.length < 0) {
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="mb-6 text-2xl font-black text-white italic uppercase">
        Tableau de Chasse
      </h2>

      <Table className="w-250 h-80">
        <TableHeader>
          <TableRow>
            <TableHead>Rang</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead>Theme</TableHead>
            <TableHead>No de Questions</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((player: Board, index) => (
            <TableRow key={player._id || index}>
              {/* Rang : index + 1 pour ne pas commencer à 0 */}
              <TableCell className="font-bold text-blue-400">
                #{index + 1}
              </TableCell>

              {/* Agent  */}
              <TableCell className="font-medium text-white">
                {player.name}
              </TableCell>

              {/* Badge */}
              <TableCell>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 ${player.color || "text-slate-400"}`}
                >
                  {player.label || "Recrue"}
                </span>
              </TableCell>

              {/* Theme */}
              <TableCell className="font-medium text-white">
                {player.theme}
              </TableCell>

              {/* Nombre de question */}
              <TableCell className="font-medium text-white">
                {player.questionNumber}
              </TableCell>

              {/* Score */}
              <TableCell className="text-right font-black text-white text-lg">
                {player.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Agents recensés</TableCell>
            <TableCell className="text-right">{scores.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default BoardTable;
