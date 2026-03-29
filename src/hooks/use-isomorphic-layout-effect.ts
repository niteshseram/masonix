import { useEffect, useLayoutEffect } from "react";
import { isServer } from "../utils/ssr";

export const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
