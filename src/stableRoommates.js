export function stableRoommates(participants) {
  const names = participants.map(p => p.name);
  if (names.length % 2 !== 0) return [];

  const players = {};
  names.forEach(name => {
    players[name] = {
      name,
      prefs: participants.find(p => p.name === name).preferences.slice(),
      matching: null
    };
  });

  function deletePair(a, b) {
    players[a].prefs = players[a].prefs.filter(n => n !== b);
    players[b].prefs = players[b].prefs.filter(n => n !== a);
  }

  function firstPhase() {
    const free = [...names];

    while (free.length > 0) {
      const name = free.pop();
      const player = players[name];
      const fav = player.prefs[0];

      if (!fav) return false;

      const favPlayer = players[fav];
      const current = favPlayer.matching;

      if (current !== null) {
        favPlayer.matching = null;
        free.push(current);
      }

      favPlayer.matching = name;

      const successors = favPlayer.prefs.slice(favPlayer.prefs.indexOf(name) + 1);
      for (const s of successors) {
        deletePair(s, fav);
        if (players[s].prefs.length === 0 && free.includes(s)) {
          free.splice(free.indexOf(s), 1);
        }
      }
    }

    return true;
  }

  function locateCycle(startName) {
    const lasts = [startName];
    const seconds = [];
    let name = startName;

    while (true) {
      if (players[name].prefs.length < 2) return null;
      const second = players[name].prefs[1];
      const worst = players[second].prefs[players[second].prefs.length - 1];

      seconds.push(second);
      lasts.push(worst);
      name = worst;

      if (lasts.filter(n => n === name).length > 1) break;
    }

    const idx = lasts.indexOf(name);
    const cycle = [];

    for (let i = idx + 1; i < lasts.length; i++) {
      cycle.push([lasts[i], seconds[i - 1]]);
    }

    return cycle;
  }

  function getPairsToDelete(cycle) {
    const toDelete = [];

    for (let i = 0; i < cycle.length; i++) {
      const [_, right] = cycle[i];
      const [left] = cycle[(i - 1 + cycle.length) % cycle.length];

      const successors = players[right].prefs.slice(players[right].prefs.indexOf(left) + 1);
      for (const succ of successors) {
        const pair = [right, succ];
        const rev = [succ, right];
        if (!toDelete.some(([a, b]) => (a === pair[0] && b === pair[1]) || (a === rev[0] && b === rev[1]))) {
          toDelete.push(pair);
        }
      }
    }

    return toDelete;
  }

  function secondPhase() {
    let candidate = names.find(n => players[n].prefs.length > 1);

    while (candidate) {
      const cycle = locateCycle(candidate);
      if (!cycle) return false;

      const deletions = getPairsToDelete(cycle);
      for (const [a, b] of deletions) {
        deletePair(a, b);
      }

      if (names.some(n => players[n].prefs.length === 0)) return false;
      candidate = names.find(n => players[n].prefs.length > 1);
    }

    // Final matching
    for (const name of names) {
      players[name].matching = players[name].prefs[0];
    }

    return true;
  }

  const ok = firstPhase();
  if (!ok) return [];

  const stable = secondPhase();
  if (!stable) return [];

  const matched = [];
  const used = new Set();

  for (const name of names) {
    const partner = players[name].matching;
    if (partner && !used.has(name) && !used.has(partner)) {
      matched.push([name, partner].sort());
      used.add(name);
      used.add(partner);
    }
  }

  return matched;
}
// module.exports = { stableRoommates };