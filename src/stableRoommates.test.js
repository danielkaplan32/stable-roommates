const { stableRoommates } = require("./stableRoommates");

test("Simple solvable instance returns two pairs", () => {
  const simpleSolvable = [
    { name: "A", preferences: ["B", "C", "D"] },
    { name: "B", preferences: ["A", "C", "D"] },
    { name: "C", preferences: ["D", "A", "B"] },
    { name: "D", preferences: ["C", "A", "B"] },
  ];
  const result = stableRoommates(simpleSolvable);
  expect(result.length).toBe(2);
  expect(result.flat()).toEqual(expect.arrayContaining(["A", "B", "C", "D"]));
});

test("6-person solvable instance returns 3 pairs", () => {
  const input = [
    { name: "A", preferences: ["B", "C", "D", "E", "F"] },
    { name: "B", preferences: ["C", "D", "E", "F", "A"] },
    { name: "C", preferences: ["D", "E", "F", "A", "B"] },
    { name: "D", preferences: ["E", "F", "A", "B", "C"] },
    { name: "E", preferences: ["F", "A", "B", "C", "D"] },
    { name: "F", preferences: ["A", "B", "C", "D", "E"] },
  ];
  const result = stableRoommates(input);
  expect(result.length).toBe(3);
  expect(result.flat()).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
});

test("8-person solvable instance returns 4 pairs", () => {
  const input = [
    { name: "A", preferences: ["B", "C", "D", "E", "F", "G", "H"] },
    { name: "B", preferences: ["C", "D", "E", "F", "G", "H", "A"] },
    { name: "C", preferences: ["D", "E", "F", "G", "H", "A", "B"] },
    { name: "D", preferences: ["E", "F", "G", "H", "A", "B", "C"] },
    { name: "E", preferences: ["F", "G", "H", "A", "B", "C", "D"] },
    { name: "F", preferences: ["G", "H", "A", "B", "C", "D", "E"] },
    { name: "G", preferences: ["H", "A", "B", "C", "D", "E", "F"] },
    { name: "H", preferences: ["A", "B", "C", "D", "E", "F", "G"] },
  ];
  const result = stableRoommates(input);
  expect(result.length).toBe(4);
  expect(result.flat()).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G", "H"]));
});

test("Unsolvable 4-person instance returns empty array", () => {
  const input = [
    { name: "A", preferences: ["B", "C", "D"] },
    { name: "B", preferences: ["C", "A", "D"] },
    { name: "C", preferences: ["A", "B", "D"] },
    { name: "D", preferences: ["A", "B", "C"] },
  ];
  const result = stableRoommates(input);
  expect(result).toEqual([]);
});

test("Odd number of participants returns empty array", () => {
  const input = [
    { name: "A", preferences: ["B", "C"] },
    { name: "B", preferences: ["A", "C"] },
    { name: "C", preferences: ["A", "B"] },
  ];
  const result = stableRoommates(input);
  expect(result).toEqual([]);
});
