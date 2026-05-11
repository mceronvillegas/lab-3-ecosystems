/// src/router/AppRouter.tsx

import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Game from "../pages/Game";
import Results from "../pages/Results";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/game/:roomId" element={<Game />} />

      <Route path="/results/:roomId" element={<Results />} />
    </Routes>
  );
};

export default AppRouter;
