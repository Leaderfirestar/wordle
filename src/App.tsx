import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import GamePage from "./pages/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import NavBar from "./components/NavBar/NavBar";
import "./App.css";

const App: React.FC = () => {
	return (
		<Router>
			<div className="app-container">
				<NavBar />
				<div className="page-content">
					<Routes>
						<Route path="/" element={<GamePage />} />
						<Route path="/leaderboard" element={<LeaderboardPage />} />
						<Route path="/admin" element={<AdminPage />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
};

export default App;
