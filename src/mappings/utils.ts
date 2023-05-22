import BigNumber from "bignumber.js";

// 佣金发放账户
export const PAY_OUT_ACCOUNT =
  "gXCcrjjFX3RPyhHYgwZDmw8oe4JFpd5anko3nTY8VrmnJpe";

// token precisions
export const TEN_ZEROS = 10000000000;
export const TWELVE_ZEROS = 1000000000000;
export const EIGHTEEN_ZEROS = 1000000000000000000;

export function sortZenlinkAssetId(id_1: number, id_2: number) {
  let c_discr_1 = (id_1 & 0x0000_0000_0000_ff00) >> 8;
  let c_discr_2 = (id_2 & 0x0000_0000_0000_ff00) >> 8;

  let t_discr_1 = (id_1 & 0x0000_0000_0000_00ff) >> 0;
  let t_discr_2 = (id_2 & 0x0000_0000_0000_00ff) >> 0;

  if (c_discr_1 > c_discr_2) {
    return false;
  } else if (c_discr_1 == c_discr_2 && t_discr_1 > t_discr_2) {
    return false;
  } else {
    return true;
  }
}

// Convert from Zenlink AssetId to Bifrost Currency.
export function convertFromZenlinkAssetId(id: number) {
  let c_discr = (id & 0x0000_0000_0000_ff00) >> 8;
  let t_discr = (id & 0x0000_0000_0000_00ff) >> 0;

  let tokenName;
  switch (t_discr) {
    case 0:
      tokenName = "BNC";
      break;
    case 1:
      tokenName = "BNC";
      break;
    case 2:
      tokenName = "KUSD";
      break;
    case 3:
      tokenName = "DOT";
      break;
    case 4:
      tokenName = "KSM";
      break;
    case 5:
      tokenName = "ETH";
      break;
    case 6:
      tokenName = "KAR";
      break;
    case 7:
      tokenName = "ZLK";
      break;
    case 8:
      tokenName = "PHA";
      break;
    case 9:
      tokenName = "RMRK";
      break;
    case 10:
      tokenName = "MOVR";
      break;
    default:
      tokenName = null;
  }

  let tokenType, prefix;
  switch (c_discr) {
    case 0:
      tokenType = "Native";
      prefix = "";
      break;
    case 1:
      tokenType = "VToken";
      prefix = "V";
      break;
    case 2:
      tokenType = "Token";
      prefix = "";
      break;
    case 3:
      tokenType = "Stable";
      prefix = "";
      break;
    case 4:
      tokenType = "VSToken";
      prefix = "VS";
      break;
    default:
      tokenType = null;
      prefix = "";
  }

  return { tokenType, tokenName, prefix };
}

// hex to string
export function hex_to_ascii(str1) {
  var hex = str1.toString();
  if (hex.startsWith("0x")) {
    hex = hex.substring(2, hex.length);
  }
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

// get token name in string
export async function getTokenName(currencyId) {
  let tokenName;

  if (currencyId.token || currencyId.native) {
    tokenName = currencyId.token ? currencyId.token : currencyId.native;
    // token2 type
  } else {
    let tokenId = currencyId.token2;

    let metadata = (
      await api.query.assetRegistry.currencyMetadatas({ Token2: tokenId })
    ).toString();

    let meta = JSON.parse(metadata);
    tokenName = hex_to_ascii(meta.symbol).toUpperCase();
  }

  return tokenName;
}

// get exchange rate.
export async function getExchangeRate(currencyId) {
  const tokenType = Object.keys(currencyId)[0].toUpperCase();

  let token, vtokenIssuance, poolToken;
  if (tokenType == "TOKEN") {
    token = Object.values(currencyId)[0].toString().toUpperCase();

    // Get Vtoken issuance storage.
    vtokenIssuance = new BigNumber(
      (await api.query.tokens.totalIssuance({ VToken: token })).toString()
    );
    // Get token pooltoken storage.
    poolToken = new BigNumber(
      (await api.query.vtokenMinting.tokenPool({ Token: token })).toString()
    );
    // "TOKEN2"
  } else {
    let tokenId = parseInt(Object.values(currencyId)[0] as string);

    // Get vtoken2 issuance storage.
    vtokenIssuance = new BigNumber(
      (await api.query.tokens.totalIssuance({ VToken2: tokenId })).toString()
    );
    // Get token2 pooltoken storage.
    poolToken = new BigNumber(
      (await api.query.vtokenMinting.tokenPool({ Token2: tokenId })).toString()
    );
  }

  // Calculate exchange rate.
  let exchangeRate = new BigNumber(1);
  if (vtokenIssuance > new BigNumber(0)) {
    exchangeRate = poolToken.div(vtokenIssuance);
  }

  return exchangeRate;
}
