"use client";

import usePlayStore from '@/store/playStore';
import { useSession } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from "motion/react"
import { ChapterTitle } from './ChapterTitle';
import { useUser } from '@clerk/nextjs';
import { fetchUserStoryline } from '@/lib/storyManager';
import { StorylineManager } from './StorylineManager';
import LoadingStory from '@/components/loading-story';
import LoadingSpinner from '@/components/loading-spinner';
import toast from 'react-hot-toast';

function Storyline() {
  const { session } = useSession();
  const { fetchStory, gameData, isLoading, fetchCheckpoint, checkpoint, updateCheckpoint } = usePlayStore();
  const [showTitle, setShowTitle] = useState(true);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const user = useUser().user;
  const user_id = user?.id ?? '';
  const [storylineData, setStorylineData] = useState({
    currentChapter: null,
    lastChunkId: null,
    stories: [],
    currentChapterName: '',
  });

  const handleTitleComplete = () => {
    setShowTitle(false);
    setCurrentChunkIndex(storylineData.lastChunkId || 0);
  };

  const handleNextChapter = () => {
    const nextChapterId = storylineData.currentChapter + 1;
    const nextChapterStories = gameData.filter(
      (story) => story.chapter_id === nextChapterId
    );

    if (nextChapterStories.length > 0) {
      setStorylineData({
        currentChapter: nextChapterId,
        lastChunkId: 0,
        stories: nextChapterStories,
        currentChapterName: nextChapterStories[0].title,
      });
      updateCheckpoint(session, user_id, {
        chapter_id: nextChapterId,
        last_chunk_id: 0,
      })

      setShowTitle(true);
      setCurrentChunkIndex(1);
    } else {
      setStorylineData({ ...storylineData, stories: [] });
    }
  };

  const handleChunkComplete = (nextChunkIndex) => {
    const maxChunks = storylineData.stories[0]?.story_chunks?.length || 0;
    if (nextChunkIndex < maxChunks) {
      setCurrentChunkIndex(nextChunkIndex);

      updateCheckpoint(session, user_id, {
        chapter_id: storylineData.currentChapter,
        last_chunk_id: nextChunkIndex,
      });
    } else {
      handleNextChapter();
    }
  };



  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!session) return;

      try {
        await fetchStory(session);
      } catch (error) {
      }
    };

    initializeData();
    return () => {
      isMounted = false;
    };
  }, [session, fetchStory]);

  useEffect(() => {
    let isMounted = true;

    const fetchCheckpointData = async () => {
      if (!gameData?.length) return;

      try {
        await fetchCheckpoint(session, user_id);
      } catch (error) {
      }
    };

    fetchCheckpointData();
    return () => {
      isMounted = false;
    };
  }, [gameData, session, fetchCheckpoint]);

  useEffect(() => {
    if (!gameData?.length || !checkpoint?.length) return;
    const storylineResult = fetchUserStoryline(checkpoint, gameData);
    
    if (storylineResult.error) {
      toast.error("Something went wrong while fetching storyline data. Refresh the page to try again.");
    }

    if(storylineResult) {
      // Do any operations with storylineResult here      
      setStorylineData(storylineResult);
      setCurrentChunkIndex(storylineResult?.lastChunkId || 0);
    }
}, [gameData, checkpoint]);

  const currentChunk = !showTitle && storylineData.stories[0]?.story_chunks?.[currentChunkIndex];

  if (isLoading || !gameData?.length || !checkpoint?.length) {
    return <LoadingSpinner />
  }

  if (!storylineData.stories.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        To be continued... SOON!
      </div>
    );
  }

  return (
    <div
      className="bg-cover bg-center bg-no-repeat relative overflow-hidden"
    >
      {/* Dynamic background overlay */}
      <motion.div
        className="absolute inset-0 gradient-hero-5"
        animate={{
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showTitle && storylineData.currentChapter && (
            <>
              <ChapterTitle
                chapterId={storylineData.currentChapter}
                title={`${storylineData.currentChapterName}`}
                onComplete={handleTitleComplete}
              />
            </>

          )}

          {!showTitle && currentChunk && !isLoading && (
            <StorylineManager
              stories={storylineData.stories}
              currentIndex={currentChunkIndex}
              onComplete={handleChunkComplete}
              currentChapter={storylineData.currentChapter}
              onNextChapter={handleNextChapter}
              handleNextChapter={handleNextChapter} // Pass the handleNextChapter function
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default React.memo(Storyline);