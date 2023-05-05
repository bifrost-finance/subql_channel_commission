import { makeSureAccount, getPricision } from "./utils";
import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { Balance, AccountId } from "@polkadot/types/interfaces";
import { Add, Subtract } from "../types";
import { BigNumber } from "bignumber.js";

export async function handleUtilityBatchAllCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  console.log(`${extrinsic.block.block.header.hash.toString()}`);

  //   const record = new CallEntity(extrinsic.block.block.header.hash.toString());
  //   record.field4 = extrinsic.block.timestamp;
  //   await record.save();
}
