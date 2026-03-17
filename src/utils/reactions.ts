import { supabase } from '../lib/supabase';

// 특정 유저에게 온 응원 이모지 카운트 조회
export async function fetchReactionsForUser(
  toUser: string,
  team: string
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('reactions')
    .select('emoji')
    .eq('to_user', toUser)
    .eq('team', team);

  if (!data) return {};

  return data.reduce<Record<string, number>>((acc, row) => {
    acc[row.emoji] = (acc[row.emoji] ?? 0) + 1;
    return acc;
  }, {});
}

// 팀 전체 유저의 응원 카운트 조회 { [toUser]: { [emoji]: count } }
export async function fetchReactionsForTeam(
  team: string
): Promise<Record<string, Record<string, number>>> {
  const { data } = await supabase
    .from('reactions')
    .select('to_user, emoji')
    .eq('team', team);

  if (!data) return {};

  return data.reduce<Record<string, Record<string, number>>>((acc, row) => {
    if (!acc[row.to_user]) acc[row.to_user] = {};
    acc[row.to_user][row.emoji] = (acc[row.to_user][row.emoji] ?? 0) + 1;
    return acc;
  }, {});
}

// 응원 보내기
export async function sendReaction(
  fromUser: string,
  toUser: string,
  team: string,
  emoji: string
): Promise<void> {
  await supabase.from('reactions').insert({
    from_user: fromUser,
    to_user: toUser,
    team,
    emoji,
  });
}