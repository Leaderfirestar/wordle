import React from "react";
import "./OnScreenKeyboard.css";

const KEYS = [
	["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
	["A", "S", "D", "F", "G", "H", "J", "K", "L"],
	["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
];

interface OnScreenKeyboardProps {
	onKeyPress: (key: string) => void;
	disabledKeys?: string[];
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({
	onKeyPress,
	disabledKeys = [],
}) => {
	return (
		<div className="osk-container">
			{KEYS.map((row, rowIdx) => (
				<div className="osk-row" key={rowIdx}>
					{row.map((key) => (
						<button
							key={key}
							className="osk-key"
							onClick={() => onKeyPress(key)}
							disabled={disabledKeys.includes(key)}
						>
							{key === "Backspace" ? "⌫" : key}
						</button>
					))}
				</div>
			))}
		</div>
	);
};

export default OnScreenKeyboard;
