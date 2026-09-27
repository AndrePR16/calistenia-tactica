const crypto = require("crypto");

function generatePassword(length = 10) {
  // Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil de teclear.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((n) => alphabet[n % alphabet.length])
    .join("");
}

module.exports = { generatePassword };
