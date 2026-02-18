import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import OnScreenKeyboard from "../components/OnScreenKeyboard/OnScreenKeyboard";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function getGuessColors(
	guess: string,
	answer: string,
): ("green" | "yellow" | "gray")[] {
	const result: ("green" | "yellow" | "gray")[] = Array(guess.length).fill(
		"gray",
	);
	const answerArr = answer.split("");
	const guessArr = guess.split("");
	const used = Array(answer.length).fill(false);

	// First pass: green
	for (let i = 0; i < guessArr.length; ++i) {
		if (guessArr[i] === answerArr[i]) {
			result[i] = "green";
			used[i] = true;
		}
	}
	// Second pass: yellow
	for (let i = 0; i < guessArr.length; ++i) {
		if (result[i] === "green") continue;
		for (let j = 0; j < answerArr.length; ++j) {
			if (!used[j] && guessArr[i] === answerArr[j]) {
				result[i] = "yellow";
				used[j] = true;
				break;
			}
		}
	}
	return result;
}

const WIN_PHRASES = [
	"Genius",
	"Magnificent",
	"Impressive",
	"Splendid",
	"Great",
	"Phew",
];

const GamePage: React.FC = () => {
	const [guesses, setGuesses] = useState<string[]>([]);
	const [currentGuess, setCurrentGuess] = useState("");
	const [animatingRow, setAnimatingRow] = useState<number | null>(null);
	const [revealIndex, setRevealIndex] = useState<number>(-1);
	const [gameOver, setGameOver] = useState<null | {
		win: boolean;
		guesses: number;
	}>(null);
	const [answer, setAnswer] = useState<string>("");
	const revealTimeout = useRef<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchAnswer() {
			const date = new Date();
			const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
			interface WordleAnswerResponse {
				id: number;
				solution: string;
				print_date: string;
				days_since_launch: number;
				editor: string;
			}
			try {
				const response = await fetch(
					`https://www.nytimes.com/svc/wordle/v2/${formattedDate}.json`,
				);
				const data: WordleAnswerResponse = await response.json();
				const fetchedAnswer = data.solution;
				setAnswer(fetchedAnswer.toUpperCase());
			} catch (error) {
				console.error("Failed to fetch Wordle answer:", error);
				// Fallback to a default word if API fails
				setAnswer("OUCHY");
			}
		}
		fetchAnswer();
	}, []);

	const handleKeyPress = useCallback(
		(key: string) => {
			if (animatingRow !== null) return; // Prevent input during animation
			if (key === "Backspace") {
				setCurrentGuess((g) => g.slice(0, -1));
			} else if (key === "Enter") {
				if (
					currentGuess.length === WORD_LENGTH &&
					guesses.length < MAX_GUESSES
				) {
					setAnimatingRow(guesses.length);
					setRevealIndex(0);
				}
			} else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
				setCurrentGuess((g) => g + key);
			}
		},
		[currentGuess, guesses, animatingRow],
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			let key = e.key;
			if (key.length === 1 && /[a-zA-Z]/.test(key)) {
				key = key.toUpperCase();
			} else if (key !== "Backspace" && key !== "Enter") {
				return;
			}
			e.preventDefault();
			handleKeyPress(key);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleKeyPress]);

	// Animation effect for revealing guess colors
	useEffect(() => {
		if (
			animatingRow !== null &&
			revealIndex < WORD_LENGTH &&
			revealIndex >= 0
		) {
			revealTimeout.current = setTimeout(() => {
				setRevealIndex((idx) => idx + 1);
			}, 320);
		} else if (animatingRow !== null && revealIndex === WORD_LENGTH) {
			// After animation, commit guess and check win/lose
			setTimeout(() => {
				const guessWord = currentGuess.toUpperCase();
				const isWin = guessWord === answer;
				const nextGuesses = [...guesses, currentGuess];
				if (isWin) {
					setGameOver({ win: true, guesses: nextGuesses.length });
				} else if (nextGuesses.length === MAX_GUESSES) {
					setGameOver({ win: false, guesses: nextGuesses.length });
				}
				setGuesses(nextGuesses);
				setCurrentGuess("");
				setAnimatingRow(null);
				setRevealIndex(-1);
			}, 320);
		}
		return () => {
			if (revealTimeout.current) clearTimeout(revealTimeout.current);
		};
	}, [animatingRow, revealIndex, currentGuess, guesses]);

	useEffect(() => {
		if (gameOver && gameOver.win) {
			// Show win phrase, then redirect
			const timeout = setTimeout(() => {
				navigate("/leaderboard");
			}, 1800);
			return () => clearTimeout(timeout);
		}
	}, [gameOver, navigate]);

	let resultPhrase = null;
	if (gameOver) {
		if (gameOver.win) {
			const idx = Math.min(gameOver.guesses - 1, WIN_PHRASES.length - 1);
			resultPhrase = WIN_PHRASES[idx];
		} else {
			resultPhrase = `The word was ${answer}`;
		}
	}

	return (
		<div
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<h2>Play Wordle</h2>
			<div
				style={{
					margin: "2rem 0",
					width: "100%",
					maxWidth: 420,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{Array.from({ length: MAX_GUESSES }).map((_, i) => {
					const guess =
						guesses[i] || (i === guesses.length ? currentGuess : "");
					const padded = guess.padEnd(WORD_LENGTH);
					const isAnimating = i === animatingRow;
					const colors =
						guess.length === WORD_LENGTH && (i < guesses.length || isAnimating)
							? getGuessColors(guess.toUpperCase(), answer)
							: Array(WORD_LENGTH).fill("gray");
					return (
						<div
							key={i}
							style={{
								display: "flex",
								gap: "0.5rem",
								marginBottom: "0.5rem",
								justifyContent: "center",
								width: "100%",
								maxWidth: 420,
							}}
						>
							{padded.split("").map((char, j) => {
								let bg = "#222";
								let border = "2px solid #444";
								let showColor = false;
								if (
									guess.length === WORD_LENGTH &&
									(i < guesses.length || isAnimating)
								) {
									if (isAnimating) {
										showColor = j <= revealIndex;
									} else {
										showColor = true;
									}
									if (showColor) {
										if (colors[j] === "green") {
											bg = "#4caf50";
											border = "2px solid #388e3c";
										} else if (colors[j] === "yellow") {
											bg = "#ffd600";
											border = "2px solid #bfa100";
										} else {
											bg = "#444";
											border = "2px solid #222";
										}
									}
								}
								return (
									<div
										key={j}
										style={{
											width: "2.2rem",
											height: "2.2rem",
											border,
											background: bg,
											color: "#fff",
											fontSize: "1.5rem",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											borderRadius: "0.3rem",
											fontWeight: "bold",
											textTransform: "uppercase",
											transition: isAnimating
												? "transform 0.3s, background 0.3s, border 0.3s"
												: undefined,
											transform:
												isAnimating && j <= revealIndex
													? "rotateX(360deg)"
													: undefined,
										}}
									>
										{char.trim()}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
			{resultPhrase && (
				<div
					style={{
						fontSize: "2rem",
						fontWeight: 700,
						margin: "1.5rem 0",
						color: gameOver?.win ? "#ffd600" : "#ff5252",
					}}
				>
					{resultPhrase}
				</div>
			)}
			{!gameOver && (
				<div data-testid="keyboard-ready" data-ready={animatingRow === null}>
					<OnScreenKeyboard onKeyPress={handleKeyPress} />
				</div>
			)}
		</div>
	);
};

export default GamePage;
