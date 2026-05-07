import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ReputationRecord, VoteRecord, VoteValue } from "./types";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}
function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? getAnonKey();
}

function isConfigured(): boolean {
  const url = getSupabaseUrl();
  return url.startsWith("http://") || url.startsWith("https://");
}

let _publicClient: SupabaseClient | null = null;
function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(getSupabaseUrl(), getAnonKey());
  }
  return _publicClient;
}

function getAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceKey());
}

// Score de réputation par défaut pour chaque source (50/100 = neutre)
export const DEFAULT_REPUTATIONS: Record<string, number> = {
  "open-meteo-ecmwf": 50,
  "open-meteo-gfs": 50,
  "open-meteo-icon": 50,
  "yr-no": 50,
  "wttr-in": 50,
  "openweathermap": 50,
  "weatherapi": 50,
  "tomorrow-io": 50,
  "visual-crossing": 50,
  "accuweather": 50,
  "pirate-weather": 50,
  "meteofrance": 50,
};

export async function getReputations(): Promise<Record<string, number>> {
  if (!isConfigured()) return { ...DEFAULT_REPUTATIONS };

  try {
    const { data, error } = await getPublicClient()
      .from("reputations")
      .select("source, score");

    if (error || !data) return { ...DEFAULT_REPUTATIONS };

    const result = { ...DEFAULT_REPUTATIONS };
    for (const row of data) result[row.source] = row.score;
    return result;
  } catch {
    return { ...DEFAULT_REPUTATIONS };
  }
}

export async function getAllReputationRecords(): Promise<ReputationRecord[]> {
  if (!isConfigured()) {
    return Object.keys(DEFAULT_REPUTATIONS).map((source) => ({
      source,
      score: DEFAULT_REPUTATIONS[source],
      nb_votes: 0,
      nb_correct: 0,
      nb_partial: 0,
      nb_incorrect: 0,
      updated_at: new Date().toISOString(),
    }));
  }

  try {
    const { data, error } = await getPublicClient()
      .from("reputations")
      .select("*")
      .order("score", { ascending: false });

    if (error || !data) return [];
    return data as ReputationRecord[];
  } catch {
    return [];
  }
}

export async function checkVoteExists(
  ipHash: string,
  ville: string,
  date: string
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const { count } = await getPublicClient()
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("ville", ville)
      .eq("date", date);

    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function submitVote(vote: VoteRecord): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: "Base de données non configurée" };
  }

  try {
    const admin = getAdminClient();

    const { error: voteError } = await admin.from("votes").insert({
      ville: vote.ville,
      date: vote.date,
      vote: vote.vote,
      metier: vote.metier ?? "grand_public",
      ip_hash: vote.ip_hash,
    });

    if (voteError) throw new Error(voteError.message);

    await updateAllReputations(vote.vote, vote.metier);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
}

async function updateAllReputations(vote: VoteValue, metier?: string): Promise<void> {
  const admin = getAdminClient();
  const isProfessional = metier && metier !== "grand_public" && metier !== "autre";
  const voteWeight = isProfessional ? 1.5 : 1.0;
  const adjustment =
    vote === "oui" ? 5 * voteWeight : vote === "partiellement" ? 1 * voteWeight : -3 * voteWeight;

  const { data: reps } = await admin
    .from("reputations")
    .select("source, score, nb_votes, nb_correct, nb_partial, nb_incorrect");

  for (const rep of reps ?? []) {
    const newScore = Math.min(100, Math.max(0, rep.score + adjustment));
    const updates: Record<string, number> = {
      score: Math.round(newScore * 10) / 10,
      nb_votes: rep.nb_votes + 1,
    };
    if (vote === "oui") updates.nb_correct = rep.nb_correct + 1;
    else if (vote === "partiellement") updates.nb_partial = rep.nb_partial + 1;
    else updates.nb_incorrect = rep.nb_incorrect + 1;

    await admin.from("reputations").update(updates).eq("source", rep.source);
  }
}
