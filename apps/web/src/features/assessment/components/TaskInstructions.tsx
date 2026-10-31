"use client";

import { Stack, Table, Text } from "@mantine/core";

/**
 * A run of two or more lines that each split on `|` into the same number of
 * cells (at least two) is a data table - the way an author types the figures
 * of a Writing Task 1 in a plain text box. Everything else stays prose.
 */
type Block =
  { kind: "text"; text: string } | { kind: "table"; rows: string[][] };

function cellsOf(line: string): string[] | null {
  if (!line.includes("|")) return null;
  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter(
      (cell, i, all) => !(cell === "" && (i === 0 || i === all.length - 1)),
    );
  // A Markdown separator row (---|---) carries no data.
  if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) return [];
  return cells.length >= 2 ? cells : null;
}

export function splitInstructions(text: string): Block[] {
  const blocks: Block[] = [];
  let prose: string[] = [];
  let rows: string[][] = [];
  const flushProse = () => {
    if (prose.join("").trim())
      blocks.push({ kind: "text", text: prose.join("\n").trim() });
    prose = [];
  };
  const flushRows = () => {
    if (rows.length >= 2 && rows.every((r) => r.length === rows[0].length)) {
      blocks.push({ kind: "table", rows });
    } else if (rows.length) {
      prose.push(...rows.map((r) => r.join(" | ")));
    }
    rows = [];
  };
  for (const line of text.split("\n")) {
    const cells = cellsOf(line);
    if (cells === null) {
      flushRows();
      prose.push(line);
    } else if (cells.length) {
      if (!rows.length) flushProse();
      rows.push(cells);
    }
  }
  flushRows();
  flushProse();
  return blocks;
}

/** The task text for a card preview: prose only, tables left to the task page. */
export function instructionsPreview(text: string): string {
  return splitInstructions(text)
    .filter((block) => block.kind === "text")
    .map((block) => (block.kind === "text" ? block.text : ""))
    .join(" ");
}

export function TaskInstructions({ text }: { text: string }) {
  return (
    <Stack gap="md">
      {splitInstructions(text).map((block, i) =>
        block.kind === "text" ? (
          <Text key={i} style={{ whiteSpace: "pre-wrap" }}>
            {block.text}
          </Text>
        ) : (
          <Table.ScrollContainer key={i} minWidth={320}>
            <Table withTableBorder withColumnBorders striped>
              <Table.Thead>
                <Table.Tr>
                  {block.rows[0].map((cell, c) => (
                    <Table.Th key={c} scope="col">
                      {cell}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {block.rows.slice(1).map((row, r) => (
                  <Table.Tr key={r}>
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <Table.Th key={c} scope="row">
                          {cell}
                        </Table.Th>
                      ) : (
                        <Table.Td key={c} className="tabular-nums">
                          {cell}
                        </Table.Td>
                      ),
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ),
      )}
    </Stack>
  );
}
