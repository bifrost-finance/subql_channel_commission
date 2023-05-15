import { getTokenName } from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { HostingFeeChargedEvent } from "../types";

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
  const amount = (tokenAmount as Balance).toString();

  record.event = "HostingFeeCharged";
  record.tokenId = tokenName;
  record.amount = amount;
  record.blockHeight = blockNumber;
  record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);

  await record.save();
}
