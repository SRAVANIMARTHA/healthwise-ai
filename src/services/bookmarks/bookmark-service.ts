/**
 * HealthWise AI — User Bookmarks Service
 *
 * Manages user bookmarks for disease guides, knowledge documents,
 * and external health resources.
 *
 * Dual-mode support:
 * - Supabase PostgreSQL `public.bookmarks` table with user-scoped RLS
 * - Resilient localStorage fallback for guest mode and offline resilience
 */

import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { Bookmark } from '../../types/database';

const LOCAL_BOOKMARKS_KEY_PREFIX = 'healthwise_bookmarks_';

function getStorageKey(userId?: string | null): string {
  return `${LOCAL_BOOKMARKS_KEY_PREFIX}${userId || 'guest'}`;
}

function getLocalBookmarks(userId?: string | null): Bookmark[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) return JSON.parse(raw);

    // Initial default bookmarks for demo exploration
    const defaultBookmarks: Bookmark[] = [
      {
        id: 'bm-dengue-init',
        user_id: userId || 'guest',
        resource_type: 'disease',
        resource_id: 'dengue',
        title: 'Dengue Fever & Severe Dengue',
        url: '/diseases/dengue',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'bm-who-init',
        user_id: userId || 'guest',
        resource_type: 'external_resource',
        resource_id: 'who-factsheets',
        title: 'WHO Fact Sheets on Communicable & Non-communicable Diseases',
        url: 'https://www.who.int/news-room/fact-sheets',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    localStorage.setItem(getStorageKey(userId), JSON.stringify(defaultBookmarks));
    return defaultBookmarks;
  } catch {
    return [];
  }
}

function saveLocalBookmarks(userId: string | null | undefined, list: Bookmark[]) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
  } catch (err) {
    console.warn('[BookmarkService] Failed saving local bookmarks:', err);
  }
}

export const bookmarkService = {
  /**
   * Get all bookmarks for the active user or guest
   */
  async getBookmarks(userId?: string | null): Promise<Bookmark[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Bookmark[];
        }
      } catch (err) {
        console.warn('[BookmarkService] Supabase getBookmarks failed, using local storage:', err);
      }
    }

    return getLocalBookmarks(userId);
  },

  /**
   * Check if a specific resource is bookmarked
   */
  async isBookmarked(
    userId: string | null,
    resourceType: 'disease' | 'document' | 'external_resource',
    resourceId: string
  ): Promise<boolean> {
    const list = await this.getBookmarks(userId);
    return list.some((b) => b.resource_type === resourceType && b.resource_id === resourceId);
  },

  /**
   * Add a new bookmark
   */
  async addBookmark(item: {
    user_id?: string | null;
    resource_type: 'disease' | 'document' | 'external_resource';
    resource_id: string;
    title: string;
    url?: string | null;
  }): Promise<Bookmark> {
    const now = new Date().toISOString();
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: item.user_id || 'guest',
      resource_type: item.resource_type,
      resource_id: item.resource_id,
      title: item.title,
      url: item.url || null,
      created_at: now,
    };

    // 1. Save to local storage
    const local = getLocalBookmarks(item.user_id);
    const existingIdx = local.findIndex(
      (b) => b.resource_type === item.resource_type && b.resource_id === item.resource_id
    );
    if (existingIdx === -1) {
      local.unshift(newBookmark);
      saveLocalBookmarks(item.user_id, local);
    }

    // 2. Persist to Supabase if configured and user is signed in
    if (isSupabaseConfigured && item.user_id && item.user_id !== 'guest') {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: item.user_id,
            resource_type: item.resource_type,
            resource_id: item.resource_id,
            title: item.title,
            url: item.url || null,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Bookmark;
        }
      } catch (err) {
        console.warn('[BookmarkService] Supabase insert failed, local copy preserved:', err);
      }
    }

    return newBookmark;
  },

  /**
   * Remove a bookmark by ID
   */
  async removeBookmark(bookmarkId: string, userId?: string | null): Promise<boolean> {
    // 1. Remove from local storage
    const local = getLocalBookmarks(userId);
    const filtered = local.filter((b) => b.id !== bookmarkId);
    saveLocalBookmarks(userId, filtered);

    // 2. Remove from Supabase if configured
    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase.from('bookmarks').delete().eq('id', bookmarkId).eq('user_id', userId);
      } catch (err) {
        console.warn('[BookmarkService] Supabase delete failed:', err);
      }
    }

    return true;
  },

  /**
   * Remove a bookmark by resource type and resource ID
   */
  async removeBookmarkByResource(
    userId: string | null,
    resourceType: 'disease' | 'document' | 'external_resource',
    resourceId: string
  ): Promise<boolean> {
    const local = getLocalBookmarks(userId);
    const target = local.find(
      (b) => b.resource_type === resourceType && b.resource_id === resourceId
    );
    const filtered = local.filter(
      (b) => !(b.resource_type === resourceType && b.resource_id === resourceId)
    );
    saveLocalBookmarks(userId, filtered);

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('resource_type', resourceType)
          .eq('resource_id', resourceId);
      } catch (err) {
        console.warn('[BookmarkService] Supabase delete by resource failed:', err);
      }
    }

    return !!target;
  },

  /**
   * Toggle bookmark state (adds if absent, removes if present)
   */
  async toggleBookmark(
    userId: string | null,
    item: {
      resource_type: 'disease' | 'document' | 'external_resource';
      resource_id: string;
      title: string;
      url?: string | null;
    }
  ): Promise<{ isBookmarked: boolean; bookmark?: Bookmark }> {
    const alreadySaved = await this.isBookmarked(userId, item.resource_type, item.resource_id);

    if (alreadySaved) {
      await this.removeBookmarkByResource(userId, item.resource_type, item.resource_id);
      return { isBookmarked: false };
    } else {
      const created = await this.addBookmark({
        user_id: userId,
        ...item,
      });
      return { isBookmarked: true, bookmark: created };
    }
  },
};
