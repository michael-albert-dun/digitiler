#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROWS = 4;
const COLS = 4;
const PIECE_SIZE = 4;
const DIGITS = ["1", "2", "3", "4"];
const SEQUENCES = buildNonDecreasingSequences(DIGITS, PIECE_SIZE);
const RUNS = Number(process.argv[2] || 10);
const SUMMARY_ONLY = process.argv.includes("--summary");
const ACCEPTED_ONLY = process.argv.includes("--accepted-only");
const MAX_ALLOWED_SOLUTIONS = 2;
const tilingsPath = path.join(__dirname, "..", "data", "tetromino-tilings-4x4.txt");
const tilings = fs.readFileSync(tilingsPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const counts = [];

for (let run = 0; run < RUNS; run += 1) {
  const { board, sourceTiling, attempts } = ACCEPTED_ONLY
    ? generateAcceptedBoard()
    : generateRandomBoard();
  const solutionCount = countValidSolutions(board);

  counts.push(solutionCount);

  if (!SUMMARY_ONLY) {
    console.log([
      `run=${run + 1}`,
      `solutions=${solutionCount}`,
      `attempts=${attempts}`,
      `source=${sourceTiling}`,
      `grid=${board.join("")}`
    ].join(" "));
  }
}

if (SUMMARY_ONLY) {
  const sortedCounts = counts.slice().sort((a, b) => a - b);
  const histogram = new Map();

  counts.forEach((count) => {
    histogram.set(count, (histogram.get(count) || 0) + 1);
  });

  console.log(`runs=${RUNS}`);
  console.log(`min=${sortedCounts[0]}`);
  console.log(`median=${sortedCounts[Math.floor(sortedCounts.length / 2)]}`);
  console.log(`mean=${mean(counts).toFixed(2)}`);
  console.log(`max=${sortedCounts[sortedCounts.length - 1]}`);
  console.log("histogram=" + [...histogram.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([count, frequency]) => `${count}:${frequency}`)
    .join(","));
}

function generateRandomBoard() {
  const sourceTiling = randomItem(tilings);

  return {
    board: generateBoardFromTiling(sourceTiling),
    sourceTiling,
    attempts: 1
  };
}

function generateAcceptedBoard() {
  let attempts = 0;

  while (true) {
    attempts += 1;
    const sourceTiling = randomItem(tilings);
    const board = generateBoardFromTiling(sourceTiling);

    if (countValidSolutions(board, MAX_ALLOWED_SOLUTIONS + 1) <= MAX_ALLOWED_SOLUTIONS) {
      return { board, sourceTiling, attempts };
    }
  }
}

function generateBoardFromTiling(tiling) {
  const board = Array.from({ length: ROWS * COLS }, () => "");

  compactTilingToPieces(tiling).forEach((piece) => {
    const values = randomNonDecreasingSequence(PIECE_SIZE);

    piece
      .slice()
      .sort((a, b) => a - b)
      .forEach((cellIndex, valueIndex) => {
        board[cellIndex] = values[valueIndex];
      });
  });

  return board;
}

function countValidSolutions(board, stopAt = Infinity) {
  let count = 0;

  for (const tiling of tilings) {
    if (isValidSolution(board, tiling)) {
      count += 1;

      if (count >= stopAt) {
        return count;
      }
    }
  }

  return count;
}

function isValidSolution(board, tiling) {
  return compactTilingToPieces(tiling).every((piece) => {
    const values = piece
      .slice()
      .sort((a, b) => a - b)
      .map((cellIndex) => board[cellIndex]);

    return isNonDecreasing(values);
  });
}

function compactTilingToPieces(tiling) {
  const pieces = Array.from({ length: ROWS * COLS / PIECE_SIZE }, () => []);

  [...tiling].forEach((label, index) => {
    const pieceIndex = parseInt(label, 36);

    if (!pieces[pieceIndex]) {
      throw new Error(`Unexpected piece label ${label} in tiling ${tiling}`);
    }

    pieces[pieceIndex].push(index);
  });

  return pieces;
}

function isNonDecreasing(values) {
  return values.every((value, index) => (
    DIGITS.includes(value) &&
    (index === 0 || Number(value) >= Number(values[index - 1]))
  ));
}

function randomNonDecreasingSequence(length) {
  if (length === PIECE_SIZE) {
    return [...randomItem(SEQUENCES)];
  }

  return [...randomItem(buildNonDecreasingSequences(DIGITS, length))];
}

function buildNonDecreasingSequences(digits, length, startIndex = 0) {
  if (length === 0) {
    return [""];
  }

  const sequences = [];

  for (let index = startIndex; index < digits.length; index += 1) {
    buildNonDecreasingSequences(digits, length - 1, index).forEach((suffix) => {
      sequences.push(`${digits[index]}${suffix}`);
    });
  }

  return sequences;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
