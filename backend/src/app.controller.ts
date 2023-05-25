import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ethers } from 'ethers';
import * as tokenJson from "./assets/MyToken.json";
import { RequestTokensDto } from './dtos/requestTokens.dto';
import { DelegateTokensDto } from './dtos/delegateTokens.dto';
import { CastVoteDto } from './dtos/castVote.dto';

@Controller()
export class AppController {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;

  constructor(private readonly appService: AppService) {
    this.provider = ethers.getDefaultProvider("sepolia")
    this.contract = new ethers.Contract(this.getAddress(), tokenJson.abi, this.provider)
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("last-block")
  getLastBlock() {
    return this.appService.getLastBlock();
  }

  @Get("contract-address")
  getAddress() {
    return this.appService.getAddress()
  }

  @Get("total-supply")
  getTotalSupply() {
    return this.appService.getTotalSupply()
  }

  @Get("balance/:address")
  getBalance(@Param("address") address: string) {
    return this.appService.getBalanceOf(address);
  }

  @Get("transaction-receipt/")
  async getTransactionReceipt(@Query("hash") hash: string) {
    return await this.appService.getTransactionReceipt(hash);
  }

  @Post("request-tokens")
  requestTokens(@Body() body: RequestTokensDto) {
    return this.appService.requestTokens(body.address, body.signature)
  }

  //@Post("delegate-tokens")
  //delegateTokens(@Body() body: DelegateTokensDto) {
  //  return this.appService.delegateTokens(body.address)
  //}

  //@Post("cast-vote")
  //castVote(@Body() body: CastVoteDto) {
  //  return this.appService.castVote()
  //}

  @Get("get-winner")
  async getWinner() {
    return this.appService.getWinner();
  }
}
