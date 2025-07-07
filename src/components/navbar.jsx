'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import supabase from '@/lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('firstname')
          .eq('id', user.id)
          .single();

        if (!error) {
          setProfile(profileData);
        }
      }
    });

    // Realtime auth updates
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('firstname')
            .eq('id', currentUser.id)
            .single();

          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-black">
      <Link href="/" className="text-2xl font-bold text-black dark:text-white">
        MarkInsights
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Hi, {profile?.firstname || user.email.split('@')[0]}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
