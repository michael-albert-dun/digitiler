# Countile

Countile is a small static prototype for tiling rectangular grids with numbered
tetrominoes. It was derived from the UI plumbing of Tilexicon, but replaces word
validation with numeric constraints.

## Run Locally

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

The app is plain HTML, CSS, and JavaScript. There is no build step.

## Puzzle Generation

For the default `4x4` mode, generation currently works like this:

1. Load tetromino tilings from `data/tetromino-tilings-4x4.txt`.
2. Pick a random tiling.
3. Fill each tetromino in left-to-right, top-to-bottom order.
4. Each tetromino receives a uniformly chosen non-decreasing digit sequence from
   digits `1` through `4`, such as `1111`, `1124`, or `2334`.
5. Reject the board unless it has at most two valid solutions.

Solution counting scans the available tilings and stops as soon as a third valid
solution is found.

The `6x6` board is disabled by default because its tiling data is large. It can
be enabled with:

```text
http://127.0.0.1:4173/?enable6x6=true
```

## Experiments

The solution-counting script can generate random `4x4` boards and count how
many valid tiling solutions they have:

```sh
node scripts/count-solutions.js 10
```

For a summary:

```sh
node scripts/count-solutions.js 100 --summary
```

To sample only boards accepted by the app's `<= 2 solutions` rejection rule:

```sh
node scripts/count-solutions.js 100 --accepted-only --summary
```

## Local Git Setup

This directory is not currently a git repository. To make it one:

```sh
git init
git add .
git commit -m "Initial Countile prototype"
```

Optionally, add a remote later:

```sh
git remote add origin <remote-url>
git branch -M main
git push -u origin main
```
