import React, { useEffect, useRef, useState } from 'react';
import { VscDebugRestart } from "react-icons/vsc";
import { LuCrown } from "react-icons/lu";

import { ActionButton } from '../../../atoms/ActionButton';
import { BooleanSelector } from '../../../atoms/BooleanSelector';
import { ButtonGroupPicker } from '../../../components/ButtonGroupPicker';
import { TitleWithInfo } from '../../../components/TitleWithInfo';
import { Player } from '../../../utils/classes';
import { callEndpoint, pause } from '../../../utils/helpers';

const BOARD_SIZE = 8;
const AI_PLAYBACK_DELAY_MS = 250;

type Coord = [number, number];
type PieceLocation = [number, number, boolean];

interface BoardState {
    redLocations: number[][];
    blackLocations: number[][];
    redKingLocations: number[][];
    blackKingLocations: number[][];
}

interface BoardStatePayload {
    red_locations: number[][];
    black_locations: number[][];
    red_king_locations: number[][];
    black_king_locations: number[][];
}

interface PieceLocations {
    player: PieceLocation[];
    ai: PieceLocation[];
}

interface CheckersMove {
    startCoord: Coord;
    endCoord: Coord;
    capturedCoord?: Coord;
}

interface RawMoveOutcome {
    move?: {
        startCoord?: number[];
        start_coord?: number[];
        endCoord?: number[];
        end_coord?: number[];
    };
    createdKing?: boolean;
    created_king?: boolean;
    isRed?: boolean;
    is_red?: boolean;
    capturedCoord?: number[] | null;
    captured_coord?: number[] | null;
    capturedKing?: boolean | null;
    captured_king?: boolean | null;
}

interface CheckersMoveOutcome {
    move: {
        startCoord: Coord;
        endCoord: Coord;
    };
    createdKing: boolean;
    isRed: boolean;
    capturedCoord: Coord | null;
    capturedKing: boolean | null;
}

// Initial board setup for checkers - pieces on dark squares only
const getInitialBoardState = (): PieceLocations => {
    const playerPieces: PieceLocation[] = [];
    const aiPieces: PieceLocation[] = [];

    // AI (black) pieces on top 3 rows
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if ((row + col) % 2 === 1) {
                aiPieces.push([row, col, false]);
            }
        }
    }

    // Player (red) pieces on bottom 3 rows
    for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if ((row + col) % 2 === 1) {
                playerPieces.push([row, col, false]);
            }
        }
    }

    return { player: playerPieces, ai: aiPieces };
};

const INITIAL_BOARD_STATE = getInitialBoardState();

enum PieceType {
    EMPTY,
    PLAYER,
    PLAYER_KING,
    AI,
    AI_KING
}

const coordKey = ([row, col]: Coord): string => `${row},${col}`;

const toCoord = (value: number[] | undefined | null): Coord => {
    if (!value || value.length < 2) {
        return [0, 0];
    }
    return [value[0], value[1]];
};

const normalizeBoardState = (rawBoard: any): BoardState => ({
    redLocations: rawBoard?.redLocations ?? rawBoard?.red_locations ?? [],
    blackLocations: rawBoard?.blackLocations ?? rawBoard?.black_locations ?? [],
    redKingLocations: rawBoard?.redKingLocations ?? rawBoard?.red_king_locations ?? [],
    blackKingLocations: rawBoard?.blackKingLocations ?? rawBoard?.black_king_locations ?? []
});

const toBoardState = (locations: PieceLocations): BoardState => ({
    redLocations: locations.player.map(([row, col]) => [row, col]),
    blackLocations: locations.ai.map(([row, col]) => [row, col]),
    redKingLocations: locations.player.filter(([_, __, isKing]) => isKing).map(([row, col]) => [row, col]),
    blackKingLocations: locations.ai.filter(([_, __, isKing]) => isKing).map(([row, col]) => [row, col])
});

const toBoardStatePayload = (locations: PieceLocations): BoardStatePayload => {
    const board = toBoardState(locations);
    return {
        red_locations: board.redLocations,
        black_locations: board.blackLocations,
        red_king_locations: board.redKingLocations,
        black_king_locations: board.blackKingLocations
    };
};

const fromBoardState = (rawBoard: any): PieceLocations => {
    const board = normalizeBoardState(rawBoard);
    const redKingKeys = new Set(board.redKingLocations.map((coord) => coordKey(toCoord(coord))));
    const blackKingKeys = new Set(board.blackKingLocations.map((coord) => coordKey(toCoord(coord))));

    return {
        player: board.redLocations.map((coord) => {
            const normalized = toCoord(coord);
            return [normalized[0], normalized[1], redKingKeys.has(coordKey(normalized))] as PieceLocation;
        }),
        ai: board.blackLocations.map((coord) => {
            const normalized = toCoord(coord);
            return [normalized[0], normalized[1], blackKingKeys.has(coordKey(normalized))] as PieceLocation;
        })
    };
};

const normalizeMoveOutcome = (raw: RawMoveOutcome): CheckersMoveOutcome => {
    const startCoord = toCoord(raw?.move?.startCoord ?? raw?.move?.start_coord);
    const endCoord = toCoord(raw?.move?.endCoord ?? raw?.move?.end_coord);
    const capturedRaw = raw?.capturedCoord ?? raw?.captured_coord;

    return {
        move: {
            startCoord,
            endCoord
        },
        createdKing: raw?.createdKing ?? raw?.created_king ?? false,
        isRed: raw?.isRed ?? raw?.is_red ?? true,
        capturedCoord: capturedRaw ? toCoord(capturedRaw) : null,
        capturedKing: raw?.capturedKing ?? raw?.captured_king ?? null
    };
};

const toMoveOutcomePayload = (move: CheckersMoveOutcome) => ({
    move: {
        start_coord: move.move.startCoord,
        end_coord: move.move.endCoord
    },
    created_king: move.createdKing,
    is_red: move.isRed,
    captured_coord: move.capturedCoord,
    captured_king: move.capturedKing
});

const uniqueCoords = (coords: Coord[]): Coord[] => {
    const deduped = new Map<string, Coord>();
    coords.forEach((coord) => deduped.set(coordKey(coord), coord));
    return Array.from(deduped.values());
};

const coordsEqual = (a: Coord, b: Coord): boolean => a[0] === b[0] && a[1] === b[1];

const applyMoveOutcomeToLocations = (
    locations: PieceLocations,
    moveOutcome: CheckersMoveOutcome
): PieceLocations => {
    const movingKey: 'player' | 'ai' = moveOutcome.isRed ? 'player' : 'ai';
    const opponentKey: 'player' | 'ai' = moveOutcome.isRed ? 'ai' : 'player';

    const movingPieces = locations[movingKey];
    const opponentPieces = locations[opponentKey];

    const movingPiece = movingPieces.find((piece) =>
        coordsEqual([piece[0], piece[1]], moveOutcome.move.startCoord)
    );

    if (!movingPiece) {
        return locations;
    }

    const updatedMovingPieces = movingPieces
        .filter((piece) => !coordsEqual([piece[0], piece[1]], moveOutcome.move.startCoord))
        .concat([[
            moveOutcome.move.endCoord[0],
            moveOutcome.move.endCoord[1],
            moveOutcome.createdKing || movingPiece[2]
        ] as PieceLocation]);

    const updatedOpponentPieces = moveOutcome.capturedCoord
        ? opponentPieces.filter((piece) => !coordsEqual([piece[0], piece[1]], moveOutcome.capturedCoord as Coord))
        : [...opponentPieces];

    return movingKey === 'ai'
        ? {
            player: updatedOpponentPieces,
            ai: updatedMovingPieces
        }
        : {
            player: updatedMovingPieces,
            ai: updatedOpponentPieces
        };
};

const buildPieceSignature = (pieces: PieceLocation[]): string => {
    return pieces
        .map(([row, col, isKing]) => `${row},${col},${isKing ? 1 : 0}`)
        .sort()
        .join('|');
};

const areLocationsEqual = (left: PieceLocations, right: PieceLocations): boolean => {
    return buildPieceSignature(left.player) === buildPieceSignature(right.player)
        && buildPieceSignature(left.ai) === buildPieceSignature(right.ai);
};

const Checkers = () => {
    // Game settings
    const [autoplay, setAutoplay] = useState(true);
    const [maxDepth, setMaxDepth] = useState(6);
    const [startingPlayer, setStartingPlayer] = useState<Player>(Player.User);

    // Game state
    const [gameActive, setGameActive] = useState(false);
    const [playerTurn, setPlayerTurn] = useState<Player>(Player.User);
    const [turnCount, setTurnCount] = useState(0);
    const [selectedPiece, setSelectedPiece] = useState<Coord | null>(null);
    const [selectedMove, setSelectedMove] = useState<Coord | null>(null);
    const [validMoves, setValidMoves] = useState<Coord[]>([]);
    const [availableMoves, setAvailableMoves] = useState<CheckersMoveOutcome[]>([]);
    const [pieceLocations, setPieceLocations] = useState<PieceLocations>(INITIAL_BOARD_STATE);
    const [loading, setLoading] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [recentAiMove, setRecentAiMove] = useState<CheckersMove | null>(null);
    const isAnimatingAiRef = useRef(false);
    const aiPlaybackRunIdRef = useRef(0);

    const getOpposingPlayer = (player: Player): Player => {
        return player === Player.User ? Player.AI : Player.User;
    };

    const triggerGameOver = (playerLocations: PieceLocation[], aiLocations: PieceLocation[]) => {
        if (playerLocations.length > aiLocations.length) {
            setWinner(Player.User);
        } else if (playerLocations.length < aiLocations.length) {
            setWinner(Player.AI);
        } else {
            setWinner(Player.NEITHER);
        }
        setAvailableMoves([]);
        setValidMoves([]);
        setSelectedPiece(null);
        setSelectedMove(null);
        setGameActive(false);
        setLoading(false);
    };

    const triggerNoMovesGameOver = (currentTurn: Player) => {
        setWinner(getOpposingPlayer(currentTurn));
        setAvailableMoves([]);
        setValidMoves([]);
        setSelectedPiece(null);
        setSelectedMove(null);
        setGameActive(false);
        setLoading(false);
    };

    const hasPieceCountGameOver = (locations: PieceLocations): boolean => {
        if (locations.player.length === 0 || locations.ai.length === 0) {
            triggerGameOver(locations.player, locations.ai);
            return true;
        }
        return false;
    };

    const getAvailableMoves = async (
        locations: PieceLocations,
        turn: Player,
        isChain: boolean = false,
        startingLocation?: Coord
    ): Promise<CheckersMoveOutcome[]> => {
        const requestBody: any = {
            board: toBoardStatePayload(locations),
            player_color: turn === Player.User ? 'red' : 'black',
            is_chain: isChain
        };

        if (startingLocation) {
            requestBody.starting_location = startingLocation;
        }

        const res = await callEndpoint('api/game_pigeon/checkers/available_moves', requestBody);
        const rawMoves = res?.moves ?? [];
        return rawMoves.map((move: RawMoveOutcome) => normalizeMoveOutcome(move));
    };

    const beginHumanTurn = async (locations: PieceLocations) => {
        if (winner || loading) {
            return;
        }
        if (hasPieceCountGameOver(locations)) {
            return;
        }

        const moves = await getAvailableMoves(locations, Player.User, false);
        if (moves.length === 0) {
            triggerNoMovesGameOver(Player.User);
            return;
        }

        const selectablePieces = uniqueCoords(moves.map((move) => move.move.startCoord));
        setAvailableMoves(moves);
        setSelectedPiece(null);
        setSelectedMove(null);
        setValidMoves(selectablePieces);
    };

    const playAiMoveChain = async (
        initialLocations: PieceLocations,
        aiMoves: CheckersMoveOutcome[],
        runId: number
    ): Promise<PieceLocations> => {
        let currentLocations = initialLocations;
        for (const move of aiMoves) {
            if (aiPlaybackRunIdRef.current !== runId) {
                break;
            }
            currentLocations = applyMoveOutcomeToLocations(currentLocations, move);
            setRecentAiMove({
                startCoord: move.move.startCoord,
                endCoord: move.move.endCoord,
                capturedCoord: move.capturedCoord ?? undefined
            });
            setPieceLocations(currentLocations);
            await pause(AI_PLAYBACK_DELAY_MS);
        }
        return currentLocations;
    };

    const getAiMove = async () => {
        if (loading || winner || playerTurn !== Player.AI || isAnimatingAiRef.current) {
            return;
        }

        setGameActive(true);
        setLoading(true);
        isAnimatingAiRef.current = true;
        const runId = aiPlaybackRunIdRef.current + 1;
        aiPlaybackRunIdRef.current = runId;

        if (hasPieceCountGameOver(pieceLocations)) {
            isAnimatingAiRef.current = false;
            return;
        }

        const aiMoves = await getAvailableMoves(pieceLocations, Player.AI, false);
        if (aiMoves.length === 0) {
            triggerNoMovesGameOver(Player.AI);
            isAnimatingAiRef.current = false;
            return;
        }

        const res = await callEndpoint('api/game_pigeon/checkers', {
            board: toBoardStatePayload(pieceLocations),
            player_color: 'red',
            max_search_depth: maxDepth
        });

        const moves: CheckersMoveOutcome[] = (res?.moves ?? []).map((move: RawMoveOutcome) => normalizeMoveOutcome(move));
        if (moves.length === 0) {
            setLoading(false);
            triggerNoMovesGameOver(Player.AI);
            isAnimatingAiRef.current = false;
            return;
        }

        const playbackFinalLocations = await playAiMoveChain(pieceLocations, moves, runId);

        const serverFinalLocations = fromBoardState(res?.board ?? {});
        if (!areLocationsEqual(playbackFinalLocations, serverFinalLocations)) {
            console.warn('AI playback final state differed from server final state. Reconciled to server state.');
        }

        setPieceLocations(serverFinalLocations);
        setLoading(false);
        isAnimatingAiRef.current = false;

        if (hasPieceCountGameOver(serverFinalLocations)) {
            return;
        }

        setPlayerTurn(Player.User);
        setTurnCount((prev) => prev + 1);
    };

    const playMove = async () => {
        if (!selectedPiece || !selectedMove || loading || winner || playerTurn !== Player.User) {
            return;
        }

        const selectedMoveOutcome = availableMoves.find((move) =>
            coordsEqual(move.move.startCoord, selectedPiece) && coordsEqual(move.move.endCoord, selectedMove)
        );
        if (!selectedMoveOutcome) {
            return;
        }

        setGameActive(true);
        setLoading(true);

        const res = await callEndpoint('api/game_pigeon/checkers/perform_move', {
            board: toBoardStatePayload(pieceLocations),
            move: toMoveOutcomePayload(selectedMoveOutcome)
        });

        const newLocations = fromBoardState(res?.board ?? {});
        setPieceLocations(newLocations);

        if (hasPieceCountGameOver(newLocations)) {
            return;
        }

        if (selectedMoveOutcome.capturedCoord) {
            const chainMoves = await getAvailableMoves(newLocations, Player.User, true, selectedMoveOutcome.move.endCoord);
            if (chainMoves.length > 0) {
                setAvailableMoves(chainMoves);
                setSelectedPiece(selectedMoveOutcome.move.endCoord);
                setSelectedMove(null);
                setValidMoves(uniqueCoords(chainMoves.map((move) => move.move.endCoord)));
                setLoading(false);
                return;
            }
        }

        setAvailableMoves([]);
        setSelectedPiece(null);
        setSelectedMove(null);
        setValidMoves([]);
        setLoading(false);
        setPlayerTurn(Player.AI);
        setTurnCount((prev) => prev + 1);
    };

    const handlePieceClick = (coord: Coord) => {
        if (playerTurn !== Player.User || winner || loading) {
            return;
        }

        const movesFromPiece = availableMoves.filter((move) => coordsEqual(move.move.startCoord, coord));
        if (movesFromPiece.length > 0) {
            setSelectedPiece(coord);
            setSelectedMove(null);
            setValidMoves(uniqueCoords(movesFromPiece.map((move) => move.move.endCoord)));
            return;
        }

        if (!selectedPiece) {
            return;
        }

        const isValidDestination = availableMoves.some((move) =>
            coordsEqual(move.move.startCoord, selectedPiece) && coordsEqual(move.move.endCoord, coord)
        );
        if (isValidDestination) {
            setSelectedMove(coord);
        }
    };

    const resetGame = () => {
        const resetLocations = getInitialBoardState();
        setPieceLocations(resetLocations);
        setRecentAiMove(null);
        isAnimatingAiRef.current = false;
        aiPlaybackRunIdRef.current += 1;
        setLoading(false);
        setPlayerTurn(startingPlayer);
        setWinner(null);
        setGameActive(false);
        setSelectedPiece(null);
        setSelectedMove(null);
        setAvailableMoves([]);
        setValidMoves([]);
        setTurnCount(0);

        if (startingPlayer === Player.User) {
            void beginHumanTurn(resetLocations);
        }
    };

    useEffect(() => {
        if (winner || loading) {
            return;
        }

        if (playerTurn === Player.User) {
            void beginHumanTurn(pieceLocations);
            return;
        }

        if (playerTurn === Player.AI && autoplay) {
            void getAiMove();
        }
    }, [playerTurn, turnCount, autoplay, winner]);

    useEffect(() => {
        // During fresh/idle state, enforce canonical starting layout (user red on bottom).
        if (gameActive || turnCount !== 0 || winner !== null) {
            return;
        }
        const expectedInitial = getInitialBoardState();
        if (!areLocationsEqual(pieceLocations, expectedInitial)) {
            setPieceLocations(expectedInitial);
        }
    }, [gameActive, turnCount, winner, pieceLocations]);

    return (
        <div className="flex flex-col gap-4 bg-background-base items-center">
            <CheckersTitleSection />
            <div className="border border-brd-muted p-4 rounded-lg shadow-lg flex items-start flex-col md:flex-row gap-4 w-full">
                <ScoreBoard
                    playerScore={pieceLocations.player.length}
                    aiScore={pieceLocations.ai.length}
                    playerKings={pieceLocations.player.filter(([_, __, isKing]) => isKing).length}
                    aiKings={pieceLocations.ai.filter(([_, __, isKing]) => isKing).length}
                />
                <div className="w-full md:w-1/2 transition min-w-fit flex-shrink-0">
                    <div className="flex flex-col gap-2 items-center transition-all duration-500 w-full">
                        <CheckersBoard
                            playerLocations={pieceLocations.player}
                            aiLocations={pieceLocations.ai}
                            selectedPiece={selectedPiece}
                            selectedMove={selectedMove}
                            onSquareClick={handlePieceClick}
                            allowInput={playerTurn === Player.User && !winner}
                            highlightedMove={recentAiMove}
                            validMoves={validMoves}
                            playerTurn={playerTurn}
                        />
                        <ActionButton
                            label={playerTurn === Player.User
                                ? "Make Move"
                                : loading
                                    ? "AI is thinking..."
                                    : "Get AI Move"}
                            onClick={playerTurn === Player.User ? playMove : getAiMove}
                            disabled={
                                (playerTurn === Player.User && (!selectedPiece || !selectedMove)) ||
                                loading ||
                                winner !== null
                            }
                            className={`w-48 h-12 text-md ${!gameActive && startingPlayer === Player.AI && turnCount === 0 ? 'animate-enlargeBounce' : ''}`}
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                    {winner && (
                        <div className="animate-revealFromTop overflow-hidden">
                            <WinnerSection winner={winner} onReset={resetGame} />
                        </div>
                    )}
                    <div className="border border-brd-muted p-4 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 w-full">
                        <div className="flex flex-col text-center gap-2">
                            <h2 className="text-text-base text-lg font-semibold">Game Settings</h2>
                        </div>
                        <InputSection
                            maxDepth={maxDepth}
                            setMaxDepth={setMaxDepth}
                            autoplay={autoplay}
                            setAutoplay={setAutoplay}
                            startingPlayer={startingPlayer}
                            setStartingPlayer={(player: Player) => {
                                if (!gameActive) {
                                    setPlayerTurn(player);
                                }
                                setStartingPlayer(player);
                            }}
                            onReset={resetGame}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface InputSectionProps {
    maxDepth: number;
    setMaxDepth: (depth: number) => void;
    autoplay: boolean;
    setAutoplay: (autoplay: boolean) => void;
    startingPlayer: Player;
    setStartingPlayer: (player: Player) => void;
    onReset: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    maxDepth,
    setMaxDepth,
    autoplay,
    setAutoplay,
    startingPlayer,
    setStartingPlayer,
    onReset
}) => {
    const restartButtonLabel = (
        <div className="flex flex-row justify-center items-center gap-2">
            <span>Restart</span>
            <VscDebugRestart />
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-6 mb-4">
            <ButtonGroupPicker
                options={[4, 5, 6, 7]}
                label="Max AI Search Depth"
                selectedValue={maxDepth}
                setValue={setMaxDepth}
            />
            <ButtonGroupPicker
                optionsWithLabels={[{ label: "AI", value: Player.AI }, { label: "User", value: Player.User }]}
                label="Starting Player"
                selectedValue={startingPlayer}
                setValue={setStartingPlayer}
            />
            <BooleanSelector
                selected={autoplay}
                label="AI Autoplay"
                onChange={() => {
                    setAutoplay(!autoplay);
                }}
                labelOnBottom={true}
            />
            <ActionButton
                label={restartButtonLabel}
                onClick={onReset}
                className=""
            />
        </div>
    );
};

interface CheckersBoardProps {
    playerLocations: Array<[number, number, boolean]>;
    aiLocations: Array<[number, number, boolean]>;
    selectedPiece: [number, number] | null;
    selectedMove: [number, number] | null;
    onSquareClick: (pos: [number, number]) => void;
    allowInput: boolean;
    highlightedMove: CheckersMove | null;
    validMoves: Array<[number, number]>;
    playerTurn: Player;
}

const CheckersBoard: React.FC<CheckersBoardProps> = ({
    playerLocations,
    aiLocations,
    selectedPiece,
    selectedMove,
    onSquareClick,
    allowInput,
    highlightedMove,
    validMoves,
    playerTurn
}) => {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

    const getPieceAtCoord = (row: number, col: number): PieceType => {
        const playerPiece = playerLocations.find(([r, c]) => r === row && c === col);
        if (playerPiece) {
            return playerPiece[2] ? PieceType.PLAYER_KING : PieceType.PLAYER;
        }

        const aiPiece = aiLocations.find(([r, c]) => r === row && c === col);
        if (aiPiece) {
            return aiPiece[2] ? PieceType.AI_KING : PieceType.AI;
        }

        return PieceType.EMPTY;
    };

    const isValidMove = (row: number, col: number): boolean => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };

    const isHighlighted = (row: number, col: number): boolean => {
        if (!highlightedMove) return false;
        return (highlightedMove.startCoord[0] === row && highlightedMove.startCoord[1] === col) ||
            (highlightedMove.endCoord[0] === row && highlightedMove.endCoord[1] === col);
    };

    const isSelected = (row: number, col: number): boolean => {
        if (selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col) return true;
        if (selectedMove && selectedMove[0] === row && selectedMove[1] === col) return true;
        return false;
    };

    const selectedPieceType = selectedPiece
        ? getPieceAtCoord(selectedPiece[0], selectedPiece[1])
        : PieceType.EMPTY;

    return (
        <div className="relative bg-checkers-board-light p-5 rounded-3xl max-w-xs md:max-w-fit aspect-square">
            {board.map((r, rowIndex) => (
                <div key={rowIndex} className="flex flex-row">
                    {r.map((_, colIndex) => {
                        const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
                        const pieceType = getPieceAtCoord(rowIndex, colIndex);
                        const highlighted = isHighlighted(rowIndex, colIndex);
                        const selected = isSelected(rowIndex, colIndex);
                        const validMove = isValidMove(rowIndex, colIndex);

                        let borderRadiusClass = '';
                        if (rowIndex === 0 && colIndex === 0) {
                            borderRadiusClass = 'rounded-tl-lg';
                        } else if (rowIndex === 0 && colIndex === BOARD_SIZE - 1) {
                            borderRadiusClass = 'rounded-tr-lg';
                        } else if (rowIndex === BOARD_SIZE - 1 && colIndex === 0) {
                            borderRadiusClass = 'rounded-bl-lg';
                        } else if (rowIndex === BOARD_SIZE - 1 && colIndex === BOARD_SIZE - 1) {
                            borderRadiusClass = 'rounded-br-lg';
                        }

                        const squareColor = isDarkSquare ? 'bg-checkers-board-dark' : 'bg-checkers-board-light';

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`relative w-8 h-8 md:w-12 md:h-12 z-10 flex border border-gray-400 ${squareColor} flex justify-center items-center
                                    ${allowInput && isDarkSquare ? 'cursor-pointer' : ''}
                                    ${borderRadiusClass}`}
                                onClick={() => {
                                    if (allowInput && isDarkSquare) {
                                        onSquareClick([rowIndex, colIndex]);
                                    }
                                }}
                            >
                                {validMove && (
                                    <div
                                        key={`${playerTurn}-${rowIndex}-${colIndex}-${selectedPiece}`}
                                        className={`absolute inset-0 animate-customPulse ${playerTurn === Player.User ? 'bg-primary-base' : 'bg-secondary-base'
                                            } z-0 opacity-60`}
                                    ></div>
                                )}

                                {pieceType !== PieceType.EMPTY && (
                                    <CheckersPiece
                                        type={pieceType}
                                        highlighted={highlighted}
                                        selected={selected}
                                    />
                                )}
                                {pieceType === PieceType.EMPTY
                                    && selectedMove
                                    && selectedMove[0] === rowIndex
                                    && selectedMove[1] === colIndex
                                    && selectedPieceType !== PieceType.EMPTY && (
                                        <CheckersPiece
                                            type={selectedPieceType}
                                            ghost={true}
                                        />
                                    )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

interface ScoreBoardProps {
    playerScore: number;
    aiScore: number;
    playerKings: number;
    aiKings: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerScore, aiScore, playerKings, aiKings }) => {
    return (
        <div className="px-10 gap-12 flex flex-row md:flex-col gap-4 justify-center items-center bg-primary-base rounded-3xl max-w-fit max-h-fit py-2 md:py-10 self-center">
            <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-text-contrast">AI</span>
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center z-10">
                    <CheckersPiece type={PieceType.AI} />
                </div>
                <span className="text-2xl font-bold text-text-contrast">{aiScore}</span>
                <span className="text-sm text-text-contrast flex items-center gap-1">
                    {aiKings} <LuCrown className="w-4 h-4" />
                </span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-text-contrast">Player</span>
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center z-10">
                    <CheckersPiece type={PieceType.PLAYER} />
                </div>
                <span className="text-2xl font-bold text-text-contrast">{playerScore}</span>
                <span className="text-sm text-text-contrast flex items-center gap-1">
                    {playerKings} <LuCrown className="w-4 h-4" />
                </span>
            </div>
        </div>
    );
};

interface CheckersPieceProps {
    type: PieceType;
    highlighted?: boolean;
    selected?: boolean;
    ghost?: boolean;
}

const CheckersPiece: React.FC<CheckersPieceProps> = ({
    type,
    highlighted = false,
    selected = false,
    ghost = false,
}) => {
    let gradientStr = '';
    let crownColor = '';

    if (type === PieceType.PLAYER || type === PieceType.PLAYER_KING) {
        gradientStr = 'bg-gradient-to-b from-red-400 via-red-600 to-red-800';
        crownColor = 'text-yellow-300';
    } else if (type === PieceType.AI || type === PieceType.AI_KING) {
        gradientStr = 'bg-gradient-to-b from-gray-700 via-gray-900 to-black';
        crownColor = 'text-yellow-300';
    }

    const outlineStr = highlighted
        ? `outline outline-2 ${type === PieceType.PLAYER || type === PieceType.PLAYER_KING
            ? 'outline-secondary-base'
            : 'outline-primary-base'}`
        : '';

    const selectedStr = selected ? 'ring-4 ring-yellow-400' : '';
    const shadowStr = ghost ? 'shadow-md shadow-black/30' : 'shadow-lg shadow-black/50';
    const opacityStr = ghost ? 'opacity-50' : 'opacity-100';

    const isKing = type === PieceType.PLAYER_KING || type === PieceType.AI_KING;

    return (
        <div
            className={`w-[85%] h-[85%] ${gradientStr} ${outlineStr} ${selectedStr} ${shadowStr} ${opacityStr} rounded-full z-50 flex items-center justify-center relative`}
        >
            {isKing && (
                <LuCrown className={`w-2/3 h-2/3 ${crownColor}`} />
            )}
        </div>
    );
};

interface WinnerSectionProps {
    winner: Player;
    onReset: () => void;
}

const WinnerSection: React.FC<WinnerSectionProps> = ({ winner, onReset }) => {
    const backgroundColor = winner === Player.User
        ? "bg-success"
        : winner === Player.AI
            ? "bg-danger"
            : "bg-primary-base";
    const winnerText = winner === Player.User
        ? "You Win!"
        : winner === Player.AI
            ? "AI Wins!"
            : "It's a Tie!";
    return (
        <div className={`border border-brd-muted p-4 rounded-lg flex flex-col items-center justify-center gap-4 ${backgroundColor}`}>
            <h2 className="text-2xl font-bold text-text-light">
                {winnerText}
            </h2>
            <ActionButton
                label="Play Again"
                onClick={onReset}
                className="text-text-light border-text-light"
            />
        </div>
    );
};

const CheckersTitleSection: React.FC = () => {
    return (
        <TitleWithInfo
            title="Checkers!"
            infoTitle="How to Play Checkers"
            objective="Capture all of your opponent's pieces or block them so they cannot move."
            rules={[
                "Players take turns moving their pieces diagonally forward on dark squares.",
                "Regular pieces can only move forward one square at a time.",
                "If an opponent's piece is adjacent and the square beyond it is empty, you must jump over and capture it.",
                "If any capture is available on your turn, you must make a capturing move.",
                "Multiple jumps can be chained together in a single turn if available.",
                "When a piece reaches the opposite end of the board, it becomes a King.",
                "Kings can move and capture both forward and backward.",
                "The game ends when one player has no pieces left or cannot make any legal moves."
            ]}
            instructionsTitle="Game Settings"
            toolInstructions={[
                (
                    <div><b>Max AI Search Depth</b>: How deep the AI will search for the best move (higher = stronger but slower).</div>
                ),
                (
                    <div><b>Starting Player</b>: Which player goes first.</div>
                ),
                (
                    <div><b>AI Autoplay</b>: Whether to automatically play the best moves for the AI.</div>
                ),
            ]}
        />
    );
};

export default Checkers;
