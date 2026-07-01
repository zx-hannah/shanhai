import { createContext, useContext } from "react";

export type SpaceId = "personal" | "ent1" | "ent2";

export interface SpaceContextValue {
  spaceId: SpaceId;
  migratedProjectIds: string[];
  openPersonalMigration: (projectIds?: string[]) => void;
}

export const SpaceContext = createContext<SpaceContextValue>({
  spaceId: "ent1",
  migratedProjectIds: [],
  openPersonalMigration: () => undefined,
});

export function useSpace(): SpaceContextValue {
  return useContext(SpaceContext);
}
