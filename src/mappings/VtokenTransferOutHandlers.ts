import { SubstrateEvent } from "@subql/types";
import { Event, CommissionPaid } from "../types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { hex_to_ascii, PAY_OUT_ACCOUNT } from "./utils";
import BigNumber from "bignumber.js";

// Handing talbe【Tokens】, Event【Transfer】
export async function handleVtokenTransferOut(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  const evt = JSON.parse(JSON.stringify(event));
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new Event(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [currencyId, address, to, vtokenAmount],
    },
  } = evt;

  const tokenType = Object.keys(currencyId)[0].toUpperCase();

  // "eCSrvaystgdffuJxPVYKf8H8UYnHGNRdVGUvj1SWSiatWMq" is the vksm-ksm swap pool account.
  // "eCSrvbA5gGNYdM3UjBNxcBNBqGxtz3SEEfydKragtL4pJ4F" is the Bifrost treasury account for charging vtoken redeeming fee.
  // "eCSrvbA5gGMTkdAd9pGvdbNfkKmHKNwGR8uWsrh1G3aWSRG" is the VKSM single token liquidity-mining pool account for mainnet. pool id 56.
  // "eCSrvbA5gGMTkdAd9Z5P96SQ4UheKhx4pWNg5Pu734mRHbm" is one of the two VKSM single token liquidity-mining pools account for TESTNET. pool id is 0.
  // "eCSrvbA5gGMTkdAd9ZcsCBcd3q6ZRuhYAPPmxma2gpDxSVe" is one of the two VKSM single token liquidity-mining pools account for TESTNET. pool id is 2.
  // "eCSrvbA5gGMTkdAd9qddmKKEDhka5tJwmqTGbHsKPRDrSys" is the VKSM single token liquidity-mining pool account for mainnet. pool id 61.
  // "eCSrvbA5gGMTkdAd9ribsVfgCQYQJHotTbVUN3DAgv8vw4X" is the VKSM single token liquidity-mining pool account for mainnet. pool id 65.
  // "eCSrvbA5gGMTkdAd9tM42mCMATj9cu4JVEYn2ADweAWYtUH" is the VKSM single token liquidity-mining pool account for mainnet. pool id 71.
  // "eCSrvbA5gGLejANY2YTH6rTd7JxtybT57MyGfGdfqbBPVdZ" is the VKSM single token liquidity-mining pool account for mainnet.
  // "eCSrvbA5gGMTkdAd9ttY5rNa9p84j6omq7ZsuXtsHuy5uox" is the VKSM single token liquidity-mining pool account for mainnet. pool id 73.
  // "eCSrvaystgdffuJxPVRct68qJUZs1sFz762d7d37KJvb7Pz" is the VDOT-DOT zenlink pool for bifrost-polkadot.
  // "eCSrvbA5gGLejANY2XNJzg7B8cB4mBx8Rbw4tXHpY6GK5YE" is the vDOT farming Pool.
  // "eCSrvaystgdffuJxPVQfmrQY3XBfm6FPSBj1nJwmT48ASum" is the VMOVR farming pool account form bifrost-kusama.
  // "eCSrvaystgdffuJxPVZ7pEK8ZMmZ7Nwg2144eZYgWdx4g6v" is the VBNC farming pool account form bifrost-kusama.
  // "eCSrvaystgdffuJxPVbKj318eoUb12vu85hWk7CQFktdf79" is the VGLMR farming pool account form bifrost-polkadot.
  // "eCSrvaystgdffuJxPVNFYzcsVNZLG9E8TgSkUG1GcjD519E" is the vKSM/USDT LP tranding pair address.
  // "eCSrvbA5gGLejANY2bSSPqvrYk8w4i5AVhaL2ppkvDCMYFi" is the vKSM/USDT Farming Pool address.

  let poolAccountList = [
    "eCSrvaystgdffuJxPVYKf8H8UYnHGNRdVGUvj1SWSiatWMq",
    "eCSrvbA5gGNYdM3UjBNxcBNBqGxtz3SEEfydKragtL4pJ4F",
    "eCSrvbA5gGMTkdAd9pGvdbNfkKmHKNwGR8uWsrh1G3aWSRG",
    "eCSrvbA5gGMTkdAd9Z5P96SQ4UheKhx4pWNg5Pu734mRHbm",
    "eCSrvbA5gGMTkdAd9ZcsCBcd3q6ZRuhYAPPmxma2gpDxSVe",
    "eCSrvbA5gGMTkdAd9qddmKKEDhka5tJwmqTGbHsKPRDrSys",
    "eCSrvbA5gGMTkdAd9ribsVfgCQYQJHotTbVUN3DAgv8vw4X",
    "eCSrvbA5gGMTkdAd9tM42mCMATj9cu4JVEYn2ADweAWYtUH",
    "eCSrvbA5gGLejANY2YTH6rTd7JxtybT57MyGfGdfqbBPVdZ",
    "eCSrvbA5gGMTkdAd9ttY5rNa9p84j6omq7ZsuXtsHuy5uox",
    "eCSrvaystgdffuJxPVRct68qJUZs1sFz762d7d37KJvb7Pz",
    "eCSrvbA5gGLejANY2XNJzg7B8cB4mBx8Rbw4tXHpY6GK5YE",
    "eCSrvaystgdffuJxPVQfmrQY3XBfm6FPSBj1nJwmT48ASum",
    "eCSrvaystgdffuJxPVZ7pEK8ZMmZ7Nwg2144eZYgWdx4g6v",
    "eCSrvaystgdffuJxPVbKj318eoUb12vu85hWk7CQFktdf79",
    "eCSrvaystgdffuJxPVNFYzcsVNZLG9E8TgSkUG1GcjD519E",
    "eCSrvbA5gGLejANY2bSSPqvrYk8w4i5AVhaL2ppkvDCMYFi",
    "eCSrvbCVq8SWbxEi84eYaujvcegwkftytbeD7YZ2ieCJosL",
    "eCSrvbCVq8SWbxEi85C2dzv9c15rrseTEUfJzvDxNPeqmc4",
    "eCSrvbCVq8SWbxEi84vHcTL37KtQJmmiZY9m4EPVYWvaNmb",
    "eCSrvbCVq8SWbxEi85TmfYWG6gHKQyXBuRArwc4RCGP7ewN",
    "eCSrvaystgdffuJxPVS4SfFvaM26m6tAxwDLPvawBAYbnJd",
    "eCSrvaystgdffuJxPVPVePp3f8Zegp8AuNsTv4FApKHtAt9",
    "eCSrvaystgdffuJxPVLqSvWj7Qbjjd11SJEdYBQzs3FdYSk",
    "eCSrvaystgdffuJxPVSiQp5vXbGHHEbgQQQUaVb2ychB9Vz",
    "eCSrvbA5gGLejANY2XNJzg7B8cB4mBx8Rbw4tXHpY6GK5YE",
  ];

  // If it is vtoken2 and the "to"+ "from" addresses are not vtoken swap pool account and not treasury account.
  if (
    tokenType.startsWith("VTOKEN") &&
    !poolAccountList.includes((to as AccountId).toString()) &&
    !poolAccountList.includes((address as AccountId).toString())
  ) {
    const account = (address as AccountId).toString();
    const amount = (vtokenAmount as Balance).toString();

    let token;
    let vtoken;
    if (tokenType == "VTOKEN") {
      token = Object.values(currencyId)[0].toString().toUpperCase();
      vtoken = "V".concat(token);

      // "VTOKEN2"
    } else {
      let tokenId = parseInt(Object.values(currencyId)[0] as string);

      let metadata = (
        await api.query.assetRegistry.currencyMetadatas({ VToken2: tokenId })
      ).toString();

      let meta = JSON.parse(metadata);
      vtoken = hex_to_ascii(meta.symbol).toUpperCase();
      token = vtoken.substring(1);
    }

    record.event = "TransferOut";
    record.account = account;
    record.vtokenId = vtoken;
    record.amount = new BigNumber(amount).toFixed(0);
    record.blockHeight = blockNumber;
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);
    record.channelCode = null;

    await record.save();
  }
}

// Handing talbe【Tokens】, Event【Transfer】
// 某个固定账号转出的所有token
export async function handleCommissionPaid(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event}`);
  const blockNumber = event.block.block.header.number.toNumber();
  const evt = JSON.parse(JSON.stringify(event));
  //Create the record by constructing id from blockNumber + eventIndex
  const record = new CommissionPaid(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [currencyId, address, to, tokenAmount],
    },
  } = evt;

  const tokenType = Object.keys(currencyId)[0].toUpperCase();
  const account = (address as AccountId).toString();

  // If it is vtoken2 and the "to"+ "from" addresses are not vtoken swap pool account and not treasury account.
  if (account == PAY_OUT_ACCOUNT) {
    const amount = (tokenAmount as Balance).toString();
    const toAccount = (to as AccountId).toString();

    let token;
    if (
      tokenType == "TOKEN" ||
      tokenType == "NATIVE" ||
      tokenType == "VTOKEN"
    ) {
      token = Object.values(currencyId)[0].toString().toUpperCase();
      // "VTOKEN2"
    } else if (tokenType == "VTOKEN2" || tokenType == "TOKEN2") {
      let tokenId = parseInt(Object.values(currencyId)[0] as string);

      let metadata = (
        await api.query.assetRegistry.currencyMetadatas({ Token2: tokenId })
      ).toString();

      let meta = JSON.parse(metadata);
      token = hex_to_ascii(meta.symbol).toUpperCase();
    } else {
      return;
    }

    let transferToken = token;
    if (tokenType.startsWith("VTOKEN")) {
      transferToken = `V${token}`;
    }

    record.event = "Transfer";
    record.fromAccount = account;
    record.toAccount = toAccount;
    record.tokenId = transferToken;
    record.amount = new BigNumber(amount).toFixed(0);
    record.blockHeight = blockNumber;
    record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

    await record.save();
  }
}
