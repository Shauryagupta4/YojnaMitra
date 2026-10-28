import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, fullName, photoURL, firebaseUid, state, persona } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      success: false,
      error: 'Supabase configuration or secret key is missing on the server'
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Check if user already exists in Supabase auth.users
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[Supabase Sync] listUsers notice:', listError.message);
    }

    let existingUser = usersData?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let supabaseUserId: string;

    if (!existingUser) {
      // 2. Create the user in Supabase auth.users so foreign key constraint on public.profiles succeeds
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || email.split('@')[0],
          avatar_url: photoURL || null,
          provider: 'google',
          firebase_uid: firebaseUid || null
        }
      });

      if (createError) {
        console.error('[Supabase Sync] createUser error:', createError);
        throw createError;
      }

      supabaseUserId = createData.user.id;
    } else {
      supabaseUserId = existingUser.id;
      // Update metadata with latest name/avatar/provider if changed
      try {
        await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
          user_metadata: {
            ...existingUser.user_metadata,
            full_name: fullName || existingUser.user_metadata?.full_name || email.split('@')[0],
            avatar_url: photoURL || existingUser.user_metadata?.avatar_url,
            firebase_uid: firebaseUid || existingUser.user_metadata?.firebase_uid,
            provider: 'google'
          }
        });
      } catch (updateErr) {
        console.warn('[Supabase Sync] updateUserById notice:', updateErr);
      }
    }

    // 3. Upsert profile into public.profiles
    const profilePayload = {
      id: supabaseUserId,
      email: email,
      full_name: fullName || email.split('@')[0],
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .maybeSingle();

    if (profileErr) {
      console.error('[Supabase Sync] profiles upsert error:', profileErr);
      throw profileErr;
    }

    return res.status(200).json({
      success: true,
      message: 'User successfully synchronized into Supabase auth and profiles table',
      profile: profile || profilePayload,
      userId: supabaseUserId
    });
  } catch (err: any) {
    console.error('[Supabase Sync Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to sync user with Supabase'
    });
  }
}
