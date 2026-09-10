import { db } from './db';
import type { Bookmark, Favorite, Id, Note, ReviewItem, UnlockedBadge } from '@/models';

export const personalRepository = {
  listFavorites() {
    return db.favorites.toArray();
  },
  getFavorite(id: Id) {
    return db.favorites.get(id);
  },
  putFavorite(fav: Favorite) {
    return db.favorites.put(fav);
  },
  deleteFavorite(id: Id) {
    return db.favorites.delete(id);
  },

  listReviewItems() {
    return db.reviewItems.toArray();
  },
  putReviewItem(item: ReviewItem) {
    return db.reviewItems.put(item);
  },
  deleteReviewItem(id: Id) {
    return db.reviewItems.delete(id);
  },

  notesForLesson(lessonId: Id) {
    return db.notes.where('lessonId').equals(lessonId).toArray();
  },
  listNotes() {
    return db.notes.toArray();
  },
  putNote(note: Note) {
    return db.notes.put(note);
  },
  deleteNote(id: Id) {
    return db.notes.delete(id);
  },

  getBookmark() {
    return db.bookmarks.get('last');
  },
  putBookmark(bookmark: Bookmark) {
    return db.bookmarks.put(bookmark);
  },

  listBadges() {
    return db.badges.toArray();
  },
  putBadge(badge: UnlockedBadge) {
    return db.badges.put(badge);
  },
};
