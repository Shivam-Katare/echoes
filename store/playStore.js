import { createClerkSupabaseClient } from "@/lib/supabaseClient";
import { create } from "zustand";

const usePlayStore = create((set) => ({
  words: [],
  paras: [],
  gameData: [],
  checkpoint: [],
  galleryImages: [],
  isLoading: false,

  fetchCheckpoint: async (session, userId) => {
    if (!session) {
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("user_checkpoint")
        .select("*")
        .eq("user_id", userId)
        .order("chapter_id", { ascending: true });

      if (error) {
        set({
          checkpoint: [
            {
              id: 0, // Default ID
              created_at: new Date().toISOString(), // Default timestamp
              chapter_id: 1,
              last_chunk_id: 0,
              user_id: userId || "", // Use provided userId or empty string
            },
          ],
          isLoading: false,
        });
        return;
      }

      // Set default if data is empty or null
      set({
        checkpoint:
          data && data.length > 0
            ? data
            : [
                {
                  id: 0, // Default ID
                  created_at: new Date().toISOString(), // Default timestamp
                  chapter_id: 1,
                  last_chunk_id: 0,
                  user_id: userId || "", // Use provided userId or empty string
                },
              ],
        isLoading: false,
      });
    } catch (error) {
      set({
        checkpoint: [
          {
            id: 0, // Default ID
            created_at: new Date().toISOString(), // Default timestamp
            chapter_id: 1,
            last_chunk_id: 0,
            user_id: userId || "", // Use provided userId or empty string
          },
        ],
        isLoading: false,
      });
    }
  },

  updateCheckpoint: async (session, userId, checkpointData) => {
    if (!session) {
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("user_checkpoint")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        set({ isLoading: false });
        return;
      }

      if (data && data.length > 0) {
        // Update existing checkpoint
        const { error: updateError } = await supabase
          .from("user_checkpoint")
          .update(checkpointData)
          .eq("user_id", userId);

        if (updateError) {
        }
      } else {
        // Insert new checkpoint
        const { error: insertError } = await supabase
          .from("user_checkpoint")
          .insert({
            ...checkpointData,
            user_id: userId,
          });

        if (insertError) {
          console.error("Error inserting checkpoint:", insertError);
        }
      }
    } catch (error) {
      set({ isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWords: async (session, difficulty) => {
    if (!session) {
      set({ words: [], isLoading: false });
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("difficulty", difficulty)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching words:", error);
        set({ words: [], isLoading: false });
        return;
      }

      set({ words: data || [], isLoading: false });
    } catch (error) {
      console.error("Error in fetchWords:", error);
      set({ words: [], isLoading: false });
    }
  },

  fetchParas: async (session) => {
    if (!session) {
      set({ paras: [], isLoading: false });
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("paragraphs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching paras:", error);
        set({ paras: [], isLoading: false });
        return;
      }

      set({ paras: data, isLoading: false });
    } catch (error) {
      console.error("Error in fetchParas:", error);
      set({ paras: [], isLoading: false });
    }
  },

  fetchStory: async (session) => {
    if (!session) {
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        return;
      }
      set({ gameData: data, isLoading: false });
    } catch (error) {
      set({ gameData: [], isLoading: false });
    }
  },

  // fetch galley according to the user checkpoint

  fetchGallery: async (session, userId) => {
    if (!session) {
      return;
    }

    const supabase = createClerkSupabaseClient(session);
    set({ isLoading: true });

    try {
      // First, fetch user's checkpoint data
      const { data: checkpointData, error: checkpointError } = await supabase
        .from("user_checkpoint")
        .select("*")
        .eq("user_id", userId)
        .order("chapter_id", { ascending: true });

      if (checkpointError) {
        set({ galleryImages: [], isLoading: false });
        return;
      }

      // Fetch all gallery images
      const { data: allImages, error: galleryError } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: true });

      if (galleryError) {
        set({ galleryImages: [], isLoading: false });
        return;
      }

      // Filter images based on checkpoint progress
      const filteredImages = allImages.filter((image) => {
        // Find the corresponding checkpoint for this image's chapter
        const checkpoint = checkpointData.find(
          (cp) => cp.chapter_id === image.chapter_id
        );

        if (checkpoint) {
          // Include the image if its unlock_chunk_id is less than or equal to the user's progress
          return image.unlock_chunk_id <= checkpoint.last_chunk_id;
        }
        return false; // Exclude images from chapters the user hasn't reached
      });

      set({ galleryImages: filteredImages, isLoading: false });
    } catch (error) {
      set({ galleryImages: [], isLoading: false });
    }
  },
}));

export default usePlayStore;
