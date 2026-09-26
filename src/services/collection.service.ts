import { Playlist } from "../types/playlist";
import { musicService } from "./music.service";

class CollectionService {
  private getStorageKey(username?: string): string {
    const user = username || "guest";
    return `xitlar_saved_collections_${user}`;
  }

  getSavedCollections(username?: string): Playlist[] {
    if (typeof window === "undefined" || !username) {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.getStorageKey(username));
      if (!stored) return [];
      return JSON.parse(stored) as Playlist[];
    } catch (err) {
      console.error("Failed to parse saved collections from localStorage:", err);
      return [];
    }
  }

  isCollectionSaved(collectionId: string | number, username?: string): boolean {
    if (typeof window === "undefined" || !username) return false;
    const list = this.getSavedCollections(username);
    return list.some((c) => String(c.id) === String(collectionId));
  }

  saveCollection(collection: Playlist, username?: string): void {
    if (typeof window === "undefined" || !username) return;
    const list = this.getSavedCollections(username);
    if (!list.some((c) => String(c.id) === String(collection.id))) {
      const updated = [collection, ...list];
      localStorage.setItem(this.getStorageKey(username), JSON.stringify(updated));
      this.dispatchChangeEvent(collection.id, "save");
    }
  }

  removeCollection(collectionId: string | number, username?: string): void {
    if (typeof window === "undefined" || !username) return;
    const list = this.getSavedCollections(username);
    const updated = list.filter((c) => String(c.id) !== String(collectionId));
    localStorage.setItem(this.getStorageKey(username), JSON.stringify(updated));
    this.dispatchChangeEvent(collectionId, "remove");
  }

  toggleSaveCollection(collection: Playlist, username?: string): boolean {
    if (typeof window === "undefined" || !username) return false;
    const isSaved = this.isCollectionSaved(collection.id, username);
    if (isSaved) {
      this.removeCollection(collection.id, username);
      return false;
    } else {
      this.saveCollection(collection, username);
      return true;
    }
  }

  private dispatchChangeEvent(collectionId: string | number, action: "save" | "remove") {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("xitlar:saved-collections-changed", {
          detail: { collectionId: String(collectionId), action }
        })
      );
    }
  }
}

export const collectionService = new CollectionService();
