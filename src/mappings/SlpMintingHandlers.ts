import { getTokenName } from "./utils";
import { SubstrateEvent } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Event } from "../types";
import BigNumber from "bignumber.js";

// Handing talbe【VtokenMinting】, Event【Minted】
export async function handleVtokenMintingMinted(
  event: SubstrateEvent
): Promise<void> {
  // logger.info(`${event}`);

  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new Event(`${blockNumber.toString()}-${event.idx.toString()}`);

  const {
    event: {
      data: [address, currencyId, _tokenAmount, vtokenAmount],
    },
  } = evt;

  // 默认channelCode是Bifrost
  let channelCode =
    "0x2597b02db29adca18d6f70a494955f58f2a11895b0c3873d71db5172be390f99";

  if (event.extrinsic) {
    // 先看看这个mint是不是带渠道的
    let extrinsicEvents = event.extrinsic.events;
    // 看看这个extrinsic的event数组里有没有Minted事件和remark事件。因为这是从Minted事件进去的，所以只需要找有没有remark事件就好
    for (const extrinsicEvent of extrinsicEvents) {
      if (extrinsicEvent.event.index.toString() == "0x0005") {
        const [fromAccount, forChannelCode] = extrinsicEvent.event.data;

        if (address.toString() == fromAccount.toString()) {
          channelCode = `${forChannelCode.toString()}`;
          logger.info(`remark事件: ${JSON.stringify(extrinsicEvent)}`);
        }
      }

      // token type
      const tokenName = await getTokenName(currencyId);
      const account = (address as AccountId).toString();
      const amount = (vtokenAmount as Balance).toString();

      record.event = "Mint";
      record.account = account;
      record.vtokenId = `V${tokenName.toUpperCase()}`;
      record.amount = new BigNumber(amount).toFixed(0);
      record.blockHeight = blockNumber;
      record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);
      record.channelCode = channelCode;

      await record.save();
    }
  }
}

// Handing talbe【VtokenMinting】, Event【Redeemed】
export async function handleVtokenMintingRedeemed(
  event: SubstrateEvent
): Promise<void> {
  //   logger.info(`${event.event}`);
  let evt = JSON.parse(JSON.stringify(event));
  const blockNumber = event.block.block.header.number.toNumber();
  //   Create the record by constructing id from blockNumber + eventIndex
  const record = new Event(`${blockNumber.toString()}-${event.idx.toString()}`);
  const {
    event: {
      data: [address, currencyId, _tokenAmount, vtokenAmount],
    },
  } = evt;

  const tokenName = await getTokenName(currencyId);
  const account = (address as AccountId).toString();
  const amount = (vtokenAmount as Balance).toString();

  record.event = "Redeem";
  record.account = account;
  record.vtokenId = `V${tokenName.toUpperCase()}`;
  record.amount = new BigNumber(amount).toFixed(0);
  record.blockHeight = blockNumber;
  record.timestamp = Math.floor(event.block.timestamp.getTime() / 1000);
  record.channelCode = null;

  await record.save();
}
