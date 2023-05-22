import { getExchangeRate, getTokenName } from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { HostingFeeChargedEvent } from "../types";
import BigNumber from "bignumber.js";

// Handing talbe【Slp】, Event【HostingFeeCharged】
export async function handleSlpHostingFeeCharged(
  event: SubstrateEvent
): Promise<void> {
  // logger.info(`${event}`);

  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new HostingFeeChargedEvent(
    `${blockNumber.toString()}-${event.idx.toString()}`
  );

  const {
    event: {
      data: [currencyId, tokenAmount],
    },
  } = evt;

  const tokenName = await getTokenName(currencyId);
  const vtokenName = `V${tokenName.toUpperCase()}`;
  const amount = (tokenAmount as Balance).toString();
  const exchangeRate = await getExchangeRate(currencyId);

  // 如果是FIL，直接用amount
  if (tokenName == "FIL") {
    record.tokenId = tokenName;
    record.amount = amount;
    // 如果是其他token，需要除以exchangeRatey变成vtoken金额
  } else {
    record.tokenId = vtokenName;
    record.amount = new BigNumber(amount).dividedBy(exchangeRate).toFixed(0);
  }

  record.event = "HostingFeeCharged";
  record.blockHeight = blockNumber;
  record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

  await record.save();
}
