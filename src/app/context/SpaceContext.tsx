import { createContext, useContext } from "react";

export type SpaceId = "personal" | "ent1" | "ent2";

export interface SpaceContextValue {
  spaceId: SpaceId;
}

export const SpaceContext = createContext<SpaceContextValue>({
  spaceId: "ent1",
});

export function useSpace(): SpaceContextValue {
  return useContext(SpaceContext);
}
