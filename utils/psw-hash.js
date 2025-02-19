const crypto = require("@mtproto/core");
const bigInt = require("big-integer");

module.exports = computeSrpHash = (password, { g, p, salt1, salt2, srp_B }) => {
  const gBigInt = bigInt(g);
  const pBigInt = bigInt(p);

  const a = bigInt.randBetween(1, pBigInt.subtract(1));
  const A = gBigInt.modPow(a, pBigInt);
  const passwordHash = crypto.PBKDF2(password, salt1, 100000, 64, "sha256");
  const x = bigInt(
    crypto
      .createHash("sha256")
      .update(Buffer.concat([salt1, passwordHash, salt2]))
      .digest("hex"),
    16
  );
  const gBInt = bigInt(srp_B, 16);
  const u = bigInt(
    crypto
      .createHash("sha256")
      .update(Buffer.concat([A.toBuffer(), gBInt.toBuffer()]))
      .digest("hex"),
    16
  );
  const k = gBigInt.modPow(x, pBigInt);
  const S = gBInt.subtract(k).modPow(a.add(u.multiply(x)), pBigInt);
  const M1 = crypto
    .createHash("sha256")
    .update(Buffer.concat([A.toBuffer(), gBInt.toBuffer(), S.toBuffer()]))
    .digest("hex");

  return {
    A: A.toString(16),
    M1,
  };
};
