// @ts-nocheck
import { useLocation } from "react-router-dom";
import { CinematicMotion } from "./Cinematic";

/* Re-applies cinematic page motion on every route change (skips admin/account pages). */
export default function CinematicRoute({ accent }) {
  const { pathname } = useLocation();
  return <CinematicMotion accent={accent} path={pathname} />;
}
