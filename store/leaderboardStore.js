import { create } from 'zustand';
import { createClerkSupabaseClient } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const useLeaderboardStore = create((set, get) => ({
  userId: null,
  username: null,
  profilData: null,
  score: 0,
  words_typed: 0,
  accuracy: 0,
  difficulty: 'easy',
  timePlayed: 0,
  isGameOver: false,
  leaderboard: [],
  globalLeaderboard: [],
  isLoading: false,

  // Set user details (from Clerk)
  setUserDetails: (userId, username) => set({ userId, username }),

  // Set game state
  setGameState: (state) => set(state),

  // Reset game state
  resetGame: () => set({
    score: 0,
    words_typed: 0,
    accuracy: 0,
    timePlayed: 0,
    isGameOver: false,
  }),

  fetchGlobalLeaderboard: async (session) => {
    if (!session) {
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.rpc('global_board');

      if (error) {
        return null;
      }

      set({ globalLeaderboard: data });
      return data;
    } catch (err) {
      set({ globalLeaderboard: [], isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },


  fetchLeaderboard: async (session) => {
    if (!session) {
      return;
    }
  
    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('LeaderBoard')
        .select('*', { count: 'exact' })
        .order('score', { ascending: false });
  
      if (error) {
        return null;
      }
  
      set({ leaderboard: data });

      //real time setup
      supabase
       .from('LeaderBoard')
       .on('INSERT', payload => {
        set(state => ({
          leaderboard: [payload.new, ...state.leaderboard].sort((a, b) => b.score - a.score)
        }))
       })
       .on('UPDATE', payload => {
        set(state => ({
          leaderboard: state.leaderboard.map(entry => entry.id === payload.new.id ? payload.new : entry)
        }))
       })
       .subscribe();

      return data; // Return data for further use
    } catch (err) {
      set({ leaderboard: [], isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  saveLeaderboard: async (session, userId, payload) => {
    if (!session) {
      toast.error("Login required to save leaderboard entry. Please login and try again.");
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    try {
      await toast.promise(
        supabase.from("LeaderBoard").insert({
          user_id: userId,
          userName: payload.userName,
          difficulty: payload.difficulty,
          words_typed: payload.words_typed,
          correct_words_typed: payload.correct_words_typed,
          incorrect_words_typed: payload.incorrect_words_typed,
        }),
        {
          loading: "Saving leaderboard entry...",
          success: "Leaderboard entry saved successfully!",
          error: "Error saving leaderboard entry",
        }
      );
      get().fetchLeaderboard(session);
      get().fetchGlobalLeaderboard(session);
    } catch (err) {
      toast.error("Error saving leaderboard entry. Please try again later.");
    }
  },

  fetchProfileData: async (session, userId) => {
    if (!session || !userId) {
      toast.error("Login required to fetch profile data. Please login and try again.");
      return;
    }

    set({ isLoading: true });

    try {
      const leaderboardData = await get().fetchGlobalLeaderboard(session);

      if (!leaderboardData) {
        toast.error("Error fetching leaderboard data. Please try again later.");
        return;
      }

      const userProfile = leaderboardData.find(player => player?.user_id === userId);

      if (userProfile) {
        // Set the profile data in the store
        set({ profileData: userProfile });
        return userProfile;
      } else {
        // If user not found in leaderboard, set default values
        set({
          profileData: {
            user_id: userId,
            userName: "Anonymous",
            total_score: 0,
            total_wpm: 0,
            highest_wpm: 0,
            avg_accuracy: 0,
            difficulties_played: "",
            last_played: null,
            total_games_played: 0,
            rank: null
          }
        });
      }
    } catch (err) {
      set({ profileData: null });
      toast.error("Error fetching profile data. Please try again later.");
    }
  }
  
}));
export default useLeaderboardStore;
