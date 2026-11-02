import { supabase } from "@/supabase";

export async function fetchUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null };
  return data;
}

export async function updateUserEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAcc() {
  const response = await fetch("/api/account/delete", { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Could not delete the account");
  await supabase.auth.signOut();
}
