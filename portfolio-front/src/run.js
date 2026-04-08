import fs from "node:fs";

const html = fs.readFileSync("./상장법인목록.xls", "utf8");

const rowMatches = [...html.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)];

function stripTags(s) {
  return s
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();
}

const names = [];

for (let i = 1; i < rowMatches.length; i++) {
  const rowHtml = rowMatches[i][1];
  const cellMatches = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];

  if (cellMatches.length < 2) continue;

  const name = stripTags(cellMatches[0][1]);
  const market = stripTags(cellMatches[1][1]);

  if (!name) continue;
  if (market === "코넥스") continue;

  names.push(name);
}

const uniqueSortedNames = [...new Set(names)].sort((a, b) =>
    a.localeCompare(b, "ko-KR")
);

const output = `export const KR_STOCK_NAME_SET = new Set([
${uniqueSortedNames.map((name) => `  ${JSON.stringify(name)},`).join("\n")}
]);
`;

fs.writeFileSync("./krStockNameSet.js", output, "utf8");

console.log("완료");
console.log("개수:", uniqueSortedNames.length);