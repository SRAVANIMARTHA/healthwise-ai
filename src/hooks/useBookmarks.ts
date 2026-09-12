import { useState, useEffect, useCallback } from 'react';
import { bookmarkService } from '../services/bookmarks/bookmark-service';
import { Bookmark } from '../types/database';
import { useAuth } from './useAuth';

export const useBookmarks = () => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await bookmarkService.getBookmarks(userId);
      setBookmarks(items);
    } catch (err) {
      console.error('[useBookmarks] Failed loading bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const isBookmarked = useCallback(
    (resourceType: 'disease' | 'document' | 'external_resource', resourceId: string) => {
      return bookmarks.some(
        (b) => b.resource_type === resourceType && b.resource_id === resourceId
      );
    },
    [bookmarks]
  );

  const toggle = useCallback(
    async (item: {
      resource_type: 'disease' | 'document' | 'external_resource';
      resource_id: string;
      title: string;
      url?: string | null;
    }) => {
      const result = await bookmarkService.toggleBookmark(userId, item);
      if (result.isBookmarked && result.bookmark) {
        setBookmarks((prev) => [result.bookmark!, ...prev.filter(b => !(b.resource_type === item.resource_type && b.resource_id === item.resource_id))]);
      } else {
        setBookmarks((prev) =>
          prev.filter(
            (b) => !(b.resource_type === item.resource_type && b.resource_id === item.resource_id)
          )
        );
      }
      return result.isBookmarked;
    },
    [userId]
  );

  const remove = useCallback(
    async (bookmarkId: string) => {
      await bookmarkService.removeBookmark(bookmarkId, userId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    },
    [userId]
  );

  return {
    bookmarks,
    isLoading,
    loadBookmarks,
    isBookmarked,
    toggle,
    remove,
  };
};
