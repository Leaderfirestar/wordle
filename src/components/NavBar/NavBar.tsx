import React from "react";
import { Link } from "react-router";
import "./NavBar.css";

const NavBar: React.FC = () => (
	<nav className="navbar">
		<ul>
			<li>
				<Link to="/">Play</Link>
			</li>
			<li>
				<Link to="/leaderboard">Leaderboard</Link>
			</li>
			<li>
				<Link to="/admin">Admin</Link>
			</li>
		</ul>
	</nav>
);

export default NavBar;
